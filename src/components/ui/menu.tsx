import { core } from "@/core";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react-native";
import type React from "react";
import { Pressable, View } from "react-native";
import { TextClassContext } from "./text";

/** Props for MenuItem component */
export type MenuItemProps = {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  containerClassName?: string;
  action?: React.ReactNode;
};

/**
 * Interactive menu item with haptic feedback
 * @param children - Menu item content
 * @param onPress - Press handler
 * @param containerClassName - Container CSS classes
 * @param action - Custom action element
 */
export const MenuItem = ({
  children,
  onPress,
  containerClassName,
  action,
}: MenuItemProps) => {
  const handlePress = () => {
    core.haptics.selection();
    onPress?.();
  };

  return (
    <TextClassContext value="text-white font-jakarta-medium text-[20px] leading-6 tracking-[-0.008em]">
      <Pressable
        onPress={handlePress}
        className={cn(
          "flex flex-row items-center justify-between px-6 py-6 gap-4 active:opacity-50 ",
          containerClassName,
        )}
      >
        <View className="flex-1 flex-row items-center gap-4">
          {children}
        </View>
        {action ? (
          <MenuItemAdornment>{action}</MenuItemAdornment>
        ) : (
          <MenuItemAdornment>
            <ChevronRight color="#888888" />
          </MenuItemAdornment>
        )}
      </Pressable>
      <View className="w-full px-5">
        <View className="h-px bg-[#252525]" />
      </View>
    </TextClassContext>
  );
};

/** Props for MenuItemAdornment component */
export type MenuItemAdornmentProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Adornment wrapper for menu item actions/icons
 * @param children - Adornment content
 * @param className - Additional CSS classes
 */
export const MenuItemAdornment = ({ children, className }: MenuItemAdornmentProps) => {
  return (
    <View className={cn("w-6 h-6 items-center justify-center", className)}>
      {children}
    </View>
  );
};

/** Props for Menu component */
export type MenuProps = {
  children: React.ReactNode;
  title?: string;
};

/**
 * Menu container with optional title header
 * @param children - Menu items
 * @param title - Optional menu title
 */
export const Menu = ({ children, title }: MenuProps) => {
  return (
    <View className="bg-background">
      {title && (
        <View className="px-6 py-4 border-b border-gray-200">
          <TextClassContext value="text-lg font-semibold text-white">
            {title}
          </TextClassContext>
        </View>
      )}
      <View className="pb-4">
        {children}
      </View>
    </View>
  );
};