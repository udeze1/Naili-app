import 'dotenv/config';

export default {
  expo: {
    name: 'Naili',
    slug: 'Naili',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    }, 
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['*/'],

    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'We need your location to find addresses near you.',
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'INTERNET',
      ],
      package: "com.papilojr.naili" // <--- Add this Android package
    },

    web: {
      favicon: './assets/favicon.png',
    },

    extra: {
      GEOAPIFY_API_KEY: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY,
      eas: {
        projectId: "fd23d4f4-e3ab-46bf-bc0c-b0097ce367be", // your EAS project ID
      },
    },
  },
};