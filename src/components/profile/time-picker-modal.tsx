import { Modal, View, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS, colorWithOpacity } from '@/lib/theme';

interface TimePickerModalProps {
  visible: boolean;
  value: Date;
  onChange: (event: any, date?: Date) => void;
  onClose: () => void;
}

export function TimePickerModal({ visible, value, onChange, onClose }: TimePickerModalProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: colorWithOpacity(COLORS.ink, 0.5) }} onPress={onClose} />
      <View style={{ backgroundColor: COLORS.parchment, paddingBottom: 32, alignItems: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignSelf: 'stretch',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 4,
          }}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.amber }}>
              Done
            </Text>
          </Pressable>
        </View>
        <DateTimePicker
          mode="time"
          display="spinner"
          value={value}
          onChange={onChange}
          themeVariant="light"
        />
      </View>
    </Modal>
  );
}
