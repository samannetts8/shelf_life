import { Check } from "lucide-react";
import type { FoodItemType } from "../types/food-item";
import { getCategoryIcon } from "../utils/category-icons";
import styles from "./food-item.module.css";

interface FoodItemProps {
  item: FoodItemType;
  onConsume: (id: string) => void;
  status: "good" | "expiring" | "expired";
}

export function FoodItem({ item, onConsume, status }: FoodItemProps) {
  const daysUntilExpiry = () => {
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      } ago`;
    } else if (diffDays === 0) {
      return "Expires today";
    } else {
      return `Expires in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    }
  };

  const statusStyles = {
    good: styles.goodStatus,
    expiring: styles.expiringStatus,
    expired: styles.expiredStatus,
  };

  const CategoryIcon = getCategoryIcon(item.category);

  return (
    <div className={`${styles.container} ${statusStyles[status]}`}>
      <div className={styles.iconContainer}>
        <CategoryIcon className={styles.icon} />
      </div>

      <div className={styles.content}>
        <h3 className={styles.itemName}>{item.name}</h3>
        <p className={styles.expiryText}>{daysUntilExpiry()}</p>
        <p className={styles.quantityText}>
          {item.quantity} {item.unit}
        </p>
      </div>

      <button
        onClick={() => onConsume(item.id)}
        className={styles.consumeButton}
        aria-label="Mark as consumed"
      >
        <Check className={styles.checkIcon} />
      </button>
    </div>
  );
}
