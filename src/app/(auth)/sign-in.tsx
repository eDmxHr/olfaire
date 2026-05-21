import { View, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Screen } from '@/components/screen-wrapper';
import { GoogleLogo } from '@/components/google-logo';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/useAuth';
import { FONTS } from '@/lib/theme';
import { IconChevronLeft, IconLoader } from '@tabler/icons-react-native';

export default function SignInScreen() {
  const { signInWithGoogle, signInWithApple, loading, error } = useAuth();

  return (
    <Screen
      header={
        <Pressable onPress={() => router.back()} className="px-4 py-4" hitSlop={12}>
          <Icon icon={IconChevronLeft} size={22} />
        </Pressable>
      }>
      <View className="flex-1 justify-center gap-10">
        <View className="gap-2">
          <Text
            style={{ fontFamily: FONTS.displayLight }}
            className="text-center text-4xl tracking-tight text-foreground">
            Welcome back
          </Text>
          <Text
            style={{ fontFamily: FONTS.ui }}
            className="text-center text-sm text-muted-foreground">
            Sign in to continue
          </Text>
        </View>

        <View className="gap-4">
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={10}
              style={{ height: 44 }}
              onPress={signInWithApple}
            />
          )}

          {Platform.OS === 'ios' && (
            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-border" />
              <Text style={{ fontFamily: FONTS.ui }} className="text-xs text-muted-foreground">
                or
              </Text>
              <View className="h-px flex-1 bg-border" />
            </View>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full flex-row gap-3"
            onPress={signInWithGoogle}
            disabled={loading !== null}>
            {loading === 'google' ? <Icon icon={IconLoader} size={18} /> : <GoogleLogo size={18} />}
            <Text style={{ fontFamily: FONTS.uiMedium }} className="text-base text-foreground">
              Continue with Google
            </Text>
          </Button>

          {error && (
            <Text style={{ fontFamily: FONTS.ui }} className="text-center text-sm text-destructive">
              {error}
            </Text>
          )}
        </View>
      </View>
    </Screen>
  );
}
