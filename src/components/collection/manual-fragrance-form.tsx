import { StyleSheet, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { COLORS, FONTS } from '@/lib/theme';

const GENDER_OPTIONS: Option[] = [
  { value: 'unisex', label: 'Unisex' },
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
];

const CONCENTRATION_OPTIONS: Option[] = [
  { value: 'Eau de Toilette', label: 'Eau de Toilette' },
  { value: 'Eau de Parfum', label: 'Eau de Parfum' },
  { value: 'Parfum', label: 'Parfum' },
];

export interface ManualFragranceFormValues {
  house: string;
  name: string;
  concentration: Option | undefined;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  family: string;
  year: string;
  gender: Option | undefined;
}

interface Props {
  values: ManualFragranceFormValues;
  onChange: <K extends keyof ManualFragranceFormValues>(
    key: K,
    value: ManualFragranceFormValues[K]
  ) => void;
}

export function ManualFragranceForm({ values, onChange }: Props) {
  return (
    <>
      <Field
        placeholder="House (e.g. Chanel)"
        value={values.house}
        onChangeText={(t) => onChange('house', t)}
      />
      <Field
        placeholder="Fragrance name"
        value={values.name}
        onChangeText={(t) => onChange('name', t)}
        autoFocus
      />
      <Select value={values.concentration} onValueChange={(v) => onChange('concentration', v)}>
        <SelectTrigger style={selectTriggerStyle}>
          <SelectValue placeholder="Concentration" />
        </SelectTrigger>
        <SelectContent>
          {CONCENTRATION_OPTIONS.map((opt) => (
            <SelectItem key={opt!.value} label={opt!.label} value={opt!.value} />
          ))}
        </SelectContent>
      </Select>
      <Field
        placeholder="Top notes (comma-separated)"
        value={values.notesTop}
        onChangeText={(t) => onChange('notesTop', t)}
      />
      <Field
        placeholder="Heart notes (comma-separated)"
        value={values.notesHeart}
        onChangeText={(t) => onChange('notesHeart', t)}
      />
      <Field
        placeholder="Base notes (comma-separated)"
        value={values.notesBase}
        onChangeText={(t) => onChange('notesBase', t)}
      />
      <Field
        placeholder="Year"
        value={values.year}
        onChangeText={(t) => onChange('year', t)}
        keyboardType="numeric"
      />

      <Text
        className="mb-2 mt-1.5 uppercase"
        style={{ fontFamily: FONTS.uiMedium, fontSize: 11, letterSpacing: 2.4, color: COLORS.ash }}>
        Optional
      </Text>

      <Field
        placeholder="Family (e.g. Floral, Woody)"
        value={values.family}
        onChangeText={(t) => onChange('family', t)}
      />
      <Select value={values.gender} onValueChange={(v) => onChange('gender', v)}>
        <SelectTrigger style={selectTriggerStyle}>
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          {GENDER_OPTIONS.map((opt) => (
            <SelectItem key={opt!.value} label={opt!.label} value={opt!.value} />
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

interface FieldProps {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  autoFocus?: boolean;
  keyboardType?: 'default' | 'numeric';
}

function Field({ placeholder, value, onChangeText, autoFocus, keyboardType }: FieldProps) {
  return (
    <TextInput
      className="mb-2.5 p-0 pb-2 text-foreground"
      style={{
        fontFamily: FONTS.ui,
        fontSize: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.dust,
      }}
      placeholder={placeholder}
      placeholderTextColor={COLORS.ash}
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      keyboardType={keyboardType ?? 'default'}
      autoCapitalize="none"
    />
  );
}

const selectTriggerStyle = {
  borderWidth: 0,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: COLORS.dust,
  borderRadius: 0,
  backgroundColor: 'transparent',
  paddingHorizontal: 0,
  paddingVertical: 0,
  height: 'auto' as any,
  marginBottom: 10,
  shadowOpacity: 0,
};
