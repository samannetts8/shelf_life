import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { AddFoodModal } from "@/components/add-food-modal";
import styles from "./empty-state.module.css";

export function EmptyState() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.container}>
        <ShoppingBag className={styles.icon} />
        <h2 className={styles.title}>Your fridge is empty</h2>
        <p className={styles.description}>
          Add some food items to start tracking their expiration dates.
        </p>
        <button
          type="button"
          className={styles.button}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className={styles.buttonIcon} />
          Add food item
        </button>
      </div>

      {isModalOpen && (
        <AddFoodModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
