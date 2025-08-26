import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type GestureResponderEvent, Pressable, View } from 'react-native';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { core } from '@/core';

const buttonVariants = cva(
  'group flex items-center flex-row gap-2',
  {
    variants: {
      variant: {
        default: 'bg-primary active:opacity-90',
        destructive: 'bg-destructive active:opacity-90',
        outline:
          'border border-input bg-background active:bg-accent',
        secondary: 'bg-secondary active:bg-[#5B5B66CC]',
        alternative: 'bg-white active:bg-[#BEBEBE]',
        ghost: 'active:bg-input',
        link: '',
      },
      size: {
        sm: 'h-14 px-4 rounded-sm',
        md: 'h-16 px-8 rounded-sm w-full',
        lg: 'h-20 px-10 rounded-md w-full',
        "icon-sm": 'h-12 w-12 rounded-sm',
        icon: 'h-16 w-16 rounded-sm',
      },
      align: {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      align: 'center',
    },
  }
);

const buttonTextVariants = cva(
  'text-base font-jakarta-bold text-foreground',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-destructive-foreground',
        outline: 'group-active:text-accent-foreground',
        secondary: 'text-secondary-foreground group-active:text-secondary-foreground',
        alternative: 'text-primary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: 'text-primary group-active:underline',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        icon: '',
        "icon-sm": '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export const iconVariants = cva('', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      alternative: 'text-black',
      ghost: 'text-foreground',
      link: 'text-primary',
    },
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      icon: 'h-5 w-5',
      "icon-sm": 'h-4 w-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const getIconSize = (buttonSize: ButtonProps['size']): number => {
  switch (buttonSize) {
    case 'sm':
      return 16;
    case 'lg':
      return 24;
    default:
      return 20;
  }
};

interface AdornmentProps {
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
}

const StartAdornment = React.memo(({ children, variant, size }: AdornmentProps) => {
  const child = React.Children.only(children);
  const iconClassName = iconVariants({ variant, size });
  const iconSize = getIconSize(size);

  return (
    <View className="flex items-center justify-center">
      {React.isValidElement(child)
        ? React.cloneElement(child, {
          // @ts-ignore
          className: cn(iconClassName, child.props.className),
          size: iconSize,
        })
        : children}
    </View>
  );
});

const EndAdornment = React.memo(({ children, variant, size }: AdornmentProps) => {
  const child = React.Children.only(children);
  const iconClassName = iconVariants({ variant, size });
  const iconSize = getIconSize(size);

  return (
    <View className="flex items-center justify-center">
      {React.isValidElement(child)
        ? React.cloneElement(child, {
          // @ts-ignore
          className: cn(iconClassName, child.props.className),
          size: iconSize,
        })
        : children}
    </View>
  );
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    start?: React.ReactNode;
    end?: React.ReactNode;
    children?: React.ReactNode;
    isLoading?: boolean;
    align?: 'left' | 'center' | 'right';
  };

function Button(props: ButtonProps) {

  const { ref, className, variant, size, start, end, children, isLoading = false, align = 'center', ...otherProps } = props;

  const handlePress = (e: GestureResponderEvent) => {
    core.haptics.selection();
    otherProps.onPress?.(e);
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex items-center justify-center">
          <View className={cn(
            "animate-spin rounded-full border-2 border-white border-t-transparent",
            iconVariants({ variant, size })
          )} />
        </View>
      );
    }

    return (
      <React.Fragment>
        {start && (
          <StartAdornment variant={variant} size={size}>
            {start}
          </StartAdornment>
        )}
        {children}
        {end && (
          <EndAdornment variant={variant} size={size}>
            {end}
          </EndAdornment>
        )}
      </React.Fragment>
    );
  };

  return (
    <TextClassContext.Provider
      value={buttonTextVariants({ variant, size, className: '' })}
    >
      <Pressable
        className={cn(
          otherProps.disabled && 'opacity-50',
          buttonVariants({ variant, size, align, className })
        )}
        ref={ref}
        role='button'
        disabled={otherProps.disabled || isLoading}
        {...otherProps}
        onPress={handlePress}
      >
        {renderContent()}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
