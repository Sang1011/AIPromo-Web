import React from "react";

interface Category {
  icon: string;
  title: string;
  desc: string;
  count: string;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const CategorySection: React.FC = () => {
  const categories: Category[] = [
    { icon: "smart_toy", title: "Công nghệ", desc: "AI, Web3, Blockchain", count: "120+ sự kiện" },
    { icon: "music_note", title: "Âm nhạc", desc: "Festival, Live show", count: "85+ sự kiện" },
    { icon: "school", title: "Hội thảo", desc: "Chuyên môn, Học thuật", count: "95+ sự kiện" },
    { icon: "palette", title: "Workshop", desc: "Kỹ năng, Sáng tạo", count: "72+ sự kiện" },
    { icon: "sports_esports", title: "Giải trí", desc: "Game, Esports", count: "64+ sự kiện" },
    { icon: "apps", title: "Khác", desc: "Cộng đồng, Meetup", count: "150+ sự kiện" },
  ];

  const features: Feature[] = [
    { icon: "verified", title: "Chất lượng đảm bảo", desc: "Mọi sự kiện được kiểm duyệt kỹ lưỡng bởi đội ngũ chuyên nghiệp" },
    { icon: "update", title: "Cập nhật liên tục", desc: "Hàng trăm sự kiện mới được thêm vào mỗi tuần" },
    { icon: "filter_alt", title: "Tìm kiếm thông minh", desc: "Bộ lọc AI giúp bạn tìm sự kiện phù hợp nhất trong vài giây" },
  ];

  return (
    <section className="relative py-24 px-6 overflow-hidden">

      {/* Background giống file HTML */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 -z-10"></div>

      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-16 text-center">
          <span className="text-indigo-400 text-sm font-bold uppercase tracking-widest">
            Danh mục
          </span>
          <h2 className="text-5xl font-black text-white mt-4 mb-4">
            Khám phá sự kiện theo sở thích
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Tìm kiếm và tham gia các sự kiện phù hợp nhất với đam mê của bạn
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-xl border border-white/10 
                         rounded-3xl p-8 flex flex-col items-center text-center 
                         gap-4 transition-all duration-500 
                         hover:scale-105 hover:bg-white/10 cursor-pointer group"
            >
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full 
                                opacity-0 group-hover:opacity-100 transition"></div>
                <span className="material-symbols-outlined text-5xl text-indigo-400 relative">
                  {cat.icon}
                </span>
              </div>

              <h4 className="font-bold text-white text-lg">
                {cat.title}
              </h4>

              <p className="text-sm text-slate-400">
                {cat.desc}
              </p>

              <div className="mt-2 text-xs font-bold text-indigo-400">
                {cat.count}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-xl border border-white/10 
                         rounded-3xl p-8 hover:bg-white/10 transition"
            >
              <span className="material-symbols-outlined text-4xl text-indigo-400 mb-4 block">
                {feat.icon}
              </span>

              <h4 className="text-xl font-bold text-white mb-3">
                {feat.title}
              </h4>

              <p className="text-slate-400 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategorySection;
