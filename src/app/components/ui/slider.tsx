"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import styles from "./slider.module.css";

// Helper function to join class names
const cn = (...classNames: (string | undefined)[]) => {
  return classNames.filter(Boolean).join(" ");
};

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      styles.sliderRoot,
      className,
      props.disabled ? styles.disabled : ""
    )}
    {...props}
  >
    <SliderPrimitive.Track className={styles.sliderTrack}>
      <SliderPrimitive.Range className={styles.sliderRange} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={styles.sliderThumb} />
  </SliderPrimitive.Root>
));

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
