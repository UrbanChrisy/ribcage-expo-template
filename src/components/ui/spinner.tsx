import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import LoaderKit from "react-native-loader-kit";

const spinnerVariants = cva("", {
	variants: {
		variant: {
			default: "text-primary-foreground ",
			destructive: "text-destructive-foreground",
			outline: "text-foreground",
			secondary: "text-white",
			ghost: "text-foreground",
			link: "text-primary ",
		},
		size: {
			sm: "h-4 w-4",
			md: "h-5 w-5",
			lg: "h-6 w-6",
			"icon-sm": "h-4 w-4",
			icon: "h-5 w-5",
			"icon-lg": "h-6 w-6",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "md",
	},
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
	className?: string;
}

const sizeMap = {
	sm: 16, // h-4 = 16px
	md: 20, // h-5 = 20px
	lg: 24, // h-6 = 24px
	"icon-sm": 16,
	icon: 20,
	"icon-lg": 24,
};

const colorMap = {
	default: "#000000", // text-primary-foreground
	destructive: "#000000", // text-destructive-foreground
	outline: "#ffffff", // text-foreground
	secondary: "#ffffff", // text-white
	ghost: "#000000", // text-foreground
	link: "#0000ff", // text-primary
};

export const Spinner: React.FunctionComponent<SpinnerProps> = ({
	variant = "default",
	size = "md",
	className,
}) => {
	const dimensions = sizeMap[size as keyof typeof sizeMap] || 20;
	const color = colorMap[variant as keyof typeof colorMap] || "#ffffff";

	return (
		<LoaderKit
			className={cn(spinnerVariants({ variant, size }), className)}
			name="BallPulse"
			color={color}
			style={{ width: dimensions, height: dimensions }}
		/>
	);
};

Spinner.displayName = "Spinner";

export { spinnerVariants };
