import {
    Milk,
    Apple,
    Carrot,
    Beef,
    Fish,
    Croissant,
    Snowflake,
    Package,
    HelpCircle,
    type LucideIcon,
  } from "lucide-react"
  
  export function getCategoryIcon(category: string): LucideIcon {
    switch (category) {
      case "dairy":
        return Milk
      case "fruits":
        return Apple
      case "vegetables":
        return Carrot
      case "meat":
        return Beef
      case "seafood":
        return Fish
      case "bakery":
        return Croissant
      case "frozen":
        return Snowflake
      case "pantry":
        return Package
      default:
        return HelpCircle
    }
  }
  
  