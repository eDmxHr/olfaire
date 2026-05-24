import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { IconChevronLeft } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: Props) {
  return (
    <View className="px-5 pb-6 pt-3" style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <IconChevronLeft size={22} color={COLORS.ink} strokeWidth={1.5} />
      </Pressable>
      <Text
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONTS.displayLightItalic,
          fontSize: 24,
          color: COLORS.ink,
        }}>
        {title}
      </Text>
      {right ? <View style={{ marginLeft: 'auto' }}>{right}</View> : null}
    </View>
  );
}
