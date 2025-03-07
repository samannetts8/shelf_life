import {
  Milk,
  Apple,
  LeafyGreen,
  Beef,
  Fish,
  Croissant,
  Snowflake,
  Package,
  ShoppingBasket,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export function getCategoryIcon(category: string): LucideIcon {
  switch (category) {
    case "dairy":
      return Milk;
    case "fruits":
      return Apple;
    case "produce":
      return LeafyGreen;
    case "meat":
      return Beef;
    case "seafood":
      return Fish;
    case "bakery":
      return Croissant;
    case "frozen":
      return Snowflake;
    case "pantry":
      return Package;
    case "other":
      return ShoppingBasket;
    default:
      return HelpCircle;
  }
}
