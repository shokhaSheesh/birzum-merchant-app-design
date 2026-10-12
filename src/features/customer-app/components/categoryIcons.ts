import { Laptop, Smartphone, Tv, WashingMachine, type LucideIcon } from 'lucide-react'
import type { Category } from '@/entities/catalog/products'

export const categoryIcons: Record<Category, LucideIcon> = {
  phones: Smartphone,
  tvs: Tv,
  appliances: WashingMachine,
  laptops: Laptop,
}
