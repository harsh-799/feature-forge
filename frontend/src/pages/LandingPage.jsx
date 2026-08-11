import { useEffect } from 'react'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import Features from '../components/landing/Features'
import DeveloperSection from '../components/landing/DeveloperSection'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'
import '../App.css'

export default function LandingPage() {
  // Global IntersectionObserver to apply .in-view to any .reveal-on-scroll elements on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="landing-layout" id="top">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <DeveloperSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
