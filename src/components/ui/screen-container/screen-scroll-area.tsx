import type { ReactNode } from "react";
import React from "react";
import { type ScrollViewProps, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { cn } from "@/lib/utils";

export type ScreenScrollAreaProps = ScrollViewProps & {
  header?: ReactNode;
  variant?: "default" | "overlay";
};

/**
 * Scrollable area component with safe area padding
 * @param children - Scrollable content
 * @param header - Optional header element
 * @param variant - Display variant
 * @param className - Additional CSS classes
 */
const ScreenScrollArea = ({ children, header, className, variant = "default", ...props }: ScreenScrollAreaProps) => {
  return (
    <ScrollView
      {...props}
      className={cn("flex-1", {
        "": variant === "default",
        "": variant === "overlay",
      }, className)}
      contentContainerClassName={cn("", {
        "": variant === "default",
        "py-safe": variant === "overlay",
      }, props.contentContainerClassName)}
    >
      {header && (
        <>
          <View className="h-14" />
          {header}
        </>
      )}
      <View className="">
        {children}
      </View>
    </ScrollView>
  );
};

export { ScreenScrollArea };