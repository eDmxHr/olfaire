import { Alert, View, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import {
  IconCrown,
  IconLogout,
  IconTrash,
} from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/hooks/useProfile';
import { COLORS, FONTS } from '@/lib/theme';
import type { SkinType, Theme } from '@/lib/supabase';

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontFamily: FONTS.uiMedium,
        fontSize: 10,
        color: COLORS.ash,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 28,
        marginBottom: 10,
      }}>
      {label}
    </Text>
  );
}

function RowDivider() {
  return <View style={{ height: 1, backgroundColor: COLORS.dust }} />;
}

export default function SettingsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const isPremium = useAuthStore((s) => s.isPremium());
  const { setTheme, setSkinType, setNotifications, signOut } = useProfile();

  function confirmSignOut() {
    Alert.alert('Sign out?', 'You will need to sign in again to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete account?',
      'This will permanently delete your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Coming soon', 'Account deletion will be available in a future update.'),
        },
      ]
    );
  }

  const skinTypes: { value: SkinType; label: string }[] = [
    { value: 'dry', label: 'Dry' },
    { value: 'normal', label: 'Normal' },
    { value: 'oily', label: 'Oily' },
  ];

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.parchment }}
      edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>

        {/* ── Account ── */}
        <SectionLabel label="Account" />
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 14,
          }}>
          <View className="flex-row items-center gap-3">
            <Avatar style={{ width: 32, height: 32, borderRadius: 16 }}>
              {profile?.avatar_url ? (
                <AvatarImage source={{ uri: profile.avatar_url }} />
              ) : null}
              <AvatarFallback
                style={{
                  backgroundColor: COLORS.dust,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                }}>
                <Text
                  style={{
                    fontFamily: FONTS.displayLightItalic,
                    fontSize: 15,
                    color: COLORS.amber,
                  }}>
                  {profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </AvatarFallback>
            </Avatar>
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
              {profile?.display_name ?? ''}
            </Text>
          </View>
        </View>

        {/* ── Preferences ── */}
        <SectionLabel label="Preferences" />
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
          }}>
          {/* Notifications toggle */}
          <View
            className="flex-row items-center justify-between"
            style={{ paddingVertical: 14 }}>
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink }}>
              Morning reminder
            </Text>
            <Switch
              value={profile?.notification_enabled ?? false}
              onValueChange={(val) => setNotifications(val)}
              trackColor={{ false: COLORS.dust, true: COLORS.amber }}
              thumbColor={COLORS.parchment}
            />
          </View>

          {profile?.notification_enabled && (
            <>
              <RowDivider />
              <View
                className="flex-row items-center justify-between"
                style={{ paddingVertical: 14 }}>
                <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink }}>
                  Reminder time
                </Text>
                <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ash }}>
                  {profile.notification_time ?? '08:00'}
                </Text>
              </View>
            </>
          )}

          <RowDivider />

          {/* Skin type */}
          <View style={{ paddingVertical: 14 }}>
            <Text
              style={{
                fontFamily: FONTS.ui,
                fontSize: 15,
                color: COLORS.ink,
                marginBottom: 10,
              }}>
              Skin type
            </Text>
            <View className="flex-row gap-2">
              {skinTypes.map(({ value, label }) => {
                const active = profile?.skin_type === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setSkinType(value)}
                    style={{
                      backgroundColor: active ? COLORS.ink : COLORS.parchment,
                      borderRadius: 99,
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                    }}>
                    <Text
                      style={{
                        fontFamily: FONTS.uiMedium,
                        fontSize: 13,
                        color: active ? COLORS.parchment : COLORS.ash,
                      }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <RowDivider />

          {/* Theme */}
          <View style={{ paddingVertical: 14 }}>
            <Text
              style={{
                fontFamily: FONTS.ui,
                fontSize: 15,
                color: COLORS.ink,
                marginBottom: 10,
              }}>
              Theme
            </Text>
            <View className="flex-row gap-2">
              {themes.map(({ value, label }) => {
                const active = profile?.theme === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setTheme(value)}
                    style={{
                      backgroundColor: active ? COLORS.ink : COLORS.parchment,
                      borderRadius: 99,
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                    }}>
                    <Text
                      style={{
                        fontFamily: FONTS.uiMedium,
                        fontSize: 13,
                        color: active ? COLORS.parchment : COLORS.ash,
                      }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Subscription ── */}
        <SectionLabel label="Subscription" />
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 14,
          }}>
          <View className="flex-row items-center gap-3">
            <IconCrown size={20} color={COLORS.amber} strokeWidth={1.5} />
            <Text
              style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink, flex: 1 }}>
              {isPremium ? 'Olfaire Premium' : 'Free plan'}
            </Text>
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.amber }}>
              {isPremium ? 'Active' : 'Upgrade'}
            </Text>
          </View>
        </View>

        {/* ── Account actions ── */}
        <SectionLabel label="Account" />
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
          }}>
          {/* Sign out */}
          <Pressable
            onPress={confirmSignOut}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 14 }}>
            <IconLogout size={20} color={COLORS.ash} strokeWidth={1.5} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink }}>
              Sign out
            </Text>
          </Pressable>

          <RowDivider />

          {/* Delete account */}
          <Pressable
            onPress={confirmDeleteAccount}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 14 }}>
            <IconTrash size={20} color={COLORS.red} strokeWidth={1.5} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.red }}>
              Delete account
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
