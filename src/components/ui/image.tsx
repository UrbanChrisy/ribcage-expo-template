import { Image as ExpoImage, type ImageProps as ExpoImageProps } from "expo-image";
import { cssInterop } from "nativewind";
import React from "react";
import { cn } from "@/lib/utils";

export const RawImage = cssInterop(ExpoImage, {
  className: "style",
});

export type ImageProps = {
  source: ExpoImageProps["source"];
} & ExpoImageProps

/** Optimized image component with caching and transitions */
export const Image = React.memo(({ source, ...props }: ImageProps) => {
  const onLoadEnd = () => {
    // TODO: Add loading state
  };

  return (
    <RawImage
      source={source}
      contentFit="cover"
      transition={1000}
      cachePolicy={"disk"}
      onLoadEnd={onLoadEnd}
      {...props}
      className={cn('bg-background', props.className)}
    />
  )
})