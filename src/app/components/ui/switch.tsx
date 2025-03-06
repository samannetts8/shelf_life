"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import styles from "./switch.module.css";

// Helper function to join class names
const cn = (...classNames: (string | undefined)[]) => {
  return classNames.filter(Boolean).join(" ");
};

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(styles.switchRoot, className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={styles.switchThumb} />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
