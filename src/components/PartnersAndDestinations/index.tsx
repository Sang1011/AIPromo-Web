import React from 'react';

interface Partner {
  name: string;
  icon: string;
  colorClass: string;
}

interface Destination {
  name: string;
  eventsCount: string;
  image: string;
}

const PartnersAndDestinations: React.FC = () => {
  const partners: Partner[] = [
    { name: "VNPay", icon: "account_balance_wallet", colorClass: "text-blue-500" },
    { name: "MoMo", icon: "phone_iphone", colorClass: "text-pink-500" },
    { name: "Stripe", icon: "payments", colorClass: "text-blue-400" },
    { name: "Visa", icon: "credit_card", colorClass: "text-slate-200" },
  ];

  const destinations: Destination[] = [
    { name: "Hồ Chí Minh", eventsCount: "120+ Sự kiện", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_G3zg2RsmfwGvEkprlCgWv9I5izEeeaKwRxIo2bSbq0aE_tkiKK1v_tO5z9n2dimQLPduSyYKOlzpIUDmOOc4PUFbcruHZ0rSWgBelATW-rLNN3Tg7JvVyGXxauFMy71GOIDUfKPtjyn02BlvDJVDs7Cxk1h3awB-Z53LRYqPKg_-DX4vt_Xd_v7gHGzB69_DWjL_o0wv3JpjmA9CbdoM6fLmaZyB-QgmnnUwQg375vaA8Lk5PphiqvsIbYECkT5hZ1BDDzVli3QD" },
    { name: "Hà Nội", eventsCount: "85+ Sự kiện", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAi5kEtoIiD_tbsaut4T3MKQ8Ald8yq41lsVMwLHOgfw6vuMehB7fTuHNO_DNEqSM5-HXnnGh9e1RYzU_bj5ZW7qRNvd5pPkQTpxtUZmNwandt_2Oxo9mtk0q5ffd0lXKnoB4IDeKTMU6J3exBzk8TVjriszuFKU_Fx5otVrs1P4dWxkgGTcpRkbSN9cwZNI8yMzyIn2quEG_VP98r8Q67g8HjVb_rboUeavHmMUYHf6CW-VUgg0j6CNQUL-Rh5ryt1VUFPjo9DJYUU" },
    { name: "Đà Lạt", eventsCount: "42+ Sự kiện", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjkDrwbstCzLT3pcTbqSm4MOJRelFfVolSn5OnqGAIn4bGIK-hZAQqDD74EFNBkHKf5SlzFCIfddCpbTnh7Qu6NFHGaOA73HFJ5XGTb9UCgnw9H3QbwG-zQnZXt-RhptFRLslg_RAoZr7dviKmai1Gueaqo9jsJ-NhE_89perwMalQde16eCBj4M1JKq8VdLyQH2bGQbSSpXiUWBGILD6DxaE0Vx6gPZSLuYjDEkD9GlXH1UbwSdVp0uAZ_ZuQGBgNAC1oUyLAedbC" },
  ];

  return (
    <section className="py-24 bg-surface-dark/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* --- Partners Section --- */}
        <h2 className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest mb-12">
          Đối tác thanh toán tin cậy
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-12 mb-32">
          {partners.map((partner) => (
            <div key={partner.name} className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center p-4 group-hover:bg-primary/20 transition-all border border-white/5 group-hover:border-primary/50">
                <span className={`material-symbols-outlined text-4xl ${partner.colorClass}`}>
                  {partner.icon}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                {partner.name}
              </span>
            </div>
          ))}
        </div>

        {/* --- Destinations Section --- */}
        <div className="space-y-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Điểm đến thú vị</h2>
              <p className="text-slate-400">Những thành phố náo nhiệt nhất dành cho sự kiện.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <div 
                key={dest.name} 
                className="relative group rounded-3xl overflow-hidden aspect-[4/5] border border-primary/20 cursor-pointer"
              >
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  src={dest.image} 
                  alt={`${dest.name} view`} 
                />
                {/* Lớp phủ gradient để làm nổi bật text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute bottom-0 left-0 p-8">
                  <h4 className="text-2xl font-black text-white">{dest.name}</h4>
                  <p className="text-primary text-sm font-bold">{dest.eventsCount}</p>
                </div>
              </div>
            ))}

            {/* "Explore More" Card */}
            <div className="relative group rounded-3xl overflow-hidden aspect-[4/5] border border-primary/20 cursor-pointer glass-card flex flex-col items-center justify-center text-center p-8 hover:bg-primary/5 transition-colors">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 border border-primary/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl text-primary">explore</span>
              </div>
              <h4 className="text-2xl font-black text-white mb-2">Vị trí khác</h4>
              <p className="text-slate-400 text-sm">Tìm kiếm sự kiện tại thành phố của bạn</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersAndDestinations;