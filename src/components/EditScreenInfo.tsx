import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Lumi } from './Lumi';

const swatches: { label: string; bg: string; text: string }[] = [
  { label: 'background', bg: 'bg-background', text: 'text-foreground' },
  { label: 'card', bg: 'bg-card', text: 'text-card-foreground' },
  { label: 'primary', bg: 'bg-primary', text: 'text-primary-foreground' },
  { label: 'secondary', bg: 'bg-secondary', text: 'text-secondary-foreground' },
  { label: 'muted', bg: 'bg-muted', text: 'text-muted-foreground' },
  { label: 'accent', bg: 'bg-accent', text: 'text-accent-foreground' },
  { label: 'destructive', bg: 'bg-destructive', text: 'text-primary-foreground' },
  { label: 'border', bg: 'bg-border', text: 'text-foreground' },
  { label: 'ring (amber)', bg: 'bg-ring', text: 'text-primary-foreground' },
  { label: 'amber', bg: 'bg-[#B07D2A]', text: 'text-[#FAF9F6]' },
];

export const EditScreenInfo: React.FC<{ path: string }> = () => {
  return (
    <ScrollView className="w-full px-4">
      <Text className="text-foreground mb-3 text-center text-base font-semibold">
        Theme Swatches
      </Text>
      {swatches.map((s) => (
        <View key={s.label} className={`${s.bg} border-border mb-2 rounded-lg border px-4 py-3`}>
          <Text className={`${s.text} text-sm font-medium`}>{s.label}</Text>
        </View>
      ))}

      <Text className="text-foreground mb-3 mt-5 text-center text-base font-semibold">Lumi</Text>
      <View className="bg-card border-border mb-2 flex-row items-end justify-around rounded-lg border px-4 py-5">
        <View className="items-center gap-1">
          <Lumi size={72} />
          <Text className="text-muted-foreground text-xs">72 splash</Text>
        </View>
        <View className="items-center gap-1">
          <Lumi size={48} />
          <Text className="text-muted-foreground text-xs">48 default</Text>
        </View>
        <View className="items-center gap-1">
          <Lumi size={32} />
          <Text className="text-muted-foreground text-xs">32 avatar</Text>
        </View>
        <View className="items-center gap-1">
          <Lumi size={20} />
          <Text className="text-muted-foreground text-xs">20 nav</Text>
        </View>
      </View>
      <View className="bg-primary border-border mb-2 flex-row items-center justify-around rounded-lg border px-4 py-5">
        <View className="items-center gap-1">
          <Lumi size={48} wingColor="#FAF9F6" veinColor="#1C1A18" />
          <Text className="text-primary-foreground text-xs">light wings</Text>
        </View>
        <View className="items-center gap-1">
          <Lumi size={48} wingColor="#B07D2A" bodyColor="#1C1A18" />
          <Text className="text-primary-foreground text-xs">amber mono</Text>
        </View>
      </View>
    </ScrollView>
  );
};
