import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "../text";

/** Props for ScreenNavbar component */
export interface ScreenNavbarProps extends ViewProps {
  /** Navigation elements positioned on the sides */
  children?: ReactNode;
  /** Title displayed in center */
  title?: string | ReactNode;
  /** Positioning variant @default "default" */
  variant?: "default" | "overlay";
  /** Whether to disable gradient backdrop @default false */
  disableBackdrop?: boolean;
}

/**
 * Floating navigation header with optional gradient overlay
 * @param children - Navigation elements
 * @param title - Title to display in center
 * @param variant - Positioning variant
 * @param className - Additional CSS classes
 * @param disableBackdrop - Whether to disable gradient backdrop
 */
const ScreenNavbar = ({ children, title, variant = "default", className, disableBackdrop = false, ...props }: ScreenNavbarProps) => {

  const enableBackdrop = variant === "overlay";

  return (
    <View {...props} className={cn("pt-safe z-[100]", {
      "bg-[#141414]": variant === "default",
      "absolute top-0 left-0 right-0 ": variant === "overlay",
    }, className)} pointerEvents="box-none">
      {enableBackdrop && (
        <LinearGradient
          colors={['#000000', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0.2, 0.8125]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
          pointerEvents="box-none"
        />
      )}
      <View className="px-5 py-3 flex-row gap-2 justify-between items-center h-[63px]" pointerEvents="box-none">
        {title ? (
          <>
            <View className="flex-1 justify-between flex-row" pointerEvents="box-none">
              {children}
            </View>
            <View className="absolute inset-x-0 flex-row justify-center items-center" pointerEvents="box-none">
              {typeof title === "string" ? (
                <Text className="text-white text-center font-bold text-lg leading-6 tracking-tighter" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 18, lineHeight: 24, letterSpacing: -0.144 }}>
                  {title}
                </Text>
              ) : (
                title
              )}
            </View>
          </>
        ) : (
          children
        )}
      </View>
    </View>
  );
};

export { ScreenNavbar };