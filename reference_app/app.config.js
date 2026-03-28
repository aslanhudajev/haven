import 'dotenv/config'
import fs from 'fs'
import {ClientEnv, Env} from './env'

const isFirebaseConfiguredForAndroid = fs.existsSync('./google-services.json')
const isFirebaseConfiguredForIos = fs.existsSync('./GoogleService-Info.plist')

const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME
const isProd = process.env.APP_ENV === 'production'

export default {
  expo: {
    name: Env.NAME,
    slug: Env.SLUG,
    description: `${Env.NAME} Mobile App`,
    owner: Env.EXPO_ACCOUNT_OWNER,
    scheme: Env.SCHEME,
    version: Env.VERSION.toString(),
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    platforms: ['ios', 'android'],
    androidNavigationBar: {
      backgroundColor: '#000000',
    },
    ios: {
      deploymentTarget: '16.0',
      supportsTablet: true,
      bundleIdentifier: Env.BUNDLE_ID,
      usesAppleSignIn: true,
      appleTeamId: Env.APPLE_TEAM_ID,
      config: {
        usesNonExemptEncryption: false,
      },
      ...(isFirebaseConfiguredForIos && {
        googleServicesFile: './GoogleService-Info.plist',
      }),
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
      },
      entitlements: {
        'aps-environment': isProd ? 'production' : 'development', // ✅ Required for push notification, change to "production" for Testflight and App Store builds
        'com.apple.security.application-groups': [`group.${Env.BUNDLE_ID}.onesignal`],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#D29647',
      },
      package: Env.PACKAGE,
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.USE_BIOMETRIC',
        'android.permission.USE_FINGERPRINT',
        'com.android.vending.BILLING',
      ],
      ...(isFirebaseConfiguredForAndroid && {
        googleServicesFile: './google-services.json',
      }),
    },
    plugins: [
      [
        'onesignal-expo-plugin',
        {
          mode: 'development',
        },
      ],
      'expo-router',
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/OpenSans-Regular.ttf',
            './assets/fonts/OpenSans-Medium.ttf',
            './assets/fonts/OpenSans-SemiBold.ttf',
            './assets/fonts/OpenSans-Bold.ttf',
            './assets/fonts/OpenSans-Italic.ttf',
          ],
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#121212',
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          dark: {
            image: './assets/images/splash-icon.png',
            backgroundColor: '#121212',
          },
        },
      ],
      ...(iosUrlScheme ? [['@react-native-google-signin/google-signin', {iosUrlScheme}]] : []),
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow $(PRODUCT_NAME) accesses your photos for scanning invoices and transactions',
        },
      ],
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID to secure your account',
        },
      ],
      'expo-localization',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            forceStaticLinking: ['RNFBApp', 'RNFBAnalytics'],
          },
        },
      ],
      'expo-apple-authentication',
      [
        '@sentry/react-native/expo',
        {
          organization: 'YOUR_SENTRY_ORGANIZATION',
          project: 'YOUR_SENTRY_PROJECT_ID',
          url: 'https://sentry.io/',
        },
      ],
      'expo-asset',
      ...(isFirebaseConfiguredForIos && isFirebaseConfiguredForAndroid
        ? ['@react-native-firebase/app']
        : []),
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...ClientEnv,
      eas: {
        projectId: Env.EAS_PROJECT_ID,
      },
      router: {
        origin: false,
      },
    },
  },
}
