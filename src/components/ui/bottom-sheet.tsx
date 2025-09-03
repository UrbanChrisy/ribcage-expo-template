import {
  BottomSheetBackdrop,
  BottomSheetFlatList as BottomSheetFlatListComponent,
  BottomSheetFooter as BottomSheetFooterComponent,
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetScrollView as BottomSheetScrollViewComponent,
  BottomSheetView as BottomSheetViewComponent,
} from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import type { BottomSheetFlatListProps as BottomSheetFlatListComponentProps, BottomSheetScrollViewProps as BottomSheetScrollViewComponentProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types";
import type { BottomSheetViewProps as BottomSheetViewComponentProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types";
import { cssInterop } from "nativewind";
import type React from "react";
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  type RefObject,
  use,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  TouchableOpacity,
  View,
  type ViewProps
} from "react-native";
import { useWindowDimensions } from "react-native-keyboard-controller";
import { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./button";
import { MenuItem, type MenuItemProps } from "./menu";
import { Text } from "./text";

/** Context value for bottom sheet components */
interface BottomSheetContextValue {
  bottomSheetRef: RefObject<BottomSheetModal | null>;
  open: () => void;
  close: () => void;
  footerHeight: number;
  setFooterHeight: (height: number) => void;
}

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

/** Hook to access bottom sheet context */
export const useBottomSheet = () => {
  const context = use(BottomSheetContext);
  if (!context) {
    throw new Error(
      "useBottomSheet must be used within a BottomSheet provider",
    );
  }
  return context;
};

/** Hook to get bottom sheet height information */
export const useBottomSheetHeight = () => {
  const context = use(BottomSheetContext);
  if (!context) {
    throw new Error(
      "useBottomSheetHeight must be used within a BottomSheet provider",
    );
  }
  return {
    footerHeight: context.footerHeight,
    hasFooter: context.footerHeight > 0,
  };
};

/** Props for BottomSheet component */
export type BottomSheetProps = {
  children: React.ReactNode;
};

/** Ref type for BottomSheet component */
export type BottomSheetRef = BottomSheetContextValue;

/**
 * Bottom sheet provider component
 * @param children - Child components
 */
const BottomSheetComponent = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [footerHeight, setFooterHeight] = useState(0);

    const open = useCallback(() => {
      sheetRef.current?.present();
    }, []);

    const close = useCallback(() => {
      sheetRef.current?.close();
    }, []);

    const contextValue: BottomSheetContextValue = useMemo(
      () => ({
        bottomSheetRef: sheetRef,
        open,
        close,
        footerHeight,
        setFooterHeight,
      }),
      [open, close, footerHeight],
    );

    useImperativeHandle(ref, () => contextValue);

    return (
      <BottomSheetContext.Provider value={contextValue}>
        {children}
      </BottomSheetContext.Provider>
    );
  },
);

export const BottomSheet = BottomSheetComponent;

/** Props for BottomSheetTrigger component */
export type BottomSheetTriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
};

/**
 * Trigger component to open bottom sheet
 * @param children - Trigger content
 * @param asChild - Render as child element
 */
export const BottomSheetTrigger = ({
  children,
  asChild = false,
}: BottomSheetTriggerProps) => {
  const { open } = useBottomSheet();

  const handlePress = useCallback(() => {
    open();
  }, [open]);

  if (children == null) {
    return null;
  }

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      onPress: handlePress,
    } as Parameters<typeof cloneElement>[1]);
  }

  return <TouchableOpacity onPress={handlePress}>{children}</TouchableOpacity>;
};

/** Props for BottomSheetContent component */
export type BottomSheetContentProps = BottomSheetModalProps & {
  children?: React.ReactNode;
};

const ThemedBackdrop = cssInterop(BottomSheetBackdrop, {
  className: "style",
});

const ThemedBottomSheetModal = cssInterop(BottomSheetModal, {
  className: "style",
  containerClassName: "containerStyle",
  backgroundClassName: "backgroundStyle",
  handleClassName: "handleStyle",
  handleIndicatorClassName: "handleIndicatorStyle",
});

/**
 * Bottom sheet modal content container
 * @param children - Sheet content
 * @param footerComponent - Optional footer component
 */
export const BottomSheetContent = ({
  children,
  footerComponent: FooterComponent,
  ...props
}: BottomSheetContentProps) => {
  const hasReducedMotionEnabled = useReducedMotion();
  const context = useBottomSheet();

  return (
    <ThemedBottomSheetModal
      ref={context.bottomSheetRef}
      enableDynamicSizing
      containerClassName="z-50"
      backgroundClassName="rounded-t-3xl overflow-hidden bg-background"
      handleClassName="rounded-t-3xl overflow-hidden"
      handleIndicatorClassName="bg-foreground"
      animateOnMount={!hasReducedMotionEnabled}
      onDismiss={() => {
        context.setFooterHeight(0);
      }}
      backdropComponent={(backdropProps) => (
        <ThemedBackdrop
          opacity={0.4}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          enableTouchThrough={false}
          className="w-full h-full bg-black"
          {...backdropProps}
        />
      )}
      accessible={false}
      footerComponent={FooterComponent != null ? (props) => (
        <BottomSheetContext.Provider value={context}>
          <FooterComponent {...props} />
        </BottomSheetContext.Provider>
      ) : undefined}
      {...props}
    >
      <BottomSheetContext.Provider value={context}>
        {children}
      </BottomSheetContext.Provider>
    </ThemedBottomSheetModal>
  );
};

