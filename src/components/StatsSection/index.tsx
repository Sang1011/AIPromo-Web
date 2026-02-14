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
      className="glass-card rounded-3xl p-8 text-center transform transition duration-500 hover:scale-105"
    >
      <div className="text-5xl font-black stat-number mb-2">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
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
    <section className="max-w-7xl mx-auto px-6 py-16">
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
    </section>
  );
};

export default StatsSection;
