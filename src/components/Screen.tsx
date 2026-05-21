import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Screen({ children, header, className, noPadding = false }: ScreenProps) {
  return (
    <SafeAreaView className={cn('flex-1 bg-background', className)}>
      {header}
      <View className={cn('flex-1', !noPadding && 'px-4')}>
        {children}
      </View>
    </SafeAreaView>
  );
}
