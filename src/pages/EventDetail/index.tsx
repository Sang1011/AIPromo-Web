
import "./EventDetail.css"
import Header from '../../components/Header'
import Footer from '../../components/Footer'
function EventDetail() {
  return (
    <>
    <Header/>
    <main className="pt-24 purple-gradient-bg">
  {/* Hero Section */}
  <section className="relative w-full h-[60vh] min-h-[450px] overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center"
      data-alt="Wide angle cinematic music festival stage with purple lights"
      style={{
        backgroundImage:
          'linear-gradient(to top, #0B0B12 0%, rgba(11, 11, 18, 0.4) 50%, transparent 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9TuUgg4O-14uDiOACVzNQSk7n7n3LCkIa0ZHSM9dAhwZk3V1cXW_OO5v-KWCGfO2U73H4Bj-D5vqECsh56E1b0d0NDI_BYrxeFAUThn_V19dNQKR7POWa4K_2UMLliWVW1wgBeS5pOKlK1JgALHrFzQVIdMejhYFFqPD_G0vqb4ZqrzWqEhBTNqp6fwYpic9IgAZFCjN1Tp8U5nt2d9B437eU6h0aX46ga5xO4wEYjB1QMeCkqcUmQazEMefcOodWkKViLgoYl5vB")'
      }}
    ></div>
    <div className="relative h-full max-w-[1280px] mx-auto px-6 md:px-20 flex flex-col justify-end pb-12">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-primary/20 text-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-primary/30">
            Lễ hội âm nhạc
          </span>
          <span className="bg-white/10 backdrop-blur text-white px-3 py-1 rounded text-xs font-medium uppercase border border-white/10">
            Công nghệ &amp; AI
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight text-white drop-shadow-2xl">
          Giấc Mơ Neon: <br />
          <span className="text-primary drop-shadow-[0_0_10px_rgba(124,63,237,0.8)]">
            Thế Hệ AI
          </span>{" "}
          2024
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-[#a692c8]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              calendar_today
            </span>
            <span className="text-lg font-medium">25 Tháng 10, 2024</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              schedule
            </span>
            <span className="text-lg font-medium">19:00 - 02:00</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              location_on
            </span>
            <span className="text-lg font-medium">
              Trung tâm Hội nghị Quốc gia, Sài Gòn
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* Main Content Area */}
  <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-12">
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Left Column */}
      <div className="flex-1 space-y-16">
        {/* Description */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-primary rounded-full" />
            Mô tả chi tiết
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
            <p className="text-lg">
              Chào mừng đến với tương lai của âm nhạc điện tử. Giấc Mơ Neon: Thế
              Hệ AI là trải nghiệm đắm chìm đầu tiên kết hợp trí tuệ nhân tạo
              với sự sáng tạo của con người. Trải nghiệm hành trình 7 giờ qua
              những cảnh quan âm thanh được tạo ra theo thời gian thực bởi mạng
              lưới thần kinh, được tuyển chọn bởi các nhà sản xuất hàng đầu thế
              giới.
            </p>
            <p>
              Với sân khấu hologram 360 độ, hệ thống ánh sáng tương tác sinh
              trắc học phản ứng theo năng lượng đám đông, và hệ thống âm thanh
              không gian vượt trội. Đây không chỉ là một buổi hòa nhạc; đó là
              cái nhìn vào thế kỷ tiếp theo của ngành giải trí.
            </p>
          </div>
        </section>
        {/* Artists / Lineup */}
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-primary rounded-full" />
            Nghệ sĩ tham gia
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div
                className="size-32 rounded-full mb-4 border-2 border-primary/20 group-hover:border-primary group-hover:neon-glow transition-all duration-300 bg-cover bg-center overflow-hidden"
                data-alt="Electronic music producer portrait"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBVyWlynQvb-vrEYX28mKjHllwSmhoB8hqMaMF1tx1IexW26p5SNct-fiOywDn--xEAPU3FpwpJVgu5CDaitlUdyjLZEHlK-G3xztIBHIgSoYEtlQ7Wwr1sAQli1FhercosjJ2XWM0eKQresLyFMkCinCMuYMHOuUsV7KnqiteP66nuVV7SV9Y9NxZ4UVp-ZH5sPhJu37ZgoJMr5YyJ7mnA1i9Jfd9eOWFBul2wdr-_Inq8iDtOVyJGd4fGf8L5Mv0cbRv6dllBAbWj")'
                }}
              ></div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                DJ Cyberia
              </h3>
              <p className="text-sm text-gray-400">
                Nghệ sĩ chính / Chuyên gia AI
              </p>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div
                className="size-32 rounded-full mb-4 border-2 border-primary/20 group-hover:border-primary group-hover:neon-glow transition-all duration-300 bg-cover bg-center overflow-hidden"
                data-alt="Techno artist portrait"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAa6543hCCX5o5DrM8Zuazsdexk3iWA6xF78CNEje3gvGpyS0wSdyH3zOpFWtlqka2yhEElINQti_fGp57HZK5o97s54r-2HNDZ0txybF74m5ZJewBvn5Jg0sNkT1PSdJ6gXepna6ysntZ0pzjlLRE9i-djVvta5s3pbk9U-OKsnQ4G-kYk4r0Tw0JkB4hzjkw4SndFqrm6PgqP8EV54SNGNYaUjrqIJVcSHsw2rQn3ghDM3u1y7fKi9SE_fDoSKaMS54diAUYDIVry")'
                }}
              ></div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                Nova Prime
              </h3>
              <p className="text-sm text-gray-400">Deep Techno</p>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div
                className="size-32 rounded-full mb-4 border-2 border-primary/20 group-hover:border-primary group-hover:neon-glow transition-all duration-300 bg-cover bg-center overflow-hidden"
                data-alt="Visual artist portrait"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAm6ulzOBIDR9dLVRBfb6TbpBwDlLUWbxsB2MXhkGr8TEfWNdMDM3q8lkdvsIuw3ZJfD4_zvjRUtgTdxqPes_YrpR5RCfegzAhiBGFejCm-C97HiWj-Lv24ELPaIQdOgpqnn9kBHmiLB_mpenxnPHOsbSI4pFgi5KHtSx_fvWPRL_O61AcjTm85dnXiJExY_SmDoBDRgD2ScKpLHOyLgcLn5mW9PQo4R6u09xSiemDDhHONj-5INZZ25sg2QV0VxPKB2MSDNe3EsFEm")'
                }}
              ></div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                VFX Master
              </h3>
              <p className="text-sm text-gray-400">Kiến trúc sư hình ảnh</p>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div
                className="size-32 rounded-full mb-4 border-2 border-primary/20 group-hover:border-primary group-hover:neon-glow transition-all duration-300 bg-cover bg-center overflow-hidden"
                data-alt="Musician portrait"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuABr8Iekwq64McW41FVEPirG9Puvl2Z3EaFu9gP_3vVm4mE7gdWcDlRJNv8FqYbPl-r3wyZA7Vo9uL-ZPNDfuIBqOA1lLrZCjpfHqIU9qSAXBh-Kx_yLP8RkoA3qsh4j6WQQF8dE6qfy9KPew_qvoVRrKvwoB4Wt5wVBYPOSL4Ld9LMkvvxIz-KYZ-KEX2YjMHZxMQRuCobLdSz_90wpUPsLnVP0MnPHjkETt-LiehHTq-jMFbZIb965ai_E4ewpzQUPwnILecUHAcg")'
                }}
              ></div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                Synth Wave
              </h3>
              <p className="text-sm text-gray-400">Nghệ sĩ khởi động</p>
            </div>
          </div>
        </section>
        {/* Agenda / Timeline */}
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-primary rounded-full" />
            Chương trình sự kiện
          </h2>
          <div className="relative pl-8">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 timeline-line" />
            <div className="relative mb-10">
              <div className="absolute -left-10 mt-1.5 size-4 rounded-full bg-primary neon-glow" />
              <div className="glass p-5 rounded-xl">
                <span className="text-primary font-bold">19:00 - 20:30</span>
                <h4 className="text-xl font-bold mt-1">
                  Mở cửa &amp; Khởi động
                </h4>
                <p className="text-gray-400 mt-2">
                  Âm thanh AI xung quanh và triển lãm hình ảnh giới thiệu.
                </p>
              </div>
            </div>
            <div className="relative mb-10">
              <div className="absolute -left-10 mt-1.5 size-4 rounded-full bg-primary/40 border-2 border-primary"></div>
              <div className="glass p-5 rounded-xl">
                <span className="text-primary font-bold">20:30 - 22:30</span>
                <h4 className="text-xl font-bold mt-1">
                  Màn I: Mạng lưới thần kinh
                </h4>
                <p className="text-gray-400 mt-2">
                  Biểu diễn mở màn bởi Synth Wave tiếp theo là Nova Prime.
                </p>
              </div>
            </div>
            <div className="relative mb-10">
              <div className="absolute -left-10 mt-1.5 size-4 rounded-full bg-primary/40 border-2 border-primary"></div>
              <div className="glass p-5 rounded-xl">
                <span className="text-primary font-bold">22:30 - 01:00</span>
                <h4 className="text-xl font-bold mt-1">
                  Sự kiện chính: Giấc Mơ Neon
                </h4>
                <p className="text-gray-400 mt-2">
                  Nghệ sĩ chính DJ Cyberia với hình ảnh AI được tạo trực tiếp và
                  màn hình hologram.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-10 mt-1.5 size-4 rounded-full bg-primary/40 border-2 border-primary"></div>
              <div className="glass p-5 rounded-xl">
                <span className="text-primary font-bold">01:00 - 02:00</span>
                <h4 className="text-xl font-bold mt-1">Dư âm</h4>
                <p className="text-gray-400 mt-2">
                  Set nhạc thư giãn và phiên kết nối mạng kỹ thuật số.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Location / Map */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-primary rounded-full" />
            Địa điểm tổ chức
          </h2>
          <div className="glass overflow-hidden rounded-2xl">
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold">
                  Trung tâm Hội nghị Quốc gia
                </h3>
                <p className="text-gray-400 mt-1">
                  79 Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh, Việt Nam
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">directions</span>
                Chỉ đường
              </button>
            </div>
            <div
              className="h-80 w-full grayscale opacity-70 contrast-125 border-t border-white/10 bg-[#121218] flex items-center justify-center relative"
              data-location="Ho Chi Minh City"
              style={{}}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent pointer-events-none"></div>
              <div className="text-primary flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl animate-bounce">
                  location_on
                </span>
                <span className="font-bold text-lg mt-2 tracking-widest uppercase">
                  Xem bản đồ
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Right Column (Sticky) */}
      <div className="w-full lg:w-[400px]">
        <div className="sticky top-28">
          <div className="glass rounded-2xl p-8 border-2 border-primary/20 shadow-2xl space-y-8">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-1">
                Giá vé
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white tracking-tight">
                  1.200.000
                </span>
                <span className="text-xl text-primary font-bold">VNĐ</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-green-400 text-sm glass px-3 py-1.5 rounded-full border-green-500/20 w-fit">
                <span className="material-symbols-outlined text-sm">
                  confirmation_number
                </span>
                <span>Còn 120 vé</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Phí dịch vụ</span>
                <span className="text-white">25.000 VNĐ</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">VAT (10%)</span>
                <span className="text-white">120.000 VNĐ</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">
                  1.345.000 VNĐ
                </span>
              </div>
            </div>
            <button className="w-full py-5 bg-primary rounded-xl font-bold text-lg neon-glow hover:translate-y-[-2px] hover:shadow-[0_0_25px_rgba(124,63,237,0.7)] transition-all flex items-center justify-center gap-3">
              <span>Mua vé ngay</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="size-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-primary">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Người bán đã xác minh</p>
                  <p className="text-xs text-gray-400">
                    Đối tác chính thức AIPromo
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="size-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-primary">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Thanh toán an toàn</p>
                  <p className="text-xs text-gray-400">Giao dịch mã hóa SSL</p>
                </div>
              </div>
            </div>
          </div>
          {/* Secondary Info */}
          <div className="mt-6 glass rounded-2xl p-6 border border-white/10">
            <h4 className="font-bold mb-4">Cần hỗ trợ?</h4>
            <p className="text-sm text-gray-400 mb-4">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7 cho mọi thắc mắc
              về vé.
            </p>
            <a
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
              href="#"
            >
              Liên hệ ban tổ chức
              <span className="material-symbols-outlined text-sm">launch</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* Related Events */}
  <section className="bg-[#121218] py-20">
    <div className="max-w-[1280px] mx-auto px-6 md:px-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-1.5 h-8 bg-primary rounded-full" />
            Có thể bạn cũng thích
          </h2>
          <p className="text-gray-400 mt-2">
            Thêm nhiều sự kiện tương lai được tuyển chọn dành cho bạn.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="size-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="size-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Event Card 1 */}
        <div className="group glass rounded-2xl overflow-hidden hover:neon-border transition-all duration-300">
          <div
            className="h-48 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            data-alt="Cyberpunk city event banner"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA0CJjrCvLX6ZIziGY6xL0wdsBegndPWXYntfqU1OUPanpxOb70UV1Q14x5P9VAXAY2pcF1sP4GtWfCM3qMGjUa5v39bJFedXqtYYqCAhJ4KfHT9Tb_lXeQWXkURWk2xb6Noxhv6mdqDhINRh_38e_brfCUMd5Wq_tSXzPo4KJUyR7RutclhKPZNR8YpNu_OL_PpCHxO7dv4_v8fzmW0kjZRqSRawFARRlJpIvER4L09MpIdA65UeKvYIst4CS4Jz02cSxMPzpIyQ4t")'
            }}
          ></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-primary px-2 py-1 rounded bg-primary/10">
                12 THÁNG 11
              </span>
              <span className="text-xs font-bold text-gray-400">
                TỪ 500K VNĐ
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              Phục Hưng Kỹ Thuật Số
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              Lễ kỷ niệm nghệ thuật NFT và trải nghiệm thực tế ảo ngay giữa lòng
              thành phố.
            </p>
          </div>
        </div>
        {/* Event Card 2 */}
        <div className="group glass rounded-2xl overflow-hidden hover:neon-border transition-all duration-300">
          <div
            className="h-48 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            data-alt="Abstract purple laser lights"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD37jc4_P8OcN5XXYS_pqMjhYH_WAwkE2fkZoyvInyRJD76_mjpe--4lupRzwKpqkGhfY01vUeEyQK2PP3v7m0EPaMxrRGIA8h6eBwOLvCCHo5xeA172gMiAESUn2hAR7umAfi6XAfEXJW48cwCEPEj2zvZl2ne9k94c3VX-7Has_u4Bh4vwXhgNzKS2gsX7OBttEMxfPxKzzMM7-_U_m0R1c46c_pbKQEYLUkDDbI1ThjelcdxyDbxycQiNr-NlYA7sY5b6v44YAWt")'
            }}
          ></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-primary px-2 py-1 rounded bg-primary/10">
                05 THÁNG 12
              </span>
              <span className="text-xs font-bold text-gray-400">
                TỪ 850K VNĐ
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              Synth City Trực Tiếp
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              Lễ hội synthwave lớn nhất Đông Nam Á trở lại với phiên bản thứ ba.
            </p>
          </div>
        </div>
        {/* Event Card 3 */}
        <div className="group glass rounded-2xl overflow-hidden hover:neon-border transition-all duration-300">
          <div
            className="h-48 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            data-alt="Futuristic glowing interface"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAk5hDwgHLr0XV5TL6SJSGd2ocNFrpMrLvj4w2yNv6jGP6jWCWQfqYESdPEtEOAgsUyUKDO8eT5R6ciMpmCS7CgUvs9PlfTGW1mFqNay97Oc6sCSs_7vyEttn1BrK68josa7BT5gR7L8wuD3h_MCNTxuDSkvHeULuTLBK61duGhcGShbMAL60WjIwnDInoiNwdhTBgKaDqAJDJCf-VUQY7pKKAooQhjJA6460WfB9jx-X21Ogj5r5xOzlpK3g8gCEgehJzxTmUnJxz6")'
            }}
          ></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-primary px-2 py-1 rounded bg-primary/10">
                20 THÁNG 1
              </span>
              <span className="text-xs font-bold text-gray-400">MIỄN PHÍ</span>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              Gặp Gỡ Nhà Sáng Tạo AI
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              Sự kiện kết nối dành cho những người đam mê công nghệ, lập trình
              viên và nghệ sĩ kỹ thuật số.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
    </main>
    <Footer/>
    </>
  )
}

export default EventDetail