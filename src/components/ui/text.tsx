import * as Slot from '@rn-primitives/slot';
import * as React from 'react';
import { Text as RNText, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { cn } from '@/lib/utils';

const TextClassContext = React.createContext<string | undefined>(undefined);

export type TextProps = React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
}

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

export type HeaderProps = TextProps & {
  align?: 'top' | 'center' | 'bottom';
}

const Header = ({ children, className, align = "center", ...props }: HeaderProps) => {
  return (
    <View className={cn("flex flex-col items-center justify-center px-8", {
      "justify-start": align === "top",
      "justify-center h-28": align === "center",
      "justify-end": align === "bottom",
    })}>
      <Text className={cn("text-3xl font-jakarta-extrabold text-center text-balance", className)} {...props}>
        {children}
      </Text>
    </View>
  );
};

const SubHeader = ({ children, className, ...props }: TextProps) => {
  return (
    <View className="flex flex-col items-start justify-center px-8 py-6">
      <Text className={cn("text-lg font-jakarta text-center text-balance", className)} {...props}>
        {children}
      </Text>
    </View>
  );
};

const AnimatedText = Animated.createAnimatedComponent(Text);

export { Text, TextClassContext, Header, SubHeader, AnimatedText };
