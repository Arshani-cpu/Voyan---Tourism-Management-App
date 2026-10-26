import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.voyan.travel',
  appName: 'Voyan',
  webDir: 'dist',
  android: {
    useLegacyBridge: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
