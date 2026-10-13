import phones from '@/shared/assets/products/product-1.jpg'
import tvs from '@/shared/assets/products/product-10.jpg'
import laptops from '@/shared/assets/products/product-11.jpg'
import appliances from '@/shared/assets/products/product-7.jpg'
import type { Category } from './products'

// One picture per category. For now they borrow sample product photos; the real ones will
// be uploaded with each category in the admin panel.
export const categoryImages: Record<Category, string> = { phones, tvs, appliances, laptops }
