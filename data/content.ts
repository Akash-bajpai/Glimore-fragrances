import { FAQItem, NavLink, Testimonial } from "@/types";

export const siteConfig = {
  name: "Glimoré",
  fullName: "Glimoré Fragrances",
  tagline: "Illuminated Living",
  description:
    "Hand-poured luxury soy candles crafted in small batches in Sohna, Gurgaon — rare fragrance oils, slow burns, and gift-ready finishing.",
  phone: "+91 9818932448",
  phoneDisplay: "9818932448",
  whatsapp: "919818932448",
  email: "hello@glimorefragrances.com",
  address: {
    line: "Sohna, Gurgaon, Haryana",
    pin: "122103",
    country: "India",
  },
  instagram: "https://www.instagram.com/glimoreofficial/",
  facebook: "https://facebook.com/glimorefragrances",
  pinterest: "https://pinterest.com/glimorefragrances",
  url: "https://glimorefragrances.com",
};

export const navLinks: NavLink[] = [
  { label: "Collections", href: "#collections" },
  { label: "Best Sellers", href: "#best-sellers" },
  { label: "Our Story", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya Sharma",
    location: "Gurgaon",
    rating: 5,
    quote:
      "The Oudwood Reserve changed how my living room feels in the evening. It burns clean and even, and the scent throw is generous without being loud.",
    product: "Oudwood Reserve",
  },
  {
    id: "t2",
    name: "Priya Nair",
    location: "Chandigarh",
    rating: 5,
    quote:
      "I bought the Royal Rose Bloom for my mother's birthday and ended up ordering three more for myself. The jar alone feels like a keepsake.",
    product: "Royal Rose Bloom",
  },
  {
    id: "t3",
    name: "Kabir Malhotra",
    location: "Delhi NCR",
    rating: 5,
    quote:
      "Picked up Velvet Ylang at the Bliss & Bling exhibition and it's been on my desk ever since. Genuinely one of the best-built candles I own.",
    product: "Velvet Ylang",
  },
  {
    id: "t4",
    name: "Simran Kaur",
    location: "Mohali",
    rating: 5,
    quote:
      "Vanilla Velvet is my go-to gift now — I've sent it to four friends this year and every single one has asked where it's from.",
    product: "Vanilla Velvet",
  },
  {
    id: "t5",
    name: "Rohan Verma",
    location: "Sohna",
    rating: 5,
    quote:
      "Local, handcrafted, and it actually smells like the real ingredients on the label. Azure Breeze is unbelievably fresh without turning sharp.",
    product: "Azure Breeze",
  },
];

export const faqs: FAQItem[] = [
  {
    id: "f1",
    question: "What is Glimoré candles made of?",
    answer:
      "Every candle is hand-poured using natural soy wax and premium fragrance oils, with cotton wicks for a clean, even burn. No paraffin, no lead cores.",
  },
  {
    id: "f2",
    question: "How long does a Glimoré candle burn for?",
    answer:
      "Depending on the collection, our candles burn for 35 to 50+ hours. Exact burn time is listed on each product card. Trim the wick to 5mm before every light for the cleanest, longest burn.",
  },
  {
    id: "f3",
    question: "Do you ship across India?",
    answer:
      "Yes — we ship pan-India from Sohna, Gurgaon, with orders typically dispatched within 24-48 hours. Candles are packed in protective, gift-ready boxes to travel safely.",
  },
  {
    id: "f4",
    question: "Can I customise a candle for gifting?",
    answer:
      "Yes. Write a note at checkout or reach us on WhatsApp for personalised labels, ribbon colours, and curated gift sets for weddings, festivals, and corporate orders.",
  },
  {
    id: "f5",
    question: "What if my candle arrives damaged?",
    answer:
      "Reach out within 48 hours of delivery with a photo of the item and packaging, and we'll arrange a replacement at no extra cost.",
  },
  {
    id: "f6",
    question: "How should I care for my candle?",
    answer:
      "Let the first burn reach a full melt pool edge-to-edge to prevent tunnelling, keep wicks trimmed to 5mm, and burn for no longer than 3-4 hours at a stretch.",
  },
];
