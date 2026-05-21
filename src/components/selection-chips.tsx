import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { FONTS, COLORS } from '@/lib/theme';

interface Chip {
  value: string;
  label: string;
}

interface SingleProps {
  chips: Chip[];
  multiSelect?: false;
  selected: string | null;
  onSelect: (value: string) => void;
}

interface MultiProps {
  chips: Chip[];
  multiSelect: true;
  selected: Set<string>;
  onSelect: (value: string) => void;
}

type SelectionChipsProps = SingleProps | MultiProps;

export function SelectionChips(props: SelectionChipsProps) {
  const { chips, onSelect } = props;

  function isActive(value: string) {
    if (props.multiSelect) return props.selected.has(value);
    return props.selected === value;
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {chips.map((chip) => {
        const active = isActive(chip.value);
        return (
          <Pressable
            key={chip.value}
            onPress={() => onSelect(chip.value)}
            className="rounded-full border px-4 py-2"
            style={{
              borderColor: active ? COLORS.amber : COLORS.dust,
              backgroundColor: active ? `${COLORS.amber}1A` : undefined,
            }}>
            <Text
              style={{
                fontFamily: active ? FONTS.uiMedium : FONTS.ui,
                fontSize: 14,
                color: active ? COLORS.amber : COLORS.ink,
              }}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
