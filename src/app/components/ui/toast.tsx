"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import styles from "./toast.module.css";

// Helper function to join class names
const cn = (...classNames: (string | undefined)[]) => {
  return classNames.filter(Boolean).join(" ");
};

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(styles.viewport, className)}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// Get variant class based on variant prop
const getVariantClass = (variant: "default" | "destructive" = "default") => {
  return variant === "default"
    ? styles.variantDefault
    : styles.variantDestructive;
};

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: "default" | "destructive";
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(styles.toast, getVariantClass(variant), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(styles.action, className)}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(styles.close, className)}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(styles.title, className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(styles.description, className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

interface ToastNotificationProps {
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
  open: boolean;
  onClose: () => void;
}

export function ToastNotification({
  title,
  description,
  type = "info",
  open,
  onClose,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  const getNotificationTypeClass = () => {
    switch (type) {
      case "success":
        return styles.notificationSuccess;
      case "error":
        return styles.notificationError;
      case "info":
      default:
        return styles.notificationInfo;
    }
  };

  const getNotificationCloseClass = () => {
    switch (type) {
      case "success":
        return styles.notificationCloseSuccess;
      case "error":
        return styles.notificationCloseError;
      case "info":
      default:
        return styles.notificationCloseInfo;
    }
  };

  return (
    <div
      className={cn(
        styles.notification,
        getNotificationTypeClass(),
        isVisible ? styles.notificationVisible : styles.notificationHidden
      )}
    >
      <div className={styles.notificationContent}>
        <div className={styles.notificationBody}>
          <h3 className={styles.notificationTitle}>{title}</h3>
          {description && (
            <p className={styles.notificationDescription}>{description}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={getNotificationCloseClass()}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
