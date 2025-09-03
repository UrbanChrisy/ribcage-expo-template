import { DarkTheme, DefaultTheme, type Theme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import * as React from 'react';
import { Appearance } from 'react-native';
import { useColorScheme } from './use-color-scheme';
import { useFonts } from './use-fonts';


const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
  },
};


nativewindColorScheme.set("dark")
Appearance.addChangeListener(({ colorScheme }) => {
  nativewindColorScheme.set(colorScheme ?? "dark")
});

export type NavigationThemeContainerProps = {
  children: React.ReactNode;
};

export const NavigationThemeContainer = ({ children }: NavigationThemeContainerProps) => {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const isFontsLoaded = useFonts();

  React.useLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);


  if (!isColorSchemeLoaded || !isFontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}