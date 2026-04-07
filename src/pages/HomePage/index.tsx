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
import BlogListSection from '../../components/Blog';
const HomePage: React.FC = () => {

  return (
    <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-white">
      {/* Header cố định ở trên cùng */}
      <Header />

      <main>
        <HeroSection />
        <StatsSection />
        <BlogListSection/>
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