import { View } from "react-native";
import { cn } from "@/lib/utils";

/** Props for Skeleton component */
interface SkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animated loading skeleton component
 * @param className - Additional CSS classes for sizing and positioning
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <View
      className={cn(
        "bg-gray-200 rounded-md animate-pulse",
        className
      )}
    />
  );
}
