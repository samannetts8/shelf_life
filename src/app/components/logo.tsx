import { Leaf } from "lucide-react"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`bg-green-600 text-white p-4 rounded-full ${className}`}>
      <Leaf className="h-full w-full" />
    </div>
  )
}

