import { Alert, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconShare3, IconTrash, IconSignature } from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/ui/empty-state';
import { useLayeringStore } from '@/store/LayeringStore';
import { useLayering } from '@/hooks/useLayering';
import { COLORS, FONTS, TYPE } from '@/lib/theme';

export default function SignaturesScreen() {
  const signatures = useLayeringStore((s) => s.signatures);
  const { deleteSignature } = useLayering();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function confirmDelete(id: string, name: string) {
    Alert.alert('Delete signature?', name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await deleteSignature(id);
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="Signatures" onBack={() => router.back()} />

      {signatures.length === 0 ? (
        <EmptyState
          icon={
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.linen, alignItems: 'center', justifyContent: 'center' }}>
              <IconSignature size={36} color={COLORS.ash} strokeWidth={1.2} />
            </View>
          }
          title="No signatures yet"
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}>
          {signatures.map((sig) => {
            const date = new Date(sig.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <View
                key={sig.id}
                className="mb-2.5 rounded-2xl px-4 py-3.5"
                style={{ backgroundColor: COLORS.linen }}>
                {/* Name + date */}
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1" style={[TYPE.displayS, { color: COLORS.ink }]}>
                    {sig.name}
                  </Text>
                  <Text className="ml-2" style={{ ...TYPE.caption, color: COLORS.ash }}>
                    {date}
                  </Text>
                </View>

                {/* Blend subtitle */}
                {sig.fragrance_a_name && sig.fragrance_b_name ? (
                  <Text
                    className="mt-0.5"
                    style={{
                      fontFamily: FONTS.uiLight,
                      fontSize: 12,
                      color: COLORS.ash,
                      lineHeight: 20,
                    }}>
                    {sig.fragrance_a_name} × {sig.fragrance_b_name}
                  </Text>
                ) : null}

                {/* Tags + actions */}
                <View className="mt-2 flex-row items-center justify-between">
                  <View className="flex-1 flex-row flex-wrap gap-1.5">
                    {sig.tags.map((tag) => (
                      <View
                        key={tag}
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: COLORS.parchment }}>
                        <Text style={{ ...TYPE.caption, color: COLORS.ash }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <View className="ml-3 flex-row items-center gap-3">
                    <Pressable
                      onPress={() => router.push(`/modals/signature-share?signatureId=${sig.id}`)}
                      hitSlop={14}>
                      <IconShare3 size={18} color={COLORS.amber} strokeWidth={1.5} />
                    </Pressable>
                    <Pressable
                      onPress={() => confirmDelete(sig.id, sig.name)}
                      disabled={deletingId === sig.id}
                      hitSlop={14}>
                      {deletingId === sig.id
                        ? <ActivityIndicator size="small" color={COLORS.ash} />
                        : <IconTrash size={18} color={COLORS.ash} strokeWidth={1.5} />
                      }
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
