const fs = require("fs");
const path = require("path");

const productsFile = path.join(process.cwd(), "data", "products.ts");
let content = fs.readFileSync(productsFile, "utf8");

const replacements = [
  {
    id: 'id: "eclat-amber"',
    oldImage: 'image: "/images/products/oudwood-reserve.jpg"',
    oldGallery: 'gallery: ["/images/products/oudwood-reserve.jpg"]',
    newImage: 'image: "/images/products/generated/eclat-amber.svg"',
    newGallery: 'gallery: ["/images/products/generated/eclat-amber.svg", "/images/products/12.jpg"]',
  },
  {
    id: 'id: "u-shape-rainbow"',
    oldImage: 'image: "/images/products/azure-breeze.jpg"',
    oldGallery: 'gallery: ["/images/products/azure-breeze.jpg"]',
    newImage: 'image: "/images/products/generated/u-shape-rainbow.svg"',
    newGallery: 'gallery: ["/images/products/generated/u-shape-rainbow.svg", "/images/products/azure-breeze.jpg"]',
  },
  {
    id: 'id: "rainbow-glass"',
    oldImage: 'image: "/images/products/vanilla-velvet.jpg"',
    oldGallery: 'gallery: ["/images/products/vanilla-velvet.jpg"]',
    newImage: 'image: "/images/products/generated/rainbow-glass.svg"',
    newGallery: 'gallery: ["/images/products/generated/rainbow-glass.svg", "/images/products/11.jpg"]',
  },
  {
    id: 'id: "pastel-glow"',
    oldImage: 'image: "/images/products/vanilla-velvet.jpg"',
    oldGallery: 'gallery: ["/images/products/vanilla-velvet.jpg"]',
    newImage: 'image: "/images/products/generated/pastel-glow.svg"',
    newGallery: 'gallery: ["/images/products/generated/pastel-glow.svg", "/images/products/vanilla-velvet.jpg"]',
  },
  {
    id: 'id: "mercury"',
    oldImage: 'image: "/images/products/11.jpg"',
    oldGallery: 'gallery: ["/images/products/11.jpg"]',
    newImage: 'image: "/images/products/generated/mercury.svg"',
    newGallery: 'gallery: ["/images/products/generated/mercury.svg", "/images/products/11.jpg"]',
  },
  {
    id: 'id: "screw-jar"',
    oldImage: 'image: "/images/products/velvet-ylang-a.jpg"',
    oldGallery: 'gallery: ["/images/products/velvet-ylang-a.jpg"]',
    newImage: 'image: "/images/products/generated/screw-jar.svg"',
    newGallery: 'gallery: ["/images/products/generated/screw-jar.svg", "/images/products/velvet-ylang-a.jpg"]',
  },
  {
    id: 'id: "crystal-radiance-jar"',
    oldImage: 'image: "/images/products/11.jpg"',
    oldGallery: 'gallery: ["/images/products/11.jpg", "/images/products/royal-rose-bloom-pearl.jpg"]',
    newImage: 'image: "/images/products/generated/crystal-radiance-jar.svg"',
    newGallery: 'gallery: ["/images/products/generated/crystal-radiance-jar.svg", "/images/products/11.jpg"]',
  },
  {
    id: 'id: "jewel-eclat-jar"',
    oldImage: 'image: "/images/products/12.jpg"',
    oldGallery: 'gallery: ["/images/products/12.jpg", "/images/products/oudwood-reserve.jpg"]',
    newImage: 'image: "/images/products/generated/jewel-eclat-jar.svg"',
    newGallery: 'gallery: ["/images/products/generated/jewel-eclat-jar.svg", "/images/products/12.jpg"]',
  },
  {
    id: 'id: "royale-jar"',
    oldImage: 'image: "/images/products/11.jpg"',
    oldGallery: 'gallery: ["/images/products/11.jpg"]',
    newImage: 'image: "/images/products/generated/royale-jar.svg"',
    newGallery: 'gallery: ["/images/products/generated/royale-jar.svg", "/images/products/11.jpg"]',
  },
  {
    id: 'id: "small-golden-dusk"',
    oldImage: 'image: "/images/products/royal-rose-bloom-pearl.jpg"',
    oldGallery: 'gallery: ["/images/products/royal-rose-bloom-pearl.jpg"]',
    newImage: 'image: "/images/products/generated/small-golden-dusk.svg"',
    newGallery: 'gallery: ["/images/products/generated/small-golden-dusk.svg", "/images/products/royal-rose-bloom-pearl.jpg"]',
  },
  {
    id: 'id: "round-3-inch-jar"',
    oldImage: 'image: "/images/products/9.jpg"',
    oldGallery: 'gallery: ["/images/products/9.jpg"]',
    newImage: 'image: "/images/products/generated/round-3-inch-jar.svg"',
    newGallery: 'gallery: ["/images/products/generated/round-3-inch-jar.svg", "/images/products/9.jpg"]',
  },
  {
    id: 'id: "round-flower-3-inch-jar"',
    oldImage: 'image: "/images/products/9.jpg"',
    oldGallery: 'gallery: ["/images/products/9.jpg"]',
    newImage: 'image: "/images/products/generated/round-flower-3-inch-jar.svg"',
    newGallery: 'gallery: ["/images/products/generated/round-flower-3-inch-jar.svg", "/images/products/9.jpg"]',
  },
  {
    id: 'id: "boat-3inch-jar"',
    oldImage: 'image: "/images/products/9.jpg"',
    oldGallery: 'gallery: ["/images/products/9.jpg"]',
    newImage: 'image: "/images/products/generated/boat-3inch-jar.svg"',
    newGallery: 'gallery: ["/images/products/generated/boat-3inch-jar.svg", "/images/products/9.jpg"]',
  },
  {
    id: 'id: "golden-urli-jar"',
    oldImage: 'image: "/images/products/8.jpg"',
    oldGallery: 'gallery: ["/images/products/8.jpg"]',
    newImage: 'image: "/images/products/generated/golden-urli-jar.svg"',
    newGallery: 'gallery: ["/images/products/generated/golden-urli-jar.svg", "/images/products/8.jpg"]',
  },
  {
    id: 'id: "moroccan"',
    oldImage: 'image: "/images/products/8.jpg"',
    oldGallery: 'gallery: ["/images/products/8.jpg"]',
    newImage: 'image: "/images/products/generated/moroccan.svg"',
    newGallery: 'gallery: ["/images/products/generated/moroccan.svg", "/images/products/8.jpg"]',
  },
  {
    id: 'id: "rangriti-round-t-holder-multi"',
    oldImage: 'image: "/images/products/7.jpg"',
    oldGallery: 'gallery: ["/images/products/7.jpg"]',
    newImage: 'image: "/images/products/generated/rangriti-round-t-holder-multi.svg"',
    newGallery: 'gallery: ["/images/products/generated/rangriti-round-t-holder-multi.svg", "/images/products/7.jpg"]',
  },
  {
    id: 'id: "rangriti-square-t-holder"',
    oldImage: 'image: "/images/products/7.jpg"',
    oldGallery: 'gallery: ["/images/products/7.jpg"]',
    newImage: 'image: "/images/products/generated/rangriti-square-t-holder.svg"',
    newGallery: 'gallery: ["/images/products/generated/rangriti-square-t-holder.svg", "/images/products/7.jpg"]',
  },
  {
    id: "id: \"mosaic-holder\"",
    oldImage: 'image: "/images/products/7.jpg"',
    oldGallery: 'gallery: ["/images/products/7.jpg"]',
    newImage: 'image: "/images/products/generated/mosaic-holder.svg"',
    newGallery: 'gallery: ["/images/products/generated/mosaic-holder.svg", "/images/products/7.jpg"]',
  },
  {
    id: 'id: "crackle-finish-holder"',
    oldImage: 'image: "/images/products/7.jpg"',
    oldGallery: 'gallery: ["/images/products/7.jpg"]',
    newImage: 'image: "/images/products/generated/crackle-finish-holder.svg"',
    newGallery: 'gallery: ["/images/products/generated/crackle-finish-holder.svg", "/images/products/7.jpg"]',
  },
];

for (const rep of replacements) {
  const pos = content.indexOf(rep.id);
  if (pos !== -1) {
    const endPos = content.indexOf("},", pos);
    let block = content.slice(pos, endPos);
    block = block.replace(rep.oldImage, rep.newImage);
    block = block.replace(rep.oldGallery, rep.newGallery);
    content = content.slice(0, pos) + block + content.slice(endPos);
  } else {
    console.warn("Could not find product:", rep.id);
  }
}

fs.writeFileSync(productsFile, content, "utf8");
console.log("Updated data/products.ts with unique product image mappings.");
