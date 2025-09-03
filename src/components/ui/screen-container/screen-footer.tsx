import React from "react";
import { View, type ViewProps } from "react-native";
import {
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

/** Props for ScreenFooter component */
export interface ScreenFooterProps extends ViewProps {
  /** Whether footer sticks above keyboard @default false */
  sticky?: boolean;
}

/**
 * Footer component with optional keyboard-aware behavior
 * @param children - Footer content
 * @param sticky - Whether to stick above keyboard
 * @param className - Additional CSS classes
 */
const ScreenFooter = ({
  children,
  sticky = false,
  ...props
}: ScreenFooterProps) => {
  const { bottom } = useSafeAreaInsets();

  const Component = sticky ? KeyboardStickyView : View;

  return (
    <Component
      {...props}
      offset={{
        closed: -bottom,
        opened: 0,
      }}
      className={cn(
        "w-full",
        `bg-transparent px-safe`,
        !sticky && "",
        props.className,
      )}
    >
      <View style={{ paddingBottom: !sticky ? bottom : 0 }} >
        <View className="p-5">
          {children}
        </View>
      </View>
    </Component>
  );
};

export { ScreenFooter };