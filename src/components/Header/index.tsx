import React from 'react';

const Header: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#0B0B12]/85 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Desktop Navigation */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-xl">bolt</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">AIPromo</h1>
          </div>
          
          {/* Menu điều hướng - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-8">
            {['Khám phá', 'Sự kiện', 'Giải pháp', 'Giá cả'].map((item) => (
              <a 
                key={item}
                className="text-sm font-medium text-slate-300 hover:text-primary transition-colors" 
                href={`#${item.toLowerCase()}`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-slate-300 px-4 py-2 hover:text-primary transition-colors">
            Đăng nhập
          </button>
          <button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
            Tạo sự kiện
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;