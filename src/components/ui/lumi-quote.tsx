import { View } from 'react-native';
import { Lumi } from '@/components/lumi';
import { Text } from '@/components/ui/text';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, TYPE } from '@/lib/theme';

interface LumiQuoteProps {
  label?: string;
  body: string;
  background?: string;
  textColor?: string;
  showLumi?: boolean;
}

export function LumiQuote({
  label = 'Lumi says',
  body,
  background = COLORS.ink,
  textColor = COLORS.parchment,
  showLumi = false,
}: LumiQuoteProps) {
  return (
    <View className="rounded-2xl p-4" style={{ backgroundColor: background }}>
      {showLumi ? (
        <View className="flex-row items-start gap-3">
          <View style={{ transform: [{ rotate: '12deg' }] }}>
            <Lumi size={20} />
          </View>
          <Text className="flex-1" style={[TYPE.displayS, { color: textColor }]}>
            {body}
          </Text>
        </View>
      ) : (
        <>
          <SectionLabel className="mb-2">{label}</SectionLabel>
          <Text style={[TYPE.displayS, { color: textColor }]}>{body}</Text>
        </>
      )}
    </View>
  );
}
