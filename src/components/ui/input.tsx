import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef, useCallback } from "react";
import type {
	NativeSyntheticEvent,
	TextInputFocusEventData,
	TextInputProps,
} from "react-native";
import { TextInput } from "react-native";

const inputVariants = cva("w-full border shadow-m rounded-xl text-foreground", {
	variants: {
		variant: {
			default: "bg-input border-input",
			outline: "bg-background border-input",
			destructive: "bg-destructive/10 border-destructive",
			secondary: "bg-secondary border-secondary",
			ghost: "border-transparent bg-transparent",
		},
		size: {
			sm: "h-10 px-3 py-2 text-sm",
			md: "h-14 px-6 py-3",
			lg: "h-20 px-8 py-4",
			icon: "h-12 w-12",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "md",
	},
});

export interface InputProps
	extends Omit<TextInputProps, "onChange">,
	VariantProps<typeof inputVariants> {
	className?: string;
	onChange?: (text: string) => void;
}

export const Input = forwardRef<TextInput, InputProps>(
	(
		{
			className,
			variant,
			size,
			placeholderTextColor = "#6b7280",
			onChange,
			onChangeText,
			...props
		},
		ref,
	) => {
		const onFocus = useCallback(
			(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
				props.onFocus?.(e);
			},
			[props.onFocus],
		);

		const onBlur = useCallback(
			(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
				props.onBlur?.(e);
			},
			[props.onBlur],
		);

		const handleOnChangeText = useCallback(
			(text: string) => {
				onChange?.(text);
				onChangeText?.(text);
			},
			[onChange, onChangeText],
		);

		return (
			<TextInput
				ref={ref}
				className={cn(
					inputVariants({ variant, size, className }),
				)}
				placeholderTextColor={placeholderTextColor}
				{...props}
				onChangeText={handleOnChangeText}
				onFocus={onFocus}
				onBlur={onBlur}
			/>
		);
	},
);

Input.displayName = "Input";

export { inputVariants };
