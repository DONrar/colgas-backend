import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'colgas-app',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    CapacitorGoogleMaps: {
      apiKey: 'AIzaSyD49dmiTD_82REBS8zLOOABXLzv56pBVKk'
    },
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;
