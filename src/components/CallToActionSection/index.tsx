import { Link } from "react-router-dom"

function CallToActionSection() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-primary rounded-[3rem] p-16 relative overflow-hidden text-center flex flex-col items-center gap-8 shadow-2xl shadow-primary/30">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="absolute -top-32 -right-32 size-80 bg-white/20 rounded-full blur-[120px]" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
              Nâng tầm sự kiện của bạn ngay hôm nay!
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <button className="bg-white text-primary hover:bg-slate-50 px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl">
               <Link to="/verify-organizer"> Bắt đầu miễn phí</Link> 
              </button>
              <a
                href="https://www.facebook.com/profile.php?id=61573284472767&locale=vi_VN"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 px-12 py-5 rounded-2xl font-black text-xl transition-all inline-block text-center"
              >
                Liên hệ tư vấn
              </a>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}

export default CallToActionSection
