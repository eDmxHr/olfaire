import { View } from 'react-native';
import { COLORS } from '@/lib/theme';

export function ProgressDots({ current, total = 3 }: { current: number; total?: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((i) => {
        const active = i === current;
        return (
          <View
            key={i}
            className="h-1.5 rounded-full"
            style={{
              width: active ? 24 : 6,
              backgroundColor: active ? COLORS.amber : COLORS.dust,
            }}
          />
        );
      })}
    </View>
  );
}
