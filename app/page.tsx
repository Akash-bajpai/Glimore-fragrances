import { Hero } from "@/components/sections/Hero";
import { FeaturedCollections } from "@/components/sections/FeaturedCollections";
import { BestSellers } from "@/components/sections/BestSellers";
import { About } from "@/components/sections/About";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Categories } from "@/components/sections/Categories";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Newsletter } from "@/components/sections/Newsletter";
import { Contact } from "@/components/sections/Contact";
import { InstagramFeed } from "@/components/sections/InstagramFeed";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <BestSellers />
      <About />
      <WhyChooseUs />
      <Categories />
      <Gallery />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <Contact />
      <InstagramFeed />
    </>
  );
}
