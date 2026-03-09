import React from "react";
import { motion } from "framer-motion";

interface Step {
  title: string;
  description: string;
}

const ProcessSection: React.FC = () => {
  const steps: Step[] = [
    {
      title: "Đăng ký tài khoản",
      description:
        "Khởi tạo nhanh chóng qua Email hoặc Social Login chỉ trong 30 giây.",
    },
    {
      title: "Thiết lập sự kiện",
      description:
        "Sử dụng AI để soạn thảo nội dung và cấu hình các loại vé (Sớm, VIP, Thường).",
    },
    {
      title: "Quảng bá & Bán vé",
      description:
        "Kích hoạt các công cụ marketing tự động để thu hút người tham dự mục tiêu.",
    },
    {
      title: "Vận hành & Thành công",
      description:
        "Theo dõi báo cáo realtime và tổ chức sự kiện chuyên nghiệp nhất.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-32 relative">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="flex flex-col items-center text-center mb-20"
      >
        <h2 className="text-5xl font-black text-white mb-6">
          Quy trình đơn giản
        </h2>
        <div className="w-24 h-1.5 bg-primary rounded-full"></div>
      </motion.div>

      <div className="relative max-w-4xl mx-auto pl-8 md:pl-0">

        {/* Animated Vertical Line */}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: "100%" }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="absolute left-0 md:left-1/2 top-0 w-1 -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #7c3bed, transparent)",
          }}
        />

        {steps.map((step, index) => {
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isEven ? 80 : -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`group relative mb-20 md:flex w-full ${
                isEven
                  ? "md:justify-end md:pr-16"
                  : "md:justify-start md:pl-16"
              }`}
            >

              {/* Number Circle (biến mất khi hover) */}
              <div className="absolute left-0 md:left-1/2 top-0 size-16 -translate-x-1/2 flex items-center justify-center z-10">

                {/* Glow */}
                <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse"></div>

                <div
                  className="
                    relative size-12 rounded-full
                    flex items-center justify-center
                    text-primary font-black text-xl
                    transition-all duration-300
                    group-hover:opacity-0
                    group-hover:scale-0
                  "
                  style={{
                    background: "#18122B",
                    border: "1px solid rgba(124,59,237,0.5)",
                    boxShadow: "0 0 20px rgba(124,59,237,0.4)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {index + 1}
                </div>
              </div>

              {/* Step Card */}
              <motion.div
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 40px rgba(124,59,237,0.25)",
                }}
                className="md:w-1/2 p-8 rounded-3xl ml-12 md:ml-0 transition-all duration-300"
                style={{
                  background: "#18122B",
                  border: "1px solid rgba(124,59,237,0.15)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h4>

                <p className="text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ProcessSection;
