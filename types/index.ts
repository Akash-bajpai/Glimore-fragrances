export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface FragranceItem {
  id: string;
  name: string;
  family: "Floral" | "Citrus" | "Woody" | "Fresh" | "Gourmand";
  profile: string;
  mood: string;
  visual?: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  color?: string;
  fragrance?: string;
  image?: string;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  collection?: string;
  category: string;
  subcategory?: string;
  tagline?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  rating: number;
  reviewCount: number;
  stock?: number;
  isActive?: boolean;
  notes?: FragranceNotes;
  fragrance?: string;
  fragranceProfile?: string;
  mood?: string;
  capacity?: string;
  burnTime?: string;
  containerType?: string;
  weight?: string;
  vessel?: string;
  colors?: string[];
  variants?: ProductVariant[];
  careInstructions?: string;
  usageInstructions?: string;
  kitIncludes?: string;
  image: string;
  gallery: string[];
  badge?: "Bestseller" | "New" | "Limited Edition" | "Featured";
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  product?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
  fragrance?: string;
  color?: string;
  variant?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface ReviewItem {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  verified: boolean;
}
