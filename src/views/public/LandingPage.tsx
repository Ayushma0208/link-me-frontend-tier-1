import { AppsSection } from '@/components/apps/AppsSection'
import { CreatorMarquee } from '@/components/creators/CreatorMarquee'
import { ProductDemo } from '@/components/demo/ProductDemo'
import { FAQ } from '@/components/faq/FAQ'
import { Features } from '@/components/features/Features'
import { Footer } from '@/components/footer/Footer'
import { Hero } from '@/components/hero/Hero'
import { Navbar } from '@/components/layout/Navbar'
import { Pricing } from '@/components/pricing/Pricing'
import { Testimonials } from '@/components/testimonials/Testimonials'
import { TrustedBy } from '@/components/trusted/TrustedBy'

export function LandingPage() {
  return (
    <div className="min-h-svh bg-black text-white">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <ProductDemo />
        <AppsSection />
        <CreatorMarquee />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
