import { Alert, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { IconNotes, IconShare3, IconTrash } from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useLayeringStore } from '@/store/LayeringStore';
import { useLayering } from '@/hooks/useLayering';
import { COLORS, FONTS } from '@/lib/theme';

export default function SignaturesScreen() {
  const signatures = useLayeringStore((s) => s.signatures);
  const { deleteSignature } = useLayering();

  function confirmDelete(id: string, name: string) {
    Alert.alert('Delete signature?', name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSignature(id),
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="Signatures" onBack={() => router.navigate('/(tabs)/profile')} />

      {signatures.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <IconNotes size={40} color={COLORS.ash} strokeWidth={1.2} />
          <Text style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.ash }}>
            No signatures yet
          </Text>
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
                style={{
                  backgroundColor: COLORS.linen,
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  marginBottom: 10,
                }}>
                <View className="flex-row items-start justify-between">
                  <Text
                    className="flex-1"
                    style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: COLORS.ink }}>
                    {sig.name}
                  </Text>
                  <Text
                    className="ml-2"
                    style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                    {date}
                  </Text>
                </View>

                {sig.fragrance_a_name && sig.fragrance_b_name ? (
                  <Text
                    style={{
                      fontFamily: FONTS.displayLightItalic,
                      fontSize: 13,
                      color: COLORS.ash,
                    }}>
                    {sig.fragrance_a_name} × {sig.fragrance_b_name}
                  </Text>
                ) : null}

                <View className="mt-1.5 flex-row items-center justify-between">
                  <View className="flex-1 flex-row flex-wrap gap-1.5">
                    {sig.tags.map((tag) => (
                      <View
                        key={tag}
                        style={{
                          backgroundColor: COLORS.parchment,
                          borderRadius: 99,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}>
                        <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                          {tag}
                        </Text>
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
