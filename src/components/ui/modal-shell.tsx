import { View, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/theme';

interface ModalShellProps {
  children: React.ReactNode;
  onDismiss?: () => void;
  maxHeight?: `${number}%` | number;
}

export function ModalShell({ children, onDismiss, maxHeight = '92%' }: ModalShellProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BlurView
        intensity={20}
        tint="dark"
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View
          style={{
            backgroundColor: COLORS.parchment,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: insets.bottom + 16,
            maxHeight,
          }}>
          {children}
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
}
