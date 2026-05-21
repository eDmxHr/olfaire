import React from 'react';
import { View } from 'react-native';

import { EditScreenInfo } from './EditScreenInfo';

interface ScreenContentProps {
  title: string;
  path: string;
  children?: React.ReactNode;
}

export const ScreenContent: React.FC<ScreenContentProps> = ({ path, children }) => {
  return (
    <View className="flex-1 bg-background">
      <EditScreenInfo path={path} />
      {children}
    </View>
  );
};
