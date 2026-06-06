import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '@/lib/theme';

type ToastVariant = 'error' | 'info';

interface ToastState {
  message: string;
  variant: ToastVariant;
  id: number;
}

type Listener = (state: ToastState | null) => void;

// Module-level singleton — callable from any hook without prop drilling
let _listener: Listener | null = null;
let _idCounter = 0;

export function showToast(message: string, variant: ToastVariant = 'error') {
  _listener?.({ message, variant, id: ++_idCounter });
}

export function ToastOverlay() {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<ToastState | null>(null);
  const translateY = useSharedValue(48);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    _listener = (state) => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);

      if (!state) {
        translateY.value = withTiming(48, { duration: 220 }, (done) => {
          if (done) runOnJS(setCurrent)(null);
        });
        return;
      }

      // If already visible, snap out then back in so the message updates visibly
      if (current) {
        translateY.value = withTiming(48, { duration: 150 }, (done) => {
          if (done) {
            runOnJS(setCurrent)(state);
            translateY.value = withTiming(0, { duration: 220 });
          }
        });
      } else {
        setCurrent(state);
        translateY.value = withTiming(0, { duration: 220 });
      }

      dismissTimer.current = setTimeout(() => {
        translateY.value = withTiming(48, { duration: 220 }, (done) => {
          if (done) runOnJS(setCurrent)(null);
        });
      }, 3000);
    };

    return () => {
      _listener = null;
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!current) return null;

  const isError = current.variant === 'error';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pill,
        { bottom: insets.bottom + 24 },
        isError && styles.pillError,
        animatedStyle,
      ]}
    >
      <Animated.Text style={styles.text}>{current.message}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: COLORS.inkRaised,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    maxWidth: 320,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  pillError: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
    borderRadius: 8,
  },
  text: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.parchment,
    textAlign: 'center',
  },
});
