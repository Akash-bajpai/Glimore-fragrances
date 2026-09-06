const fs = require("fs");
const path = require("path");

const outputDir = path.join(process.cwd(), "public", "images", "products", "generated");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const items = [
  {
    filename: "eclat-amber.svg",
    title: "ECLAT AMBER",
    subtitle: "300 ml Frosted Glass Jar",
    vesselColor: "#4A2E1B",
    lidColor: "#8C633F",
    accentColor: "#D4AF37",
    vesselType: "frosted-jar",
  },
  {
    filename: "u-shape-rainbow.svg",
    title: "U SHAPE RAINBOW",
    subtitle: "150 ml Ribbed U-Curved Vessel",
    vesselColor: "#6B9080",
    accentColor: "#E8AEB7",
    vesselType: "u-shape",
  },
  {
    filename: "rainbow-glass.svg",
    title: "RAINBOW GLASS",
    subtitle: "250 ml Pastel Glass Cylinder",
    vesselColor: "#A3C4BC",
    accentColor: "#F4ACB7",
    vesselType: "cylinder",
  },
  {
    filename: "pastel-glow.svg",
    title: "PASTEL GLOW",
    subtitle: "200 ml Frosted Pastel Jar",
    vesselColor: "#B5E2FA",
    lidColor: "#8C633F",
    accentColor: "#EDAFB8",
    vesselType: "frosted-jar",
  },
  {
    filename: "mercury.svg",
    title: "MERCURY",
    subtitle: "75 ml Iridescent Votive",
    vesselColor: "#C0C0C0",
    accentColor: "#FFD700",
    vesselType: "mercury",
  },
  {
    filename: "screw-jar.svg",
    title: "SCREW JAR",
    subtitle: "100 ml Jar with Golden Screw Cap",
    vesselColor: "#1C2520",
    lidColor: "#D4AF37",
    accentColor: "#C8A96A",
    vesselType: "screw-cap",
  },
  {
    filename: "crystal-radiance-jar.svg",
    title: "CRYSTAL RADIANCE JAR",
    subtitle: "200 ml Cut-Crystal Finial Vessel",
    vesselColor: "#4682B4",
    accentColor: "#FFD700",
    vesselType: "crystal",
  },
  {
    filename: "jewel-eclat-jar.svg",
    title: "JEWEL ECLAT JAR",
    subtitle: "250 ml Embossed Glass Apothecary",
    vesselColor: "#5C3A21",
    accentColor: "#D4AF37",
    vesselType: "embossed",
  },
  {
    filename: "royale-jar.svg",
    title: "ROYALE JAR",
    subtitle: "200 ml Bell Dome Glass Jar",
    vesselColor: "#990000",
    accentColor: "#FFD700",
    vesselType: "bell-dome",
  },
  {
    filename: "small-golden-dusk.svg",
    title: "SMALL GOLDEN DUSK",
    subtitle: "150 ml Glossy Vessel with Pine Lid",
    vesselColor: "#1A1A1A",
    lidColor: "#8C633F",
    accentColor: "#C8A96A",
    vesselType: "frosted-jar",
  },
  {
    filename: "round-3-inch-jar.svg",
    title: "ROUND 3 INCH JAR",
    subtitle: "100 ml Carved Brown Wood Bowl",
    vesselColor: "#4A2511",
    accentColor: "#E67E22",
    vesselType: "wood-bowl",
  },
  {
    filename: "round-flower-3-inch-jar.svg",
    title: "ROUND FLOWER 3 INCH",
    subtitle: "120 ml Flower Carved Wood Bowl",
    vesselColor: "#5C3317",
    accentColor: "#E84393",
    vesselType: "wood-bowl",
  },
  {
    filename: "boat-3inch-jar.svg",
    title: "BOAT 3 INCH JAR",
    subtitle: "120 ml Dual-Wick Oval Wood Boat",
    vesselColor: "#3D1E0B",
    accentColor: "#D4AF37",
    vesselType: "wood-boat",
  },
  {
    filename: "golden-urli-jar.svg",
    title: "GOLDEN URLI JAR",
    subtitle: "150 ml Matte Golden Metal Urli",
    vesselColor: "#D4AF37",
    accentColor: "#C0392B",
    vesselType: "urli",
  },
  {
    filename: "moroccan.svg",
    title: "MOROCCAN",
    subtitle: "100 ml Embossed Mosaic Tin",
    vesselColor: "#2980B9",
    accentColor: "#F39C12",
    vesselType: "moroccan-tin",
  },
  {
    filename: "rangriti-round-t-holder-multi.svg",
    title: "RANGRITI MULTICOLOUR",
    subtitle: "Set of 5 Festive Ceramic Holders",
    vesselColor: "#E74C3C",
    accentColor: "#F1C40F",
    vesselType: "ceramic-holder",
  },
  {
    filename: "rangriti-square-t-holder.svg",
    title: "RANGRITI SQUARE HOLDER",
    subtitle: "Set of 5 Geometric Ceramic Holders",
    vesselColor: "#8E44AD",
    accentColor: "#1ABC9C",
    vesselType: "ceramic-holder",
  },
  {
    filename: "mosaic-holder.svg",
    title: "MOSAIC HOLDER",
    subtitle: "Stained Glass Mosaic Votive",
    vesselColor: "#3498DB",
    accentColor: "#E67E22",
    vesselType: "mosaic",
  },
  {
    filename: "crackle-finish-holder.svg",
    title: "CRACKLE FINISH HOLDER",
    subtitle: "Crackle Glaze Glass Orb",
    vesselColor: "#16A085",
    accentColor: "#F39C12",
    vesselType: "crackle",
  },
  {
    filename: "fragrance-oil-15ml.svg",
    title: "FRAGRANCE OIL 15 ML",
    subtitle: "Pure Concentrated Aroma Dropper Bottle",
    vesselColor: "#3E2723",
    lidColor: "#1A1A1A",
    accentColor: "#D4AF37",
    vesselType: "dropper-bottle",
  },
];

