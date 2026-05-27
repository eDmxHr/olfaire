import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';
import type { StockLevel } from '@/lib/supabase';

const LEVELS: { value: StockLevel; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'medium', label: 'Half' },
  { value: 'low', label: 'Low' },
  { value: 'empty', label: 'Empty' },
];

interface StockLevelPickerProps {
  value: StockLevel;
  onChange: (level: StockLevel) => void;
}

export function StockLevelPicker({ value, onChange }: StockLevelPickerProps) {
  return (
    <View className="flex-row gap-2">
      {LEVELS.map(({ value: v, label }) => {
        const active = value === v;
        return (
          <Pressable
            key={v}
            className="flex-1 items-center rounded-full py-2.5"
            style={{ backgroundColor: active ? COLORS.amber : COLORS.dust }}
            onPress={() => onChange(v)}>
            <Text
              style={{
                fontFamily: active ? FONTS.uiMedium : FONTS.ui,
                fontSize: 13,
                color: active ? COLORS.parchment : COLORS.ink,
              }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
