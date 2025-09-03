import { cn } from "@/lib/utils";
import * as React from "react";
import {
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";

interface OTPContextValue {
  value: string;
  activeIndex: number;
  maxLength: number;
  setValue: (value: string) => void;
  setActiveIndex: (index: number) => void;
  focusInput: (index: number) => void;
  registerInput: (index: number, ref: TextInput | null) => void;
}

const OTPContext = React.createContext<OTPContextValue>({
  value: "",
  activeIndex: 0,
  maxLength: 6,
  setValue: () => { },
  setActiveIndex: () => { },
  focusInput: () => { },
  registerInput: () => { },
});

interface InputOTPProps {
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  maxLength?: number;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

export const InputOTP = React.forwardRef<View, InputOTPProps>((props, ref) => {
  const {
    value: controlledValue,
    onChange,
    onComplete,
    maxLength = 6,
    className,
    containerClassName,
    children,
  } = props;

  const [internalValue, setInternalValue] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  const value = controlledValue ?? internalValue;

  const setValue = React.useCallback(
    (newValue: string) => {
      const sanitizedValue = newValue.slice(0, maxLength);
      setInternalValue(sanitizedValue);
      onChange?.(sanitizedValue);

      if (sanitizedValue.length === maxLength) {
        onComplete?.(sanitizedValue);
      }
    },
    [maxLength, onChange, onComplete],
  );

  const focusInput = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < maxLength) {
        inputRefs.current[index]?.focus();
      }
    },
    [maxLength],
  );

  const registerInput = React.useCallback(
    (index: number, ref: TextInput | null) => {
      inputRefs.current[index] = ref;
    },
    [],
  );

  const contextValue = React.useMemo(
    () => ({
      value,
      activeIndex,
      maxLength,
      setValue,
      setActiveIndex,
      focusInput,
      registerInput,
    }),
    [value, activeIndex, maxLength, setValue, focusInput, registerInput],
  );

  return (
    <OTPContext.Provider value={contextValue}>
      <View
        ref={ref}
        className={cn("flex flex-row items-center", containerClassName)}
      >
        {children}
      </View>
    </OTPContext.Provider>
  );
});

InputOTP.displayName = "InputOTP";

export const InputOTPGroup = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex flex-row items-center gap-2", className)}
    {...props}
  />
));

InputOTPGroup.displayName = "InputOTPGroup";

interface InputOTPSlotProps
  extends React.ComponentPropsWithoutRef<typeof View> {
  index: number;
}

export const InputOTPSlot = React.forwardRef<View, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const {
      value,
      activeIndex,
      maxLength,
      setValue,
      setActiveIndex,
      focusInput,
      registerInput,
    } = React.useContext(OTPContext);
    const inputRef = React.useRef<TextInput>(null);

    React.useEffect(() => {
      if (inputRef.current) {
        registerInput(index, inputRef.current);
      }
    }, [index, registerInput]);

    React.useEffect(() => {
      if (index === 0) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [index]);

    const handleChangeText = async (text: string) => {
      // If text is longer than 1 character, it's likely a paste operation
      if (text.length > 1) {
        // Take only up to maxLength characters and get the character for this index
        const pastedValue = text.slice(0, maxLength);
        const currentChar = pastedValue[index] || "";

        // Set the full value in the context
        setValue(pastedValue);

        // Focus the last filled input or the last possible input
        const lastIndex = Math.min(pastedValue.length - 1, maxLength - 1);
        focusInput(lastIndex);

        // Return early to prevent any visual flicker
        return currentChar;
      }

      // Handle single character input
      const singleChar = text[0] || "";
      const newValue = value.split("");
      newValue[index] = singleChar;
      setValue(newValue.join(""));

      if (text.length === 1 && index < maxLength - 1) {
        focusInput(index + 1);
      }

      return singleChar;
    };

    const handleKeyPress = (
      e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    ) => {
      console.log("e.nativeEvent.key", e.nativeEvent.key);
      if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
        focusInput(index - 1);
      }
    };

    const handleFocus = () => {
      setActiveIndex(index);
    };

    return (
      <TextInput
        ref={inputRef}
        className={cn(
          "relative flex h-14 w-14 border border-input rounded-xl bg-input shadow-xs",
          // activeIndex === index && "z-10 border-white shadow-sm",
          "text-center text-foreground font-medium",
          // "text-lg font-medium ",
          className,
        )}
        // maxLength={1}
        keyboardType="number-pad"
        value={value[index] || ""}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
      />
    );
  },
);

InputOTPSlot.displayName = "InputOTPSlot";

export const InputOTPSeparator = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("w-2 h-0.5 bg-muted-foreground/25", className)}
    {...props}
  />
));

InputOTPSeparator.displayName = "InputOTPSeparator";
