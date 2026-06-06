import * as Sentry from '@sentry/react-native';
import { captureConsoleIntegration } from '@sentry/core';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  integrations: [captureConsoleIntegration({ levels: ['error'] })],
  enabled: !__DEV__,
  tracesSampleRate: 0,
});
