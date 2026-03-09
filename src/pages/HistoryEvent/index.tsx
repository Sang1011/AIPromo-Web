import Header from '../../components/Header'
import Footer from '../../components/Footer'
import "./historyEvent.css"
function HistoryEvent() {
  return (
    <>
<Header/>
    <main className="w-full py-24">  
  <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="space-y-3">
        <h2 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Lịch sử mua vé
        </h2>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-slate-500 dark:text-[#a692c8] text-lg">
            Hệ thống đang lưu trữ 5 vé của bạn
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            className="bg-slate-100 dark:bg-card-dark border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
            placeholder="Tìm kiếm vé..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
            search
          </span>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-card-dark text-slate-900 dark:text-white rounded-lg font-bold text-sm border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all">
          <span className="material-symbols-outlined text-lg">filter_list</span>
          Lọc nâng cao
        </button>
      </div>
    </div>
    <div className="mb-10">
      <div className="flex border-b border-slate-200 dark:border-white/5 gap-10">
        <a className="relative flex items-center gap-2 py-4 group" href="#">
          <span className="text-base font-bold text-primary">Tất cả</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary">
            05
          </span>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
        </a>
        <a
          className="relative flex items-center gap-2 py-4 group text-slate-500 dark:text-[#a692c8] hover:text-white transition-colors"
          href="#"
        >
          <span className="text-base font-bold">Sắp diễn ra</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            01
          </span>
        </a>
        <a
          className="relative flex items-center gap-2 py-4 group text-slate-500 dark:text-[#a692c8] hover:text-white transition-colors"
          href="#"
        >
          <span className="text-base font-bold">Đã hoàn thành</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            03
          </span>
        </a>
        <a
          className="relative flex items-center gap-2 py-4 group text-slate-500 dark:text-[#a692c8] hover:text-white transition-colors"
          href="#"
        >
          <span className="text-base font-bold">Đã hủy</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            01
          </span>
        </a>
      </div>
    </div>
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row gap-8 items-stretch">
        <div
          className="w-full lg:w-80 h-52 bg-center bg-no-repeat bg-cover rounded-xl shrink-0 overflow-hidden relative group"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6sk8uLkavSoLkmjZjNxjyDshvKojy_nfrQtPDm-E_jTdzyy00Dk5GlBsHKMONYGFVPaTOoPa47P1RFGfTc8pbFxDQ5MWyEcH6oRGT-FcOlksiVzaNOSlcAarYn0OCY42To22xv33q63Fsd76rEqFhgISJqfUtPSxbl5SgygwmHdob7sIRSme-YMQF1jeYlfSTWJmMb7uZ6NfeT8zn2juuyZ9CFqQ7Z-HfBrCsgnJX-mn9hzRaaUH_dyUPfg4emW-w_i2lt8O_p-Gt")'
          }}
        >
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/40 transition-colors">
              <span className="material-symbols-outlined text-white">
                zoom_in
              </span>
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider status-badge-upcoming">
                  Sắp diễn ra
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-white/60">
                  Vé VIP
                </span>
              </div>
              <span className="text-slate-500 text-sm font-mono">
                #AP-99231
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
              AI Tech Summit 2024: Future is Now
            </h3>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-slate-500 dark:text-[#a692c8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  calendar_month
                </span>
                <span className="font-medium">Thứ 7, 12/10/2024</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  location_on
                </span>
                <span className="font-medium">
                  Trung tâm Hội nghị Quốc gia, Hà Nội
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-10">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">
                  Số lượng
                </p>
                <p className="text-2xl font-bold dark:text-white text-slate-900">
                  02{" "}
                  <span className="text-sm font-normal text-slate-500">
                    Người
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">
                  Tổng tiền
                </p>
                <p className="text-2xl font-bold text-primary">1.200.000đ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-all underline underline-offset-4 decoration-primary/30">
                Chi tiết đơn hàng
              </button>
              <button className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-base neon-glow hover:brightness-110 hover:-translate-y-0.5 transition-all">
                <span className="material-symbols-outlined">qr_code_2</span>
                Xem vé QR
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row gap-8 items-stretch opacity-90">
        <div
          className="w-full lg:w-80 h-52 bg-center bg-no-repeat bg-cover rounded-xl shrink-0 grayscale-[0.3]"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAUXKUDrRM-TDEbYjQEGvaoD0Bkk28aQGsAT28Cz6ACDMwqJcFUNMYrL6vNLMT3K-69Id0Lu479u2ZmHrNCiV0nbGEEJ7v3Ysl-77lt6B2JNAUlL8B4nXHYYEmlj8JfoKPNMBnt7uju1ZRqpSw2rPAFJUNzTTDk6N5WdR1hHTpn5FIFSRFnNw9EI6QSjFzyfQrAecZU6YbCDLSbZEjwWpDdi6MVKBn3cWTsv6CoE4HxJ0xXw_yrQcCbcHktiiaqa_FfSdw-7C7h6KGi")'
          }}
        ></div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider status-badge-completed">
                Đã hoàn thành
              </span>
              <span className="text-slate-500 text-sm font-mono">
                #AP-88412
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Music Festival: Neon Night 2023
            </h3>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-slate-500 dark:text-[#a692c8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
                <span>20/09/2023</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">location_on</span>
                <span>Sân vận động Mỹ Đình, Hà Nội</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-10">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">
                  Số lượng
                </p>
                <p className="text-2xl font-bold dark:text-white text-slate-900">
                  01
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">
                  Tổng tiền
                </p>
                <p className="text-2xl font-bold text-primary">450.000đ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 text-slate-400 hover:text-primary font-bold transition-all">
                Gửi đánh giá
              </button>
              <button className="flex items-center gap-2 px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-base hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined">description</span>
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row gap-8 items-stretch opacity-70">
        <div
          className="w-full lg:w-80 h-52 bg-center bg-no-repeat bg-cover rounded-xl shrink-0 grayscale"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCy7oKXPgbD8MZMvB3Dlb1cFyTI72b15gI1z_COkhG7Bn_agklmbHwRWZrKrHX5nAsMuKWe4AZZsy2s0U0Z28YJvpsZI2HzPF7hZaNv0i9sJW7ET7rXIpKFLGs7_bY5Nabd31ARujK1cIX35WoqOt4iQRdW-H4eXoJG2OOaGCIxKmauTtrGZ8lsr2SRfFz5MqnKa9AtrgIuphz2GdhX2yrqQXoURIR4lRH54yf3QphixruDlwlRoJXMZgw1jmYUHamy078pBO54sA90")'
          }}
        ></div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider status-badge-cancelled">
                Đã hủy
              </span>
              <span className="text-slate-500 text-sm font-mono">
                #AP-77610
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Workshop: UI Design with AI
            </h3>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-slate-500 dark:text-[#a692c8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
                <span>05/08/2023</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">location_on</span>
                <span>Creative Hub, District 1, HCM</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-10">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">
                  Số lượng
                </p>
                <p className="text-2xl font-bold text-slate-500">01</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">
                  Đã hoàn tiền
                </p>
                <p className="text-2xl font-bold text-slate-500">200.000đ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-all">
                Lý do hủy
              </button>
              <button className="flex items-center gap-2 px-8 py-3.5 bg-white/5 text-slate-600 rounded-xl font-bold text-base cursor-not-allowed border border-white/5">
                <span className="material-symbols-outlined">close</span>
                Không khả dụng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-16 flex flex-col items-center gap-4">
      <button className="flex items-center gap-2 px-8 py-3 bg-card-dark border border-primary/20 hover:border-primary/60 text-white rounded-full font-bold transition-all">
        Xem thêm lịch sử
        <span className="material-symbols-outlined">expand_more</span>
      </button>
      <p className="text-slate-500 text-sm mt-4 italic">
        Hiển thị 3 trên tổng số 5 vé
      </p>
    </div>
  </div>
</main>
<Footer/>
</>

  )
}

export default HistoryEvent