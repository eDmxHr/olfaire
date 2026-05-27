import { View, TextInput, ActivityIndicator } from 'react-native';
import { IconSearch } from '@tabler/icons-react-native';
import { COLORS, FONTS } from '@/lib/theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  loading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search…',
  autoFocus,
  loading,
  className,
}: SearchInputProps) {
  return (
    <View
      className={`flex-row items-center gap-2.5 rounded-[14px] px-3.5 py-2.5${className ? ` ${className}` : ''}`}
      style={{ backgroundColor: COLORS.linen }}>
      <IconSearch size={18} color={COLORS.ash} strokeWidth={1.5} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.ash}
        autoFocus={autoFocus}
        className="flex-1 p-0"
        style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink }}
      />
      {loading ? <ActivityIndicator size="small" color={COLORS.ash} /> : null}
    </View>
  );
}
