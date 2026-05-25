import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';

export type InteractionType = 'anchor' | 'amplify' | 'contrast' | 'neutral';

export interface NoteInteraction {
  note_a: string;
  note_b: string;
  type: InteractionType;
  explanation: string;
}

const INTERACTION_COLORS: Record<InteractionType, string> = {
  anchor: COLORS.amber,
  amplify: '#6B8F6B',
  contrast: '#8F6B6B',
  neutral: COLORS.inkRaised,
};

export function InteractionCard({ interaction }: { interaction: NoteInteraction }) {
  const badgeColor = INTERACTION_COLORS[interaction.type];
  const isNeutral = interaction.type === 'neutral';

  return (
    <View className="mb-4">
      <View className="flex-row flex-wrap items-center gap-2">
        <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.parchment }}>
          {interaction.note_a}
        </Text>
        <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>×</Text>
        <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.parchment }}>
          {interaction.note_b}
        </Text>
        <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: badgeColor }}>
          <Text
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: isNeutral ? COLORS.ash : '#fff',
            }}>
            {interaction.type}
          </Text>
        </View>
      </View>
      <Text
        className="mt-1"
        style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash, lineHeight: 18 }}>
        {interaction.explanation}
      </Text>
    </View>
  );
}
