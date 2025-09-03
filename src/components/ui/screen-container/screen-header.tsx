import React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

/**
 * Header component with consistent padding
 * @param children - Header content
 * @param className - Additional CSS classes
 */
const ScreenHeader = ({ children, className, ...props }: ViewProps) => {
  return (
    <View {...props} className={cn("px-5", className)}>
      {children}
    </View>
  );
};

export { ScreenHeader };