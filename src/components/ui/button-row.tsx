import type React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

/** Props for ButtonRow component */
interface ButtonRowProps {
  /** Additional CSS classes */
  className?: string;
  /** Main content */
  children: React.ReactNode;
  /** Action buttons displayed on the right */
  actions?: React.ReactNode[];
}

/**
 * Layout component for content with optional action buttons
 * @param children - Main content area
 * @param actions - Array of action elements to display on the right
 * @param className - Additional CSS classes
 */
export function ButtonRow({
  children,
  actions,
  className,
}: ButtonRowProps) {
  return (
    <View className={cn("flex-col gap-4 px-safe  ", className)}>
      <View className="flex-row gap-2 px-5 py-4 max-w-xl">
        <View className="flex-1">
          {children}
        </View>
        {actions && (
          <View className="flex-row gap-2">
            {actions.map((action, index) => (
              <View key={index}>
                {action}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
} 