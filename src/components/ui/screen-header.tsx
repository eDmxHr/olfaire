import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { IconChevronLeft } from '@tabler/icons-react-native';

import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  tint?: string;
}

const SIDE_WIDTH = 40;

export function ScreenHeader({ title, onBack, right, tint }: Props) {
  const color = tint ?? COLORS.ink;

  return (
    <View className="flex-row items-center px-2.5 pb-6 pt-3">
      {/* Left */}
      <View style={{ width: SIDE_WIDTH }}>
        <Pressable
          onPress={onBack ?? (() => router.back())}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <IconChevronLeft size={22} color={color} strokeWidth={1.5} />
        </Pressable>
      </View>

      {/* Center */}
      <View className="flex-1 items-center">
        <Text
          numberOfLines={1}
          style={{
            fontFamily: FONTS.displayLightItalic,
            fontSize: 24,
            color,
          }}>
          {title}
        </Text>
      </View>

      {/* Right */}
      <View style={{ width: SIDE_WIDTH }} className="items-end">
        {right}
      </View>
    </View>
  );
}
