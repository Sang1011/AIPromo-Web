import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import HeroSection from '../../components/HeroSection';
import StatsSection from '../../components/StatsSection';
import CategorySection from '../../components/CategorySection';
import EventListSection from '../../components/EventListSection';
import FeaturesSection from '../../components/FeaturesSection';
import ProcessSection from '../../components/ProcessSection';
import PartnersAndDestinations from '../../components/PartnersAndDestinations';
import CallToActionSection from '../../components/CallToActionSection';
import { useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../../config/firebase';

const HomePage: React.FC = () => {
  useEffect(() => {
    const test = async () => {
      try {
        await set(ref(db, 'test/hello'), { message: 'Firebase works!', time: Date.now() });
        console.log('✅ Firebase write success');
      } catch (err) {
        console.error('❌ Firebase write error:', err);
      }
    };
    test();
  }, []);

  return (
    <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white">
      {/* Header cố định ở trên cùng */}
      <Header />

      <main>
        <HeroSection />
        <StatsSection />
        <CategorySection />
        <EventListSection />
        <FeaturesSection />
        <ProcessSection />
        <PartnersAndDestinations />
        <CallToActionSection />
      </main>
      {/* Footer ở dưới cùng */}
      <Footer />
    </div>
  );
};

export default HomePage;