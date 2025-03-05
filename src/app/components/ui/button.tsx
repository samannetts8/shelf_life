import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "./button.module.css";

// Helper function to join class names
const cn = (...classNames: (string | undefined)[]) => {
  return classNames.filter(Boolean).join(" ");
};

// Types for button variants and sizes
type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

// Function to get button classes based on variant and size
const getButtonClasses = ({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) => {
  // Map size to CSS class name
  const sizeClass = {
    default: styles.sizeDefault,
    sm: styles.sizeSm,
    lg: styles.sizeLg,
    icon: styles.sizeIcon,
  }[size];

  // Get variant class
  const variantClass = styles[variant];

  return cn(styles.base, variantClass, sizeClass, className);
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={getButtonClasses({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
