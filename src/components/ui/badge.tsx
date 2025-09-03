import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** Badge styling variants with class variance authority */
const badgeVariants = cva(
  'items-center rounded-xs border border-border px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-background border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/** Text styling variants for badge content */
const badgeTextVariants = cva('text-2xs font-jakarta-extrabold ', {
  variants: {
    variant: {
      default: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/** Props for Badge component */
type BadgeProps = ViewProps & {
  /** Render as child using Slot pattern */
  asChild?: boolean;
} & VariantProps<typeof badgeVariants>;

/**
 * Badge component for displaying labels and status indicators
 * @param className - Additional CSS classes
 * @param variant - Visual style variant
 * @param asChild - Render as child using Slot pattern
 */
function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Component = asChild ? Slot.View : View;
  return (
    <View className="items-start justify-start">
      <TextClassContext.Provider value={badgeTextVariants({ variant })}>
        <Component className={cn(badgeVariants({ variant }), className)} {...props} />
      </TextClassContext.Provider>
    </View>
  );
}

export { Badge, badgeTextVariants, badgeVariants };
export type { BadgeProps };