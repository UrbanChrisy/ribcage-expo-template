import React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { Background } from '../background';

/** Props for ScreenRoot component */
export interface ScreenProps extends ViewProps { }

/**
 * Root screen container with background and layering
 * @param children - Screen content
 * @param className - Additional CSS classes
 * @param style - Custom styles
 */
const ScreenRoot = ({ children, className, style }: ScreenProps) => {
  return (
    <View className={cn("flex-1 bg-background", className)} style={style}>
      <Background className="z-10" />
      <View className="flex-1 z-20">
        {children}
      </View>
    </View>
  );
};

export { ScreenRoot };