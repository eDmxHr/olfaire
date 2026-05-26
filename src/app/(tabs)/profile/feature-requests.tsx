import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconChevronUp, IconChevronDown, IconPlus, IconX } from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useFeatureRequests, type FeatureRequestWithVote } from '@/hooks/useFeatureRequests';
import { COLORS, FONTS } from '@/lib/theme';

function VoteButton({
  icon,
  count,
  active,
  activeColor,
  onPress,
}: {
  icon: 'up' | 'down';
  count: number;
  active: boolean;
  activeColor: string;
  onPress: () => void;
}) {
  const color = active ? activeColor : COLORS.ash;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={{ alignItems: 'center', gap: 2, minWidth: 32 }}>
      {icon === 'up' ? (
        <IconChevronUp size={18} color={color} strokeWidth={active ? 2.5 : 1.5} />
      ) : (
        <IconChevronDown size={18} color={color} strokeWidth={active ? 2.5 : 1.5} />
      )}
      <Text
        style={{
          fontFamily: active ? FONTS.uiMedium : FONTS.ui,
          fontSize: 12,
          color,
        }}>
        {count}
      </Text>
    </Pressable>
  );
}

function RequestRow({
  item,
  onVote,
}: {
  item: FeatureRequestWithVote;
  onVote: (id: string, v: 1 | -1) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: COLORS.linen,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink, marginBottom: 2 }}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 10, paddingTop: 2 }}>
        <VoteButton
          icon="up"
          count={item.upvotes}
          active={item.userVote === 1}
          activeColor={COLORS.amber}
          onPress={() => onVote(item.id, 1)}
        />
        <VoteButton
          icon="down"
          count={item.downvotes}
          active={item.userVote === -1}
          activeColor={COLORS.red}
          onPress={() => onVote(item.id, -1)}
        />
      </View>
    </View>
  );
}

export default function FeatureRequestsScreen() {
  const { requests, loading, submitting, fetchRequests, submitRequest, vote } = useFeatureRequests();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top', 'bottom']}>
      <ScreenHeader title="Feature Requests" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>

        {/* Suggest button / form */}
        {showForm ? (
          <View
            style={{
              backgroundColor: COLORS.linen,
              borderRadius: 12,
              padding: 14,
              marginTop: 16,
              marginBottom: 16,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: COLORS.ink, flex: 1 }}>
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
              style={{
                fontFamily: FONTS.ui,
                fontSize: 15,
                color: COLORS.ink,
                backgroundColor: COLORS.parchment,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 8,
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
              style={{
                fontFamily: FONTS.ui,
                fontSize: 14,
                color: COLORS.ink,
                backgroundColor: COLORS.parchment,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
                minHeight: 72,
                textAlignVertical: 'top',
              }}
            />
            <Pressable
              onPress={handleSubmit}
              disabled={!title.trim() || submitting}
              style={{
                backgroundColor: COLORS.amber,
                borderRadius: 10,
                paddingVertical: 11,
                alignItems: 'center',
                opacity: !title.trim() || submitting ? 0.5 : 1,
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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: COLORS.linen,
              borderRadius: 12,
              padding: 14,
              marginTop: 16,
              marginBottom: 16,
            }}>
            <IconPlus size={16} color={COLORS.amber} strokeWidth={2} />
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: COLORS.amber }}>
              Suggest a feature
            </Text>
          </Pressable>
        )}

        {/* List */}
        {loading ? (
          <ActivityIndicator color={COLORS.ash} style={{ marginTop: 32 }} />
        ) : requests.length === 0 ? (
          <Text
            style={{
              fontFamily: FONTS.ui,
              fontSize: 14,
              color: COLORS.ash,
              textAlign: 'center',
              marginTop: 32,
            }}>
            No feature requests yet. Be the first to suggest one!
          </Text>
        ) : (
          requests.map((item) => (
            <RequestRow key={item.id} item={item} onVote={vote} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
