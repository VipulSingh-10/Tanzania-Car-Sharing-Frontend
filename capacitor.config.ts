
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3f637359c7054f67b7f4ea1985926348',
  appName: 'api-front-end-buddy',
  webDir: 'dist',
  server: {
    url: 'https://3f637359-c705-4f67-b7f4-ea1985926348.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