/** Props for BottomSheetCloseButton component */
export type BottomSheetCloseButtonProps = Omit<ButtonProps, "children"> & {
  children?: React.ReactNode;
  asChild?: boolean;
};

/**
 * Button component to close bottom sheet
 * @param className - Additional CSS classes
 * @param children - Button content
 * @param asChild - Render as child element
 */
export const BottomSheetCloseButton = ({
  className,
  children,
  asChild = false,
  ...props
}: BottomSheetCloseButtonProps) => {
  const { close } = useBottomSheet();

  const onPress = (e: GestureResponderEvent) => {
    close();
    props.onPress?.(e);
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      onPress: onPress,
    } as Parameters<typeof cloneElement>[1]);
  }

  return (
    <Button
      {...props}
      onPress={onPress}
      variant="ghost"
      size="icon"
      className={cn(
        "absolute right-2 top-0 z-50",
        className
      )}
    >
      {children ?? <Text className="text-lg font-bold">×</Text>}
    </Button>
  );
};

export type BottomSheetHeaderProps = ViewProps;

export const BottomSheetHeader = ({ className, ...props }: BottomSheetHeaderProps) => {
  return (
    <View
      {...props}
      className={cn("p-2", className)}
    />
  );
};

export type BottomSheetFooterProps = BottomSheetDefaultFooterProps & {
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const CustomBottomSheetFooter = cssInterop(BottomSheetFooterComponent, {
  className: "style",
});

export const BottomSheetFooter = ({ children, className, onLayout, ...props }: BottomSheetFooterProps) => {
  const { setFooterHeight } = useBottomSheet();

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setFooterHeight(height);
    onLayout?.(event);
  }, [setFooterHeight, onLayout]);

  return (
    <CustomBottomSheetFooter
      {...props}
      className={cn("pb-safe bg-background gap-2", className)}
    >
      <View className="p-5 gap-2 flex-row" onLayout={handleLayout}>
        {children}
      </View>
    </CustomBottomSheetFooter>
  );
};

export type BottomSheetTitleProps = React.ComponentProps<typeof Text>;

export const BottomSheetTitle = ({
  children,
  className,
  ...props
}: BottomSheetTitleProps) => {
  return (
    <Text
      className={cn(
        "text-foreground px-4 text-lg font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
};

export type BottomSheetMenuHeaderProps = {
  containerClassName?: string;
  className?: string;
  children: React.ReactNode;
};

export const BottomSheetMenuHeader = ({
  containerClassName,
  className,
  children,
}: BottomSheetMenuHeaderProps) => {
  return (
    <View className={cn("flex flex-row items-center px-6 py-2", containerClassName)}>
      <Text className={cn("font-jakarta text-[#888888] flex-1", className)}>
        {children}
      </Text>
    </View>
  );
};



export type BottomSheetMenuItemProps = {
  dissmissOnPress?: boolean;
} & MenuItemProps;

export const BottomSheetMenuItem = ({
  onPress,
  dissmissOnPress = true,
  ...props
}: BottomSheetMenuItemProps) => {
  const { close } = useBottomSheet();

  const handlePress = () => {
    onPress?.();
    if (dissmissOnPress) {
      close();
    }
  };

  return (
    <MenuItem
      onPress={handlePress}
      {...props}
    />
  );
};

export type BottomSheetMenuProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
};

export const BottomSheetMenu = ({ children, title, className }: BottomSheetMenuProps) => {
  return (
    <View className={cn("bg-background", className)}>
      {title && (
        <BottomSheetHeader className="relative">
          <BottomSheetTitle>{title}</BottomSheetTitle>
        </BottomSheetHeader>
      )}
      <View className="pb-4">
        {children}
      </View>
    </View>
  );
};

export type BottomSheetViewProps = BottomSheetViewComponentProps;
export const BottomSheetView = (props: BottomSheetViewProps) => {
  const { footerHeight } = useBottomSheetHeight();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + footerHeight;

  return (
    <BottomSheetViewComponent
      {...props}
      style={[{
        paddingBottom: bottomInset,
      }, props.style]}
    />
  );
};

export type BottomSheetScrollViewProps = BottomSheetScrollViewComponentProps;
export const BottomSheetScrollView = (props: BottomSheetScrollViewProps) => {
  const { footerHeight } = useBottomSheetHeight();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + footerHeight;

  return (
    <BottomSheetScrollViewComponent
      {...props}
      contentContainerStyle={[{
        paddingBottom: bottomInset,
      }, props.contentContainerStyle]}
    />
  );
};

export type BottomSheetFlatListProps<T> = BottomSheetFlatListComponentProps<T>;
export const BottomSheetFlatList = (props: BottomSheetFlatListProps<any>) => {
  const { footerHeight } = useBottomSheetHeight();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + footerHeight;
  const window = useWindowDimensions();


  return (
    <BottomSheetFlatListComponent
      {...props}
      contentContainerStyle={[{
        paddingBottom: bottomInset,
      }, props.contentContainerStyle]}
    />
  );
};