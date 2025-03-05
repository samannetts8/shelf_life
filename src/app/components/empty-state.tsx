import Link from "next/link"
import { Plus } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="bg-green-100 p-6 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2">Your fridge is empty</h2>
      <p className="text-gray-600 mb-6">Start tracking your food items to reduce waste and save money.</p>
      <Link href="/add-item" className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
        <Plus className="h-5 w-5 mr-1" />
        Add your first item
      </Link>
    </div>
  )
}

