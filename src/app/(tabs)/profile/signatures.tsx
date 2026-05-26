import { Alert, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconNotes, IconShare3, IconTrash } from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useLayeringStore } from '@/store/LayeringStore';
import { useLayering } from '@/hooks/useLayering';
import { COLORS, FONTS, TYPE } from '@/lib/theme';

export default function SignaturesScreen() {
  const signatures = useLayeringStore((s) => s.signatures);
  const { deleteSignature } = useLayering();

  function confirmDelete(id: string, name: string) {
    Alert.alert('Delete signature?', name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSignature(id) },
    ]);
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="Signatures" onBack={() => router.navigate('/(tabs)/profile')} />

      {signatures.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2.5">
          <IconNotes size={40} color={COLORS.ash} strokeWidth={1.2} />
          <Text style={{ ...TYPE.bodyS, color: COLORS.ash }}>No signatures yet</Text>
        </View>
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
                  <Text
                    className="flex-1"
                    style={{
                      fontFamily: FONTS.displayMedium,
                      fontSize: 17,
                      color: COLORS.ink,
                      lineHeight: 22,
                    }}>
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
                      hitSlop={8}>
                      <IconShare3 size={18} color={COLORS.amber} strokeWidth={1.5} />
                    </Pressable>
                    <Pressable onPress={() => confirmDelete(sig.id, sig.name)} hitSlop={8}>
                      <IconTrash size={18} color={COLORS.ash} strokeWidth={1.5} />
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
