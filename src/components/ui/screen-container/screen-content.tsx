import type { ReactNode } from "react";
import React from "react";
import type { ViewProps } from "react-native";
import {
  KeyboardGestureArea,
} from "react-native-keyboard-controller";
import type { Edge } from "react-native-safe-area-context";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

/** Props for ScreenContent component */
export interface ScreenContentProps extends ViewProps {
  /** Content to render */
  children: ReactNode;
  /** Safe area edges to apply insets @default [] */
  insets?: Edge[];
}

/**
 * Content container with safe area insets and keyboard gesture handling
 * @param children - React node to render
 * @param insets - Safe area edges to apply
 * @param className - Additional CSS classes
 */
const ScreenContent = ({
  children,
  className,
  insets = [],
  ...props
}: ScreenContentProps) => {
  return (
    <KeyboardGestureArea interpolator="ios" style={{ flex: 1 }}>
      <SafeAreaView
        edges={insets}
        {...props}
        className={cn("flex-1", className)}
      >
        {children}
      </SafeAreaView>
    </KeyboardGestureArea>
  );
};

export { ScreenContent };