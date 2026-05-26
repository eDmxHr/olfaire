import { useState, useCallback } from 'react';
import { supabase, getCurrentUserId, type FeatureRequest, type FeatureRequestVote } from '@/lib/supabase';

export interface FeatureRequestWithVote extends FeatureRequest {
  userVote: 1 | -1 | null;
}

export function useFeatureRequests() {
  const [requests, setRequests] = useState<FeatureRequestWithVote[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);

      const { data: rows, error } = await (supabase as any)
        .from('feature_requests')
        .select('*')
        .order('upvotes', { ascending: false });

      if (error) throw error;

      let voteMap: Record<string, 1 | -1> = {};
      if (userId) {
        const { data: votes } = await (supabase as any)
          .from('feature_request_votes')
          .select('request_id, vote')
          .eq('user_id', userId);
        if (votes) {
          for (const v of votes as FeatureRequestVote[]) {
            voteMap[v.request_id] = v.vote;
          }
        }
      }

      const merged: FeatureRequestWithVote[] = (rows as FeatureRequest[]).map((r) => ({
        ...r,
        userVote: voteMap[r.id] ?? null,
      }));

      merged.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      setRequests(merged);
    } catch (err) {
      console.error('fetchRequests error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function submitRequest(title: string, description?: string): Promise<boolean> {
    const userId = await getCurrentUserId();
    if (!userId) return false;
    setSubmitting(true);
    try {
      const { data, error } = await (supabase as any)
        .from('feature_requests')
        .insert({ title, description: description || null, created_by: userId })
        .select('*')
        .single();
      if (error) throw error;
      const newReq: FeatureRequestWithVote = { ...(data as FeatureRequest), userVote: null };
      setRequests((prev) => [newReq, ...prev]);
      return true;
    } catch (err) {
      console.error('submitRequest error:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  const vote = useCallback(async (requestId: string, v: 1 | -1): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const current = requests.find((r) => r.id === requestId);
    if (!current) return;

    const isSameVote = current.userVote === v;

    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const wasUp = r.userVote === 1;
        const wasDown = r.userVote === -1;
        let upvotes = r.upvotes;
        let downvotes = r.downvotes;

        if (isSameVote) {
          // toggle off
          if (v === 1) upvotes = Math.max(0, upvotes - 1);
          else downvotes = Math.max(0, downvotes - 1);
          return { ...r, userVote: null, upvotes, downvotes };
        }

        // Remove prior vote
        if (wasUp) upvotes = Math.max(0, upvotes - 1);
        if (wasDown) downvotes = Math.max(0, downvotes - 1);

        // Apply new vote
        if (v === 1) upvotes += 1;
        else downvotes += 1;

        return { ...r, userVote: v, upvotes, downvotes };
      })
    );

    try {
      if (isSameVote) {
        await (supabase as any)
          .from('feature_request_votes')
          .delete()
          .eq('user_id', userId)
          .eq('request_id', requestId);
      } else {
        await (supabase as any).from('feature_request_votes').upsert(
          { user_id: userId, request_id: requestId, vote: v },
          { onConflict: 'user_id,request_id' }
        );
      }

      // Refetch from server to keep counts accurate
      const { data } = await (supabase as any)
        .from('feature_requests')
        .select('upvotes, downvotes')
        .eq('id', requestId)
        .single();

      if (data) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, upvotes: data.upvotes, downvotes: data.downvotes } : r
          )
        );
      }
    } catch (err) {
      console.error('vote error:', err);
      // Revert by refetching
      fetchRequests();
    }
  }, [requests, fetchRequests]);

  return { requests, loading, submitting, currentUserId, fetchRequests, submitRequest, vote };
}
