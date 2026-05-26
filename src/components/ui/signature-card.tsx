import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { TagChip } from '@/components/ui/tag-chip';
import { COLORS, FONTS } from '@/lib/theme';
import type { StyleProp, ViewStyle } from 'react-native';

interface Signature {
  id: string;
  name: string;
  created_at: string;
  tags: string[];
  fragrance_a_name?: string | null;
  fragrance_b_name?: string | null;
}

interface SignatureCardProps {
  signature: Signature;
  nameSize?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SignatureCard({ signature, nameSize = 13, onPress, style }: SignatureCardProps) {
  const date = new Date(signature.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const blendSubtitle =
    signature.fragrance_a_name && signature.fragrance_b_name
      ? `${signature.fragrance_a_name} × ${signature.fragrance_b_name}`
      : null;

  return (
    <Pressable
      onPress={onPress}
      className="mb-2 rounded-[10px] px-3.5 py-3"
      style={[{ backgroundColor: COLORS.linen }, style]}>
      <View className="flex-row items-start justify-between">
        <Text
          className="flex-1"
          style={{ fontFamily: FONTS.uiMedium, fontSize: nameSize, color: COLORS.ink }}>
          {signature.name}
        </Text>
        <Text className="ml-2" style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
          {date}
        </Text>
      </View>
      {blendSubtitle ? (
        <Text style={{ fontFamily: FONTS.displayLightItalic, fontSize: 13, color: COLORS.ash }}>
          {blendSubtitle}
        </Text>
      ) : null}
      {signature.tags.length > 0 && (
        <View className="mt-1.5 flex-row flex-wrap gap-1.5">
          {signature.tags.map((tag) => (
            <TagChip key={tag} label={tag} style={{ backgroundColor: COLORS.parchment }} />
          ))}
        </View>
      )}
    </Pressable>
  );
}
