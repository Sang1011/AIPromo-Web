import React, { useEffect, useRef, useState } from "react";

interface StatItemProps {
  target: number;
  suffix: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ target, suffix, label }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);

      setCount(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated, target]);

  return (
    <div
      ref={ref}
      className="bg-white/10 backdrop-blur-xl border border-white/20 
                 rounded-3xl p-8 text-center 
                 shadow-xl transition-all duration-500 
                 hover:scale-105 hover:bg-white/20"
    >
      <div className="text-5xl font-extrabold mb-3 
                      bg-gradient-to-r from-indigo-400 to-purple-400 
                      bg-clip-text text-transparent">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-slate-300 text-sm font-medium tracking-wide">
        {label}
      </div>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    { target: 5000, suffix: "+", label: "Sự kiện đã tổ chức" },
    { target: 200000, suffix: "+", label: "Người tham gia" },
    { target: 98, suffix: "%", label: "Hài lòng" },
    { target: 24, suffix: "/7", label: "Hỗ trợ" },
  ];

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 -z-10"></div>

      {/* Blur Circle Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              target={stat.target}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
