import { type FlashListProps, FlashList as ShopifyFlashList } from "@shopify/flash-list";
import { cssInterop } from "nativewind";
import React from "react";
import Animated, { type AnimatedProps } from "react-native-reanimated";
import { cn } from "@/lib/utils";

/** FlashList ref type */
export type FlashListRef<T> = ShopifyFlashList<T>;

/** Props for themed FlashList component */
interface ThemedFlashListProps<T> extends FlashListProps<T> { }

const ThemedFlashList = cssInterop(ShopifyFlashList, {
  contentContainerClassName: "contentContainerStyle",
  ListFooterComponentClassName: "ListFooterComponentStyle",
  ListHeaderComponentClassName: "ListHeaderComponentStyle",
}) as typeof ShopifyFlashList;

/**
 * High-performance list component with NativeWind styling support
 * @param props - FlashList props with additional theming
 * @param ref - FlashList ref
 */
export const FlashList = React.forwardRef<FlashListRef<any>, ThemedFlashListProps<any>>(
  function FlashList<T>(props: ThemedFlashListProps<T>, ref: React.Ref<FlashListRef<T>>) {
    return (
      <ThemedFlashList<T>
        ref={ref}
        {...props}
        contentContainerClassName={cn("bg-background", props.contentContainerClassName)}
      />
    );
  }
) as <T>(props: ThemedFlashListProps<T> & { ref?: React.Ref<FlashListRef<T>> }) => React.ReactElement;

/** Props for animated FlashList component */
export type AnimatedFlashListProps<T> = AnimatedProps<ThemedFlashListProps<T>>

/**
 * Factory function for animated FlashList component
 * @returns Animated FlashList component
 */
export function AnimatedFlashList<T>() {
  const AnimatedComponent = Animated.createAnimatedComponent(FlashList) as any;
  return React.forwardRef<FlashListRef<T>, AnimatedFlashListProps<T>>((props, ref) => (
    <AnimatedComponent {...props} ref={ref} />
  ));
}

export type { ThemedFlashListProps as FlashListProps };

