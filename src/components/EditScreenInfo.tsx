import React from 'react';
import { View, Text, ScrollView } from 'react-native';

import { Lumi } from './Lumi';
import { FONTS } from '@/lib/theme';

const MOODS = ['soft', 'bold', 'cosy', 'sharp', 'mysterious'] as const;
const ACTIVE_MOOD = 'cosy';

const MOCK_BOTTLES = [
  { house: 'Le Labo', name: 'Santal 33', family: 'Woody' },
  { house: 'Chloé', name: 'Eau de Parfum', family: 'Floral' },
  { house: 'Encre Noire', name: 'Lalique', family: 'Woody' },
];

export const EditScreenInfo: React.FC<{ path: string }> = () => {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View className="items-center px-8 pt-16 pb-8">
        <Lumi size={72} />
        <Text
          style={{ fontFamily: FONTS.displayLight, fontSize: 36, letterSpacing: 0.5 }}
          className="text-foreground mt-6 text-center"
        >
          Olfaire
        </Text>
        <Text
          style={{ fontFamily: FONTS.displayLightItalic, fontSize: 18 }}
          className="text-muted-foreground mt-1 text-center"
        >
          Your Scent Intelligence
        </Text>
      </View>

      {/* Divider */}
      <View className="bg-border mx-8 h-px" />

      {/* Lumi voice line */}
      <View className="px-8 pt-8 pb-6">
        <Text
          style={{ fontFamily: FONTS.displayItalic, fontSize: 20, lineHeight: 30, color: '#B07D2A' }}
          className="text-center"
        >
          "Rain is coming. Vetiver knows how to stay."
        </Text>
      </View>

      {/* Mood section */}
      <View className="px-6 pb-6">
        <Text
          style={{
            fontFamily: FONTS.ui,
            fontSize: 9,
            letterSpacing: 3.5,
            textTransform: 'uppercase',
          }}
          className="text-muted-foreground mb-3"
        >
          Today's Mood
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {MOODS.map((mood) => {
            const active = mood === ACTIVE_MOOD;
            return (
              <View
                key={mood}
                className={`rounded-full border px-4 py-2 ${
                  active ? 'bg-ring border-ring' : 'bg-card border-border'
                }`}
              >
                <Text
                  style={{ fontFamily: FONTS.uiMedium, fontSize: 13 }}
                  className={active ? 'text-primary-foreground' : 'text-foreground'}
                >
                  {mood}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Collection card */}
      <View className="bg-card border-border mx-6 rounded-2xl border p-5">
        <Text
          style={{
            fontFamily: FONTS.ui,
            fontSize: 9,
            letterSpacing: 3.5,
            textTransform: 'uppercase',
          }}
          className="text-muted-foreground mb-4"
        >
          Your Collection
        </Text>
        {MOCK_BOTTLES.map((bottle, i) => (
          <View
            key={bottle.name}
            className={`flex-row items-center justify-between py-3 ${
              i < MOCK_BOTTLES.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <View>
              <Text
                style={{ fontFamily: FONTS.uiMedium, fontSize: 13 }}
                className="text-foreground"
              >
                {bottle.name}
              </Text>
              <Text
                style={{ fontFamily: FONTS.ui, fontSize: 11 }}
                className="text-muted-foreground mt-0.5"
              >
                {bottle.house}
              </Text>
            </View>
            <Text
              style={{ fontFamily: FONTS.ui, fontSize: 11, color: '#B07D2A' }}
            >
              {bottle.family}
            </Text>
          </View>
        ))}
      </View>

      {/* Dark card variant */}
      <View className="bg-primary mx-6 mt-4 rounded-2xl p-5">
        <View className="flex-row items-center gap-4">
          <Lumi size={48} wingColor="#FAF9F6" veinColor="#1C1A18" />
          <View className="flex-1">
            <Text
              style={{ fontFamily: FONTS.displayItalic, fontSize: 18, lineHeight: 26 }}
              className="text-primary-foreground"
            >
              The vetiver gives Chloé's rose a shadow it doesn't have alone.
            </Text>
            <Text
              style={{ fontFamily: FONTS.ui, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}
              className="text-muted-foreground mt-2"
            >
              Layering Insight
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
