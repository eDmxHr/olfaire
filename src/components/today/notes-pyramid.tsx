import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SectionLabel } from '@/components/ui/section-label';
import { TagChip } from '@/components/ui/tag-chip';
import { COLORS, FONTS } from '@/lib/theme';

interface Props {
  top: string[];
  heart: string[];
  base: string[];
}

const ROWS = [
  { label: 'Top', key: 'top' as const },
  { label: 'Heart', key: 'heart' as const },
  { label: 'Base', key: 'base' as const },
];

export function NotesPyramid({ top, heart, base }: Props) {
  const notes = { top, heart, base };

  return (
    <View style={{ gap: 12 }}>
      {ROWS.map(({ label, key }) => (
        <View key={key} style={{ gap: 6 }}>
          <SectionLabel>{label}</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {notes[key].map((note) => (
              <TagChip key={note} label={note} variant="dark" shape="rounded" textColor={COLORS.parchment} />
            ))}
            {notes[key].length === 0 && (
              <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>—</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
