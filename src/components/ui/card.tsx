import type * as React from 'react';
import { Text, type TextProps, View, type ViewProps } from 'react-native';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/**
 * Card container with border and shadow styling
 * @param className - Additional CSS classes
 */
function Card({
  className,
  ...props
}: ViewProps & {
  ref?: React.RefObject<View>;
}) {
  return (
    <View
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm shadow-foreground/10',
        className
      )}
      {...props}
    />
  );
}

/**
 * Card header section with padding and spacing
 * @param className - Additional CSS classes
 */
function CardHeader({
  className,
  ...props
}: ViewProps & {
  ref?: React.RefObject<View>;
}) {
  return <View className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

/**
 * Card title with heading styles and accessibility
 * @param className - Additional CSS classes
 */
function CardTitle({
  className,
  ...props
}: TextProps & {
  ref?: React.RefObject<Text>;
}) {
  return (
    <Text
      role='heading'
      aria-level={3}
      className={cn(
        'text-2xl text-card-foreground font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  );
}

/**
 * Card description with muted text styling
 * @param className - Additional CSS classes
 */
function CardDescription({
  className,
  ...props
}: TextProps & {
  ref?: React.RefObject<Text>;
}) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

/**
 * Card content section with text context
 * @param className - Additional CSS classes
 */
function CardContent({
  className,
  ...props
}: ViewProps & {
  ref?: React.RefObject<View>;
}) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View className={cn('p-6 pt-0', className)} {...props} />
    </TextClassContext.Provider>
  );
}

/**
 * Card footer section with flex layout
 * @param className - Additional CSS classes
 */
function CardFooter({
  className,
  ...props
}: ViewProps & {
  ref?: React.RefObject<View>;
}) {
  return <View className={cn('flex flex-row items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
