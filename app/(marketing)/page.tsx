import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ValueProp } from "@/components/sections/ValueProp";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeatureHighlight } from "@/components/sections/FeatureHighlight";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Resources } from "@/components/sections/Resources";
import { faqItems, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  description: siteConfig.description,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <TrustBar />
      <ValueProp />
      <Features />
      <HowItWorks />
      <FeatureHighlight />
      <CtaBanner />
      <Testimonials />
      <Faq />
      <Resources />
    </>
  );
}