function generateSVG({ title, subtitle, vesselColor, lidColor, accentColor, vesselType }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1E1915" />
      <stop offset="60%" stop-color="#0E0B09" />
      <stop offset="100%" stop-color="#050403" />
    </radialGradient>

    <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD700" stop-opacity="0.4" />
      <stop offset="40%" stop-color="#FF8C00" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="flameCore" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#FFF4B8" />
      <stop offset="70%" stop-color="#FF9900" />
      <stop offset="100%" stop-color="#CC3300" stop-opacity="0.8" />
    </linearGradient>

    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E5AB" />
      <stop offset="50%" stop-color="#C8A96A" />
      <stop offset="100%" stop-color="#8C6A2F" />
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="25" stdDeviation="20" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="800" fill="url(#bgGrad)" />

  <!-- Ambient Flame Glow -->
  <circle cx="400" cy="370" r="280" fill="url(#flameGlow)" />

  <!-- Pedestal Shadow -->
  <ellipse cx="400" cy="620" rx="220" ry="30" fill="#000" opacity="0.6" filter="blur(10px)" />

  <!-- Vessel Group -->
  <g filter="url(#shadow)">
    <!-- Base Vessel Shape -->
    ${
      vesselType === "dropper-bottle"
        ? `<rect x="330" y="400" width="140" height="200" rx="16" fill="${vesselColor}" stroke="${accentColor}" stroke-width="3" />
           <rect x="360" y="340" width="80" height="60" rx="6" fill="${lidColor}" stroke="${accentColor}" stroke-width="2" />
           <ellipse cx="400" cy="320" rx="25" ry="18" fill="#4A4A4A" />`
        : vesselType === "u-shape"
        ? `<path d="M 280 380 Q 280 600 400 600 Q 520 600 520 380 L 510 380 Q 510 580 400 580 Q 290 580 290 380 Z" fill="${vesselColor}" stroke="${accentColor}" stroke-width="3" />
           <rect x="290" y="380" width="220" height="200" rx="100" fill="${vesselColor}" opacity="0.9" />`
        : vesselType === "wood-bowl"
        ? `<path d="M 240 430 Q 240 600 400 600 Q 560 600 560 430 Q 400 450 240 430 Z" fill="${vesselColor}" stroke="#6E3B1E" stroke-width="4" />
           <ellipse cx="400" cy="430" rx="160" ry="35" fill="#3A1C0B" stroke="${accentColor}" stroke-width="2" />
           <ellipse cx="400" cy="430" rx="140" ry="25" fill="#F4E8C1" opacity="0.9" />`
        : vesselType === "wood-boat"
        ? `<path d="M 200 450 Q 400 610 600 450 Q 400 470 200 450 Z" fill="${vesselColor}" stroke="#6E3B1E" stroke-width="4" />
           <ellipse cx="400" cy="450" rx="200" ry="25" fill="#F4E8C1" opacity="0.9" />`
        : vesselType === "urli"
        ? `<path d="M 220 440 Q 240 600 400 600 Q 560 600 580 440 Q 400 470 220 440 Z" fill="${vesselColor}" stroke="#F39C12" stroke-width="3" />
           <ellipse cx="400" cy="440" rx="180" ry="30" fill="#D4AF37" />
           <ellipse cx="400" cy="440" rx="160" ry="22" fill="#F9E79F" />
           <circle cx="400" cy="440" r="18" fill="#C0392B" />`
        : vesselType === "crackle" || vesselType === "mercury"
        ? `<circle cx="400" cy="480" r="130" fill="${vesselColor}" opacity="0.85" stroke="${accentColor}" stroke-width="3" />
           <ellipse cx="400" cy="380" rx="90" ry="18" fill="#FFF" opacity="0.3" />`
        : `<rect x="280" y="380" width="240" height="220" rx="16" fill="${vesselColor}" stroke="${accentColor}" stroke-width="2" opacity="0.9" />
           <ellipse cx="400" cy="380" rx="120" ry="25" fill="${accentColor}" opacity="0.4" />`
    }

    <!-- Optional Lid -->
    ${
      lidColor && vesselType !== "dropper-bottle"
        ? `<rect x="270" y="350" width="260" height="30" rx="8" fill="${lidColor}" stroke="url(#goldAccent)" stroke-width="2" />
           <circle cx="400" cy="340" r="10" fill="url(#goldAccent)" />`
        : ""
    }
  </g>

  <!-- Flame Assembly (if not a dropper bottle) -->
  ${
    vesselType !== "dropper-bottle"
      ? `<g>
    <!-- Wick -->
    <line x1="400" y1="380" x2="400" y2="350" stroke="#222" stroke-width="3" stroke-linecap="round" />
    
    <!-- Flame Outer -->
    <path d="M 400 270 C 375 320 380 350 400 355 C 420 350 425 320 400 270 Z" fill="url(#flameCore)" filter="blur(1px)" />
    
    <!-- Flame Inner Core -->
    <path d="M 400 290 C 388 325 390 348 400 352 C 410 348 412 325 400 290 Z" fill="#FFFFFF" />
  </g>`
      : ""
  }

  <!-- Decorative Sparkles & Branding -->
  <circle cx="260" cy="280" r="3" fill="url(#goldAccent)" opacity="0.6" />
  <circle cx="540" cy="260" r="4" fill="url(#goldAccent)" opacity="0.7" />
  <circle cx="560" cy="320" r="2" fill="url(#goldAccent)" opacity="0.5" />

  <!-- Luxury Brand Typography -->
  <text x="400" y="690" text-anchor="middle" font-family="'Times New Roman', serif" font-size="20" font-weight="600" letter-spacing="6" fill="url(#goldAccent)">GLIMORÉ FRAGRANCES</text>
  <text x="400" y="720" text-anchor="middle" font-family="'Helvetica Neue', sans-serif" font-size="14" font-weight="400" letter-spacing="3" fill="#D4AF37" opacity="0.8">${title}</text>
  <text x="400" y="742" text-anchor="middle" font-family="'Helvetica Neue', sans-serif" font-size="11" font-weight="300" letter-spacing="1" fill="#A39382">${subtitle}</text>

  <!-- Frame Border -->
  <rect x="25" y="25" width="750" height="750" fill="none" stroke="url(#goldAccent)" stroke-width="1" opacity="0.3" />
</svg>`;
}

items.forEach((item) => {
  const filePath = path.join(outputDir, item.filename);
  const svg = generateSVG(item);
  fs.writeFileSync(filePath, svg, "utf8");
});

console.log("Successfully generated all product SVG visual assets.");
