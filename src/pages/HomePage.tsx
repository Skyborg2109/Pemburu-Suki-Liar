import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import RouteDestinations from '@/sections/Routes';
import Fleet from '@/sections/Fleet';
import Testimonials from '@/sections/Testimonials';
import Contact from '@/sections/Contact';
import Footer from '@/sections/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" translate="no">
      <Navigation />
      <main>
        <Hero />
        <About />
        <RouteDestinations />
        <Fleet />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
