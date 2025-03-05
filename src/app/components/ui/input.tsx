import * as React from "react";
import styles from "./input.module.css";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Helper function to join class names
    const cn = (...classNames: (string | undefined)[]) => {
      return classNames.filter(Boolean).join(" ");
    };

    return (
      <input
        type={type || "text"}
        className={cn(styles.input, className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
