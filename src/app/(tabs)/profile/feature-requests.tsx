import { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconChevronUp, IconChevronDown, IconPlus, IconX } from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { ShimmerLine } from '@/components/today/shimmer-line';
import { useFeatureRequests, type FeatureRequestWithVote } from '@/hooks/useFeatureRequests';
import { COLORS, FONTS, TYPE, OPACITY } from '@/lib/theme';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function VoteButton({
  icon,
  active,
  activeColor,
  onPress,
}: {
  icon: 'up' | 'down';
  active: boolean;
  activeColor: string;
  onPress: () => void;
}) {
  const color = active ? activeColor : COLORS.ash;
  return (
    <Pressable onPress={onPress} hitSlop={8} className="items-center">
      {icon === 'up' ? (
        <IconChevronUp size={20} color={color} strokeWidth={active ? 2.5 : 1.5} />
      ) : (
        <IconChevronDown size={20} color={color} strokeWidth={active ? 2.5 : 1.5} />
      )}
    </Pressable>
  );
}

function RequestRow({
  item,
  currentUserId,
  onVote,
}: {
  item: FeatureRequestWithVote;
  currentUserId: string | null;
  onVote: (id: string, v: 1 | -1) => void;
}) {
  const net = item.upvotes - item.downvotes;
  const netColor = net > 0 ? COLORS.amber : net < 0 ? COLORS.red : COLORS.ash;
  const author = item.created_by === currentUserId ? 'You' : 'Community';

  return (
    <View
      className="mb-2.5 flex-row items-start gap-3 rounded-2xl p-4"
      style={{ backgroundColor: COLORS.linen }}>
      {/* Content */}
      <View className="flex-1 gap-1.5">
        <Text
          style={{
            fontFamily: FONTS.uiMedium,
            fontSize: 17,
            color: COLORS.ink,
            lineHeight: 22,
          }}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={{ ...TYPE.bodyS, color: COLORS.ash }}>{item.description}</Text>
        ) : null}
        <Text style={{ ...TYPE.caption, color: COLORS.ash }}>
          {author} · {formatDate(item.created_at)}
        </Text>
      </View>

      {/* Vote column */}
      <View className="items-center gap-1 pt-0.5">
        <VoteButton
          icon="up"
          active={item.userVote === 1}
          activeColor={COLORS.amber}
          onPress={() => onVote(item.id, 1)}
        />
        <Text
          className="min-w-[24px] text-center"
          style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: netColor }}>
          {net > 0 ? `+${net}` : `${net}`}
        </Text>
        <VoteButton
          icon="down"
          active={item.userVote === -1}
          activeColor={COLORS.red}
          onPress={() => onVote(item.id, -1)}
        />
      </View>
    </View>
  );
}

function ShimmerRow() {
  return (
    <View className="mb-2.5 gap-2 rounded-2xl p-4" style={{ backgroundColor: COLORS.linen }}>
      <ShimmerLine width="70%" />
      <ShimmerLine width="90%" />
      <ShimmerLine width="40%" />
    </View>
  );
}

export default function FeatureRequestsScreen() {
  const { requests, loading, submitting, currentUserId, fetchRequests, submitRequest, vote } =
    useFeatureRequests();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleSubmit() {
    const t = title.trim();
    if (!t) return;
    const ok = await submitRequest(t, description.trim() || undefined);
    if (ok) {
      setTitle('');
      setDescription('');
      setShowForm(false);
    }
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: COLORS.parchment }}
      edges={['top', 'bottom']}>
      <ScreenHeader title="Feature Requests" onBack={() => router.back()} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        {/* Suggest button / form */}
        {showForm ? (
          <View className="mb-4 mt-3 rounded-2xl p-4" style={{ backgroundColor: COLORS.linen }}>
            <View className="mb-3 flex-row items-center">
              <Text
                className="flex-1"
                style={{ fontFamily: FONTS.displayLightItalic, fontSize: 22, color: COLORS.ink, lineHeight: 28 }}>
                Suggest a feature
              </Text>
              <Pressable onPress={() => setShowForm(false)} hitSlop={8}>
                <IconX size={18} color={COLORS.ash} strokeWidth={1.5} />
              </Pressable>
            </View>

            <TextInput
              placeholder="Feature title"
              placeholderTextColor={COLORS.ash}
              value={title}
              onChangeText={setTitle}
              className="mb-2 rounded-lg px-3 py-2.5"
              style={{
                fontFamily: FONTS.ui,
                fontSize: 15,
                color: COLORS.ink,
                backgroundColor: COLORS.parchment,
              }}
              returnKeyType="next"
            />
            <TextInput
              placeholder="Description (optional)"
              placeholderTextColor={COLORS.ash}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              className="mb-3 min-h-[72px] rounded-lg px-3 py-2.5"
              style={{
                fontFamily: FONTS.ui,
                fontSize: 14,
                color: COLORS.ink,
                backgroundColor: COLORS.parchment,
                textAlignVertical: 'top',
              }}
            />
            <Pressable
              onPress={handleSubmit}
              disabled={!title.trim() || submitting}
              className="items-center rounded-xl py-[11px]"
              style={{
                backgroundColor: COLORS.amber,
                opacity: !title.trim() || submitting ? OPACITY.disabled : 1,
              }}>
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.parchment} />
              ) : (
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: COLORS.parchment }}>
                  Submit
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowForm(true)}
            className="mb-4 mt-3 flex-row items-center gap-2 rounded-2xl border p-4"
            style={{ backgroundColor: COLORS.linen, borderColor: COLORS.dust }}>
            <IconPlus size={16} color={COLORS.amber} strokeWidth={2} />
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.amber }}>
              Suggest a feature
            </Text>
          </Pressable>
        )}

        {/* List */}
        {loading ? (
          <>
            <ShimmerRow />
            <ShimmerRow />
            <ShimmerRow />
          </>
        ) : requests.length === 0 ? (
          <Text className="mt-8 text-center" style={{ ...TYPE.bodyS, color: COLORS.ash }}>
            No feature requests yet. Be the first to suggest one!
          </Text>
        ) : (
          requests.map((item) => (
            <RequestRow key={item.id} item={item} currentUserId={currentUserId} onVote={vote} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
