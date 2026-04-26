import React from 'react';
import logo from '../../assets/logo.svg'

const Footer: React.FC = () => {
  const footerLinks = {
    product: {
      title: "Sản phẩm",
      links: [
        { name: "Bán vé online", href: "/all-event" },
      ]
    },
    company: {
      title: "Công ty",
      links: [
        { name: "Về chúng tôi", href: "https://www.facebook.com/profile.php?id=61573284472767&locale=vi_VN" },
        { name: "Tuyển dụng", href: "#" },
        { name: "Blog", href: "https://www.facebook.com/profile.php?id=61573284472767&locale=vi_VN" },
      ]
    },
    support: {
      title: "Hỗ trợ",
      links: [
        { name: "Trung tâm trợ giúp", href: "https://www.facebook.com/profile.php?id=61573284472767&locale=vi_VN" },
        { name: "Chính sách bảo mật", href: "https://www.facebook.com/profile.php?id=61573284472767&locale=vi_VN" },
      ]
    }
  };

  return (
    <footer className="bg-background-dark border-t border-white/5 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">

        {/* Brand & Logo Section */}
        <div className="col-span-2 lg:col-span-2 space-y-8">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
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
      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 flex justify-center items-center">
        <p className="text-slate-500 text-sm text-center">
          © {new Date().getFullYear()} AIPromo. Mang lại giá trị cho cộng đồng.
        </p>
      </div>
    </footer>
  );
};

export default Footer;