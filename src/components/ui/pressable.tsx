import { type GestureResponderEvent, Pressable as RNPressable, type PressableProps as RNPressableProps } from 'react-native';
import { core } from '@/core';
import { HapticType } from '@/core/clients/haptics/haptics.client';
import { cn } from '@/lib/utils';

/** Props for Pressable component */
export interface PressableProps extends RNPressableProps {
  /** Additional CSS classes */
  className?: string;
  /** Haptic feedback type */
  haptic?: HapticType;
}

/**
 * Enhanced pressable component with haptic feedback and animations
 * @param className - Additional CSS classes
 * @param onPress - Press event handler
 * @param haptic - Haptic feedback type
 */
export function Pressable({ className, onPress, haptic = 'light', ...props }: PressableProps) {
  const handlePress = (event: GestureResponderEvent) => {
    core.haptics[haptic]();
    onPress?.(event);
  }
  return (
    <RNPressable
      className={cn('active:opacity-80 active:scale-[0.98]', className)}
      onPress={handlePress}
      {...props}
    />
  );
} 