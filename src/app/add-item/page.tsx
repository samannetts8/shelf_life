"use client"

import type React from "react"
import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {v4 as uuidv4} from "uuid"
import {MobileLayout} from "../components/Mobile-layout"
import type {FoodItemType} from "../types/food-item"
import {foodCategories} from "../data/food-categories"
import {getCategoryIcon} from "../utils/category-icons"
import {useAuth} from "../hooks/use-auth"
import "./add-item.css" // Import the new CSS file

export default function AddItem() {
  const router = useRouter()
  const {user, isLoading} = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    category: "dairy",
    quantity: "1",
    unit: "item",
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const {name, value} = e.target
    setFormData((prev) => ({...prev, [name]: value}))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newItem: FoodItemType = {
      id: uuidv4(),
      ...formData,
      addedDate: new Date().toISOString(),
    }

    const existingItems = JSON.parse(localStorage.getItem("foodItems") || "[]")
    const updatedItems = [...existingItems, newItem]
    localStorage.setItem("foodItems", JSON.stringify(updatedItems))

    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <MobileLayout>
      <div className="form-container">
        <h1 className="form-title">Add Food Item</h1>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Food Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Milk, Apples, Chicken"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <div className="category-grid">
              {foodCategories.map((category) => {
                const CategoryIcon = getCategoryIcon(category.value)
                const isSelected = formData.category === category.value
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: category.value,
                      }))
                    }
                    className={`category-button ${
                      isSelected ? "selected" : ""
                    }`}
                  >
                    <CategoryIcon
                      className={`category-icon ${
                        isSelected ? "selected-icon" : ""
                      }`}
                    />
                    <span
                      className={`category-label ${
                        isSelected ? "selected-label" : ""
                      }`}
                    >
                      {category.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="item">Item(s)</option>
                <option value="g">Grams</option>
                <option value="kg">Kilograms</option>
                <option value="ml">Milliliters</option>
                <option value="l">Liters</option>
                <option value="pkg">Package</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiration Date</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="submit-container">
            <button type="submit" className="submit-button">
              Add to Fridge
            </button>
          </div>
        </form>
      </div>
    </MobileLayout>
  )
}
