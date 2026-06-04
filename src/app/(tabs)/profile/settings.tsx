import { useState } from 'react';
import {
  Alert,
  Linking,
  View,
  ScrollView,
  Switch,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import {
  IconCrown,
  IconLogout,
  IconTrash,
  IconPencil,
  IconCamera,
  IconChevronRight,
  IconBulb,
} from '@tabler/icons-react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { TimePickerModal } from '@/components/profile/time-picker-modal';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/hooks/useProfile';
import { syncPremiumStatus } from '@/lib/revenueCat';
import { COLORS, FONTS } from '@/lib/theme';
import { SectionLabel } from '@/components/ui/section-label';
import type { SkinType, Theme } from '@/lib/supabase';

function RowDivider() {
  return <View style={{ height: 1, backgroundColor: COLORS.dust }} />;
}

function timeStringToDate(timeStr: string): Date {
  const [h, m] = (timeStr || '08:00').split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatTime(timeStr: string): string {
  const [h, m] = (timeStr || '08:00').split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export default function SettingsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const isPremium = useAuthStore((s) => s.isPremium());
  const { setTheme, setSkinType, setNotifications, uploadAvatar, updateProfile, signOut } =
    useProfile();

  const [isEditing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [isUploadingAvatar, setUploadingAvatar] = useState(false);

  const [isTimePickerVisible, setShowTimePicker] = useState(false);

  function startEditing() {
    setDraftName(profile?.display_name ?? '');
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setDraftName('');
  }

  async function saveProfile() {
    const name = draftName.trim();
    setSavingName(true);
    try {
      if (name && name !== profile?.display_name) {
        await updateProfile({ display_name: name });
      }
    } finally {
      setSavingName(false);
      setEditing(false);
    }
  }

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo access to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(result.assets[0].uri);
    } catch {
      Alert.alert('Upload failed', 'Could not update your avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  function onTimeChange(_: any, date?: Date) {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (date) setNotifications(true, dateToTimeString(date));
  }

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        {/* ── Account ── */}
        <SectionLabel style={{ marginTop: 28, marginBottom: 10 }}>Account</SectionLabel>
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 14,
          }}>
          <View className="flex-row items-center gap-3">
            {/* Avatar */}
            <Pressable onPress={isEditing ? pickAvatar : undefined} style={{ position: 'relative' }}>
              <Avatar
                key={profile?.avatar_url ?? 'no-avatar'}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                alt={profile?.display_name || ''}>
                {profile?.avatar_url ? <AvatarImage source={{ uri: profile.avatar_url }} /> : null}
                <AvatarFallback
                  style={{
                    backgroundColor: COLORS.dust,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                  }}>
                  <Text
                    style={{
                      fontFamily: FONTS.displayLightItalic,
                      fontSize: 22,
                      color: COLORS.amber,
                    }}>
                    {profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: COLORS.amber,
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color={COLORS.parchment} />
                  ) : (
                    <IconCamera size={11} color={COLORS.parchment} strokeWidth={2} />
                  )}
                </View>
              )}
            </Pressable>

            {/* Name */}
            <View className="flex-1">
              {isEditing ? (
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  style={{
                    fontFamily: FONTS.uiMedium,
                    fontSize: 15,
                    color: COLORS.ink,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.amber,
                    paddingBottom: 2,
                  }}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={saveProfile}
                />
              ) : (
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
                  {profile?.display_name ?? ''}
                </Text>
              )}
            </View>

            {/* Edit / Save / Cancel */}
            {isEditing ? (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={cancelEditing}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: COLORS.dust,
                  }}>
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={saveProfile}
                  disabled={savingName}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: COLORS.amber,
                    opacity: savingName ? 0.7 : 1,
                  }}>
                  {savingName
                    ? <ActivityIndicator size="small" color={COLORS.parchment} />
                    : <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.parchment }}>
                        Save
                      </Text>
                  }
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={startEditing} hitSlop={8}>
                <IconPencil size={17} color={COLORS.ash} strokeWidth={1.5} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Preferences ── */}
        <SectionLabel style={{ marginTop: 28, marginBottom: 10 }}>Preferences</SectionLabel>
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
          }}>
          {/* Notifications toggle */}
          <View className="flex-row items-center justify-between" style={{ paddingVertical: 14 }}>
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink }}>
              Morning reminder
            </Text>
            <Switch
              value={profile?.notification_enabled ?? false}
              onValueChange={(val) => {
                setNotifications(val);
                if (!val) setShowTimePicker(false);
              }}
              trackColor={{ false: COLORS.dust, true: COLORS.amber }}
              thumbColor={COLORS.parchment}
            />
          </View>

          {profile?.notification_enabled && (
            <>
              <RowDivider />
              {/* Time row — tap to open picker */}
              <Pressable
                className="flex-row items-center justify-between"
                style={{ paddingVertical: 14 }}
                onPress={() => setShowTimePicker(true)}>
                <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink }}>
                  Reminder time
                </Text>
                <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink }}>
                  {formatTime(profile.notification_time ?? '08:00')}
                </Text>
              </Pressable>

              {/* iOS: modal bottom sheet */}
              {Platform.OS === 'ios' && (
                <TimePickerModal
                  visible={isTimePickerVisible}
                  value={timeStringToDate(profile.notification_time ?? '08:00')}
                  onChange={onTimeChange}
                  onClose={() => setShowTimePicker(false)}
                />
              )}

              {/* Android: native picker, conditional */}
              {Platform.OS === 'android' && isTimePickerVisible && (
                <DateTimePicker
                  mode="time"
                  display="default"
                  value={timeStringToDate(profile.notification_time ?? '08:00')}
                  onChange={onTimeChange}
                  themeVariant="light"
                />
              )}
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
        <SectionLabel style={{ marginTop: 28, marginBottom: 10 }}>Subscription</SectionLabel>
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
          }}>
          <Pressable
            onPress={() => !isPremium && router.push('/modals/premium-gate')}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 14 }}>
            <IconCrown size={20} color={COLORS.amber} strokeWidth={1.5} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink, flex: 1 }}>
              {isPremium ? 'Olfaire Pro' : 'Free plan'}
            </Text>
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.ink }}>
              {isPremium ? 'Active' : 'Upgrade'}
            </Text>
          </Pressable>

          <View style={{ height: 1, backgroundColor: COLORS.dust }} />

          {isPremium ? (
            <Pressable
              onPress={async () => {
                try {
                  await RevenueCatUI.presentCustomerCenter({
                    callbacks: {
                      onRestoreCompleted: async () => { await syncPremiumStatus(); },
                    },
                  });
                } catch {
                  // Native Customer Center unavailable (e.g. Expo Go) — open Apple's subscription page
                  Linking.openURL('https://apps.apple.com/account/subscriptions');
                }
              }}
              className="flex-row items-center gap-3"
              style={{ paddingVertical: 14 }}>
              <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink, flex: 1 }}>
                Manage subscription
              </Text>
              <IconChevronRight size={16} color={COLORS.ash} strokeWidth={1.5} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/modals/premium-gate')}
              className="flex-row items-center gap-3"
              style={{ paddingVertical: 14 }}>
              <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ash, flex: 1 }}>
                Restore purchases
              </Text>
            </Pressable>
          )}
        </View>

        {/* ── Community ── */}
        <SectionLabel style={{ marginTop: 28, marginBottom: 10 }}>Community</SectionLabel>
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
          }}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile/feature-requests')}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 14 }}>
            <IconBulb size={20} color={COLORS.amber} strokeWidth={1.5} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink, flex: 1 }}>
              Feature requests
            </Text>
            <IconChevronRight size={16} color={COLORS.ash} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* ── Legal ── */}
        <SectionLabel style={{ marginTop: 28, marginBottom: 10 }}>Legal</SectionLabel>
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
          }}>
          <Pressable
            onPress={() => Linking.openURL('https://olfaire.app/terms')}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 14 }}>
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink, flex: 1 }}>
              Terms & Conditions
            </Text>
            <IconChevronRight size={16} color={COLORS.ash} strokeWidth={1.5} />
          </Pressable>

          <RowDivider />

          <Pressable
            onPress={() => Linking.openURL('https://olfaire.app/privacy')}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 14 }}>
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink, flex: 1 }}>
              Privacy Policy
            </Text>
            <IconChevronRight size={16} color={COLORS.ash} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* ── Account actions ── */}
        <SectionLabel style={{ marginTop: 28, marginBottom: 10 }}>Account</SectionLabel>
        <View
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 12,
            paddingHorizontal: 14,
          }}>
          <Pressable
            onPress={confirmSignOut}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 14 }}>
            <IconLogout size={20} color={COLORS.ash} strokeWidth={1.5} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink }}>Sign out</Text>
          </Pressable>

          <RowDivider />

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
    </KeyboardAvoidingView>
  );
}
