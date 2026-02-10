import React from 'react';

const Footer: React.FC = () => {
  const footerLinks = {
    product: {
      title: "Sản phẩm",
      links: [
        { name: "Bán vé online", href: "#" },
        { name: "Quản lý sự kiện", href: "#" },
        { name: "Dịch vụ AI", href: "#" },
      ]
    },
    company: {
      title: "Công ty",
      links: [
        { name: "Về chúng tôi", href: "#" },
        { name: "Tuyển dụng", href: "#" },
        { name: "Blog", href: "#" },
      ]
    },
    support: {
      title: "Hỗ trợ",
      links: [
        { name: "Trung tâm trợ giúp", href: "#" },
        { name: "Điều khoản", href: "#" },
      ]
    }
  };

  return (
    <footer className="bg-background-dark border-t border-white/5 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
        
        {/* Brand & Logo Section */}
        <div className="col-span-2 lg:col-span-2 space-y-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl">bolt</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AIPromo</h1>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Nền tảng quản trị sự kiện thông minh, kết nối cộng đồng và thúc đẩy tăng trưởng thông qua công nghệ AI hàng đầu.
          </p>
        </div>

        {/* Dynamic Links Sections */}
        {Object.values(footerLinks).map((section) => (
          <div key={section.title}>
            <h5 className="text-white font-bold text-lg mb-8">{section.title}</h5>
            <ul className="space-y-5 text-slate-400">
              {section.links.map((link) => (
                <li key={link.name}>
                  <a className="hover:text-primary transition-colors" href={link.href}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} AIPromo. Mang lại giá trị cho cộng đồng.
        </p>
        <div className="flex gap-8">
          <a className="text-slate-500 text-sm hover:text-white transition-colors" href="#">
            Tiếng Việt
          </a>
          <a className="text-slate-500 text-sm hover:text-white transition-colors" href="#">
            English
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;