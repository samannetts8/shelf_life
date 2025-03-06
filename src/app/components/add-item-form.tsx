'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import styles from './add-item-form.module.css';

interface AddItemFormProps {
  userId: string;
}

export function AddItemForm({ userId }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    expiryDate: '',
    quantity: 1,
    category: 'dairy', // Default category
    unit: 'item', // Add default unit here
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/supabaseRoute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          expiryDate: formData.expiryDate,
          quantity: formData.quantity,
          category: formData.category,
          unit: formData.unit, // Include unit in the submission
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error adding item:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to add item'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Item</h1>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Milk"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="dairy">Dairy</option>
            <option value="produce">Produce</option>
            <option value="meat">Meat</option>
            <option value="bakery">Bakery</option>
            <option value="frozen">Frozen</option>
            <option value="pantry">Pantry</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Add unit selection */}
        <div className={styles.formGroup}>
          <Label htmlFor="unit">Unit</Label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="item">Item</option>
            <option value="g">Grams (g)</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="ml">Milliliters (ml)</option>
            <option value="l">Liters (l)</option>
            <option value="oz">Ounces (oz)</option>
            <option value="lb">Pounds (lb)</option>
            <option value="cup">Cups</option>
            <option value="tsp">Teaspoons</option>
            <option value="tbsp">Tablespoons</option>
            <option value="piece">Pieces</option>
            <option value="pack">Packs</option>
          </select>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </Button>
      </form>
    </div>
  );
}
