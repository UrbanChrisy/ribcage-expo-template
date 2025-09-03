import * as Slot from '@rn-primitives/slot';
import * as React from 'react';
import { Text as RNText, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { cn } from '@/lib/utils';

/** Context for providing default text classes to descendant components */
const TextClassContext = React.createContext<string | undefined>(undefined);

/** Props for Text component */
export type TextProps = React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  /** Render as child using Slot pattern */
  asChild?: boolean;
}

/**
 * Text component with context-aware styling and Slot support
 * @param className - Additional CSS classes
 * @param asChild - Render as child using Slot pattern
 */
function Text({
  className,
  asChild = false,
  ...props
}: TextProps) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn('text-base text-foreground web:select-text font-jakarta', textClass, className)}
      {...props}
    />
  );
}

/** Animated version of Text component using Reanimated */
const AnimatedText = Animated.createAnimatedComponent(Text);

export { Text, TextClassContext, AnimatedText };
