import {defineConfig} from '@shopify/hydrogen/config';
import {
  CookieSessionStorage,
  PerformanceMetricsServerAnalyticsConnector,
  ShopifyServerAnalyticsConnector,
} from '@shopify/hydrogen';

export default defineConfig({
  shopify: {
    // storeDomain: 'hydrogen-preview.myshopify.com',
    // storefrontToken: '3b580e70970c4528da70c98e097c2fa0',
    storeDomain: 'apo-first-app-store.myshopify.com',
    storefrontToken: '36c3bdb80929ce95f9e138bbdcc650df',
    storefrontApiVersion: '2022-07',
  },
  session: CookieSessionStorage('__session', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
  }),
  serverAnalyticsConnectors: [
    PerformanceMetricsServerAnalyticsConnector,
    ShopifyServerAnalyticsConnector,
  ],
});
