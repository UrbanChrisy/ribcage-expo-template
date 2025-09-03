import type React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/** Toggle switch item with mode and icon */
export type ToggleSwitchItem<T = string> = {
  mode: T;
  icon: React.ReactElement;
};

/** Props for ToggleSwitch component */
export type ToggleSwitchProps<T = string> = {
  className?: string;
  items: ToggleSwitchItem<T>[];
  selectedMode: T;
  onModeChange: (mode: T) => void;
};

/**
 * Toggle switch component with multiple mode options
 * @param items - Array of switch items
 * @param selectedMode - Currently selected mode
 * @param onModeChange - Mode change handler
 * @param className - Additional CSS classes
 */
const ToggleSwitch = <T = string>({ items, selectedMode, onModeChange, className }: ToggleSwitchProps<T>) => {
  const handleModeChange = (mode: T) => {
    onModeChange(mode);
  };

  return (
    <View className={cn(
      "bg-[#181818] items-center justify-center p-1 rounded-full flex-row gap-2",
      className,
    )}>
      {items.map((item, index) => (
        <Button
          key={`${item.mode}-${index}`}
          size="icon-sm"
          variant="ghost"
          className={cn(
            "rounded-full",
            selectedMode === item.mode && "bg-input",
          )}
          onPress={() => handleModeChange(item.mode)}
        >
          {item.icon}
        </Button>
      ))}
    </View>
  );
};

export default ToggleSwitch;
