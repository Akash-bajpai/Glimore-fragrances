import { FAQItem, NavLink, Testimonial } from "@/types";

export const siteConfig = {
  name: "Glimoré",
  fullName: "Glimoré Fragrances",
  tagline: "Illuminated Living",
  description:
    "Hand-poured luxury soy candles, refillable car perfumes, botanical wardrobe sachets & ceramic diffuser kits crafted in small batches — rare fragrance oils, slow burns, and gift-ready finishing.",
  phone: "+91 81305 35057",
  phoneDisplay: "81305 35057",
  whatsapp: "918130535057",
  email: "glimorefragnances@gmail.com",
  address: {
    line: "Sohna, Gurgaon, Haryana",
    pin: "122103",
    country: "India",
  },
  instagram: "https://instagram.com/glimoreofficial",
  facebook: "https://facebook.com/glimoreofficial",
  pinterest: "https://pinterest.com/glimoreofficial",
  url: "https://glimorefragrances.com",
};

export const navLinks: NavLink[] = [
  { label: "Shop All", href: "/shop" },
  { label: "Candles", href: "/collections/luxury-candles" },
  { label: "Car Perfumes", href: "/collections/car-perfumes" },
  { label: "Sachets & Diffusers", href: "/collections/wardrobe-sachets" },
  { label: "Fragrance Finder", href: "/fragrance-finder" },
  { label: "Our Story", href: "/#about" },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya Sharma",
    location: "Gurgaon",
    rating: 5,
    quote:
      "The Amber Jar in Oudwood Reserve changed how my living room feels in the evening. It burns clean and even, and the scent throw is generous without being loud.",
    product: "Amber Jar — Oudwood Reserve",
  },
  {
    id: "t2",
    name: "Priya Nair",
    location: "Chandigarh",
    rating: 5,
    quote:
      "I bought the Royal Rose Bloom and the Car Perfume combo pack in Royal Oudh. The car perfume refill system is genius and smells like a luxury hotel.",
    product: "Car Perfume — Royal Oudh",
  },
  {
    id: "t3",
    name: "Kabir Malhotra",
    location: "Delhi NCR",
    rating: 5,
    quote:
      "Picked up the Home Diffuser Kit with Sandalwood oil at the Bliss & Bling exhibition. The ceramic burner looks stunning and fills the entire floor.",
    product: "Home Diffuser Kit",
  },
  {
    id: "t4",
    name: "Simran Kaur",
    location: "Mohali",
    rating: 5,
    quote:
      "The Soy Wax Wardrobe Sachets are my go-to gift now — I put Orange Cinnamon in my closet and every time I open it, it smells festive and fresh.",
    product: "Soy Wax Sachet — Orange Cinnamon",
  },
  {
    id: "t5",
    name: "Rohan Verma",
    location: "Sohna",
    rating: 5,
    quote:
      "Local, handcrafted, and it actually smells like the real ingredients on the label. Yenkee Luxe is genuinely one of the best-built candles I own.",
    product: "Yenkee Luxe",
  },
];

export const faqs: FAQItem[] = [
  {
    id: "f1",
    question: "What are Glimoré candles made of?",
    answer:
      "Every candle is hand-poured using a premium Soy + Coconut wax blend and fine fragrance oils with lead-free cotton wicks for a clean, even burn and rich fragrance throw. No paraffin, no toxic additives.",
  },
  {
    id: "f2",
    question: "How does the Car Perfume combo pack work?",
    answer:
      "Each car perfume set is a ₹250 Combo Pack that includes an 8 mL hanging glass bottle with an organic wooden diffuser cap, plus a 10 mL fragrance oil refill bottle. When empty, simply refill the hanging bottle and tilt gently to reactivate the aroma.",
  },
  {
    id: "f3",
    question: "What is included in the Home Diffuser Kit?",
    answer:
      "Our ₹400 Home Diffuser Kit is a complete aroma ritual containing 1 handcrafted Ceramic Diffuser (available in Pink, Black, White, or Blue), 10 handcrafted tea lights, and a 15 mL bottle of concentrated fragrance oil in your choice of 10 signature scents.",
  },
  {
    id: "f4",
    question: "How long do the Soy Wax Wardrobe Sachets last?",
    answer:
      "Our ₹170 botanical soy wax sachets gently diffuse fragrance for 60–90+ days in closed spaces like wardrobes, closets, dressers, linen drawers, and bedside spaces. Made with real dried flowers and spices.",
  },
  {
    id: "f5",
    question: "Do you ship pan-India and what are the delivery timelines?",
    answer:
      "Yes — we ship across India from our Sohna studio. Orders are dispatched within 24–48 hours in protective, gift-ready presentation boxing. Free standard shipping applies to all orders over ₹1,999.",
  },
  {
    id: "f6",
    question: "Can I customize candles for wedding favours or corporate gifts?",
    answer:
      "Yes! We offer bespoke customization in jar selection (glass, ceramic, wooden, metal), fragrance blending, wax colors, decorative toppings (dried flowers, gold flakes, coffee beans), and personalized labels with logos or names. Contact us on WhatsApp (+91 81305 35057) for bulk inquiries.",
  },
  {
    id: "f7",
    question: "How should I care for my Glimoré candle?",
    answer:
      "Trim the cotton wick to 5 mm before every burn. On the first burn, allow the melt pool to reach all edges (30–45 minutes). Never burn for more than 3–4 hours at a time, and extinguish when 10–12 mm of wax remains at the bottom.",
  },
];
