import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../../global.css';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'CormorantGaramond-Light': require('../../assets/fonts/CormorantGaramond-Light.ttf'),
    'CormorantGaramond-LightItalic': require('../../assets/fonts/CormorantGaramond-LightItalic.ttf'),
    'CormorantGaramond-Regular': require('../../assets/fonts/CormorantGaramond-Regular.ttf'),
    'CormorantGaramond-Italic': require('../../assets/fonts/CormorantGaramond-Italic.ttf'),
    'CormorantGaramond-Medium': require('../../assets/fonts/CormorantGaramond-Medium.ttf'),
    'DMSans-Light': require('../../assets/fonts/DMSans-Light.ttf'),
    'DMSans-Regular': require('../../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('../../assets/fonts/DMSans-Medium.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Stack />
      <StatusBar style="auto" />
      <PortalHost />
    </SafeAreaProvider>
  );
}
