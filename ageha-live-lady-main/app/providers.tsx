'use client'

import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'
import { Authenticator, ThemeProvider as AmplifyThemeProvider, defaultDarkModeOverride, useTheme as useAmplifyTheme } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import overrideFetchFunc from './_utils/OverrideFetchFuncUtil';
import { useEffect } from 'react';
import LoggedInUserInfoContextProvider from './_components/_providers/LoggedInUserInfoContextProvider';

Amplify.configure({
  Auth: {
    region: awsExports.REGION,
    userPoolId: awsExports.USER_POOL_ID,
    userPoolWebClientId: awsExports.USER_POOL_APP_CLIENT_ID
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  const { tokens } = useAmplifyTheme();

  useEffect(
    () => {
      // fetch()関数の挙動をオーバーライド
      overrideFetchFunc();
    },
    []
  );

  let route = (<>{children}</>);
  // LoggedInUserInfoContextProviderを適用
  route = (
    <LoggedInUserInfoContextProvider>
      {route}
    </LoggedInUserInfoContextProvider>
  );

  return (
    <Authenticator.Provider>
      <AmplifyThemeProvider
        theme={{
          name: "lightTheme",
          overrides: [defaultDarkModeOverride],
          tokens: {
            colors: {
              brand: {
                primary: {
                  10: { value: "#fce7f3" }, // tailwind-cssのbg-pink-100
                  20: { value: "#fbcfe8" }, // tailwind-cssのbg-pink-200
                  40: { value: "#f9a8d4" }, // tailwind-cssのbg-pink-300
                  60: { value: "#f472b6" }, // tailwind-cssのbg-pink-400
                  80: { value: "#ec4899" }, // tailwind-cssのbg-pink-500
                  90: { value: "#db2778" }, // tailwind-cssのbg-pink-600
                  100: { value: "#be185d" }, // tailwind-cssのbg-pink-700
                },
              },
            },
          }
        }}
        colorMode='light'
      >
        <ThemeProvider attribute='class' defaultTheme='light'>
          <NextUIProvider>
            {route}
          </NextUIProvider>
        </ThemeProvider>
      </AmplifyThemeProvider>
    </Authenticator.Provider>
  );
}