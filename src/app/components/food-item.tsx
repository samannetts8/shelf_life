import { Check } from "lucide-react"
import type { FoodItemType } from "@/types/food-item"
import { getCategoryIcon } from "@/utils/category-icons"

interface FoodItemProps {
  item: FoodItemType
  onConsume: (id: string) => void
  status: "good" | "expiring" | "expired"
}

export function FoodItem({ item, onConsume, status }: FoodItemProps) {
  const daysUntilExpiry = () => {
    const today = new Date()
    const expiryDate = new Date(item.expiryDate)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""} ago`
    } else if (diffDays === 0) {
      return "Expires today"
    } else {
      return `Expires in ${diffDays} day${diffDays !== 1 ? "s" : ""}`
    }
  }

  const statusColors = {
    good: "bg-green-100 border-green-200",
    expiring: "bg-orange-100 border-orange-200",
    expired: "bg-red-100 border-red-200",
  }

  const CategoryIcon = getCategoryIcon(item.category)

  return (
    <div className={`rounded-lg border p-3 ${statusColors[status]} flex items-center`}>
      <div className="flex-shrink-0 mr-3 bg-white p-2 rounded-full">
        <CategoryIcon className="h-6 w-6 text-gray-600" />
      </div>

      <div className="flex-grow">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-gray-600">{daysUntilExpiry()}</p>
        <p className="text-xs text-gray-500">
          {item.quantity} {item.unit}
        </p>
      </div>

      <button
        onClick={() => onConsume(item.id)}
        className="ml-2 p-2 rounded-full bg-white text-green-600 hover:bg-green-50"
        aria-label="Mark as consumed"
      >
        <Check className="h-5 w-5" />
      </button>
    </div>
  )
}

