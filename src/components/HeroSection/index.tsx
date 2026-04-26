import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen min-h-[800px] flex items-center overflow-hidden">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <iframe
          className="absolute top-1/2 left-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          src="https://www.youtube.com/embed/VRnaVqZfrAE?autoplay=1&mute=1&loop=1&playlist=VRnaVqZfrAE&controls=0&showinfo=0&rel=0&playsinline=1&modestbranding=1"
          allow="autoplay; fullscreen"
        ></iframe>
      </div>

      {/* Lớp phủ gradient (Overlay) */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-dark/35 to-background-dark/75 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI-Powered Event Hub
          </div>

          {/* Title */}
          <h1 className="text-6xl font-extrabold leading-[1.1] tracking-tight text-white">
            Nền tảng kiến tạo sự kiện <span className="text-primary italic">Thông Minh</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
            Tự động hóa nội dung marketing và tối ưu quy trình vận hành với sức mạnh của trí tuệ nhân tạo.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/30 flex items-center gap-2 group">
          <Link to="/verify-organizer"> Bắt đầu ngay</Link>   
            </button>
         
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;