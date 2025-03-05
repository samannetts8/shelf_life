import { Leaf } from "lucide-react";
import styles from "./Logo.module.css";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`${styles.logoContainer} ${className || ""}`}>
      <Leaf className="h-full w-full" />
    </div>
  );
}