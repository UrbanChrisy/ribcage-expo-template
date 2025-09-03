import { router } from "expo-router";
import type React from "react";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { core } from "@/core";
import { ChevronLeft, XIcon } from "lucide-react-native";

/** Props for BackButton component */
export interface BackButtonProps extends Omit<ButtonProps, 'children'> {
  children?: ReactNode;
  iconVariant?: 'default' | 'chevron-close';
  onBeforeBack?: () => boolean;
  onPress?: () => void;
}

/**
 * Back navigation button with haptic feedback
 * @param children - Custom button content
 * @param iconVariant - Icon style variant
 * @param onBeforeBack - Guard function called before navigation
 * @param onPress - Custom press handler
 */
export const BackButton: React.FC<BackButtonProps> = ({
  children,
  className,
  size = "icon-sm",
  variant = "ghost",
  iconVariant = "default",
  onBeforeBack,
  onPress,
  ...props
}) => {

  const handlePress = () => {
    core.haptics.selection();

    if (onBeforeBack) {
      const shouldProceed = onBeforeBack();
      if (!shouldProceed) {
        return;
      }
    }

    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const renderContent = () => {
    if (children) {
      return children;
    }

    if (iconVariant === 'chevron-close') {
      return (
        <XIcon color="white" />
      );
    }

    return <ChevronLeft color="white" />;
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={`bg-[#242427] rounded-full ${className || ''}`}
      onPress={handlePress}
      {...props}
    >
      {renderContent()}
    </Button>
  );
};