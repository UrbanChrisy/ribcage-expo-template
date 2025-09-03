import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import { View } from "react-native";
import { useColorScheme } from "@/styles/use-color-scheme";

interface BackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Background container component
 * @param children - Content to render
 * @param className - Additional CSS classes
 */
export const Background = ({ children, className = "" }: BackgroundProps) => {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View className={`absolute top-0 left-0 right-0 bottom-0 z-10 ${className} bg-background`}>
      {children}
    </View>
  );
}; 