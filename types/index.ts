export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  category: string;
  tagline: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  notes: FragranceNotes;
  description: string;
  burnTime: string;
  weight: string;
  vessel: string;
  image: string;
  gallery: string[];
  badge?: "Bestseller" | "New" | "Limited Edition";
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
}

export interface NavLink {
  label: string;
  href: string;
}
