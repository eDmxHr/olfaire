import { View } from 'react-native';
import { Text } from '@/components/ui/text';
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
          <Text
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: COLORS.ash,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
            {label}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {notes[key].map((note) => (
              <View
                key={note}
                style={{
                  backgroundColor: '#2A2724',
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}>
                <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.parchment }}>
                  {note}
                </Text>
              </View>
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
