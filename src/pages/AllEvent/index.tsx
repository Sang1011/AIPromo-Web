
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import "./AllEvent.css"
function AllEvent() {
  return (
    <>
    <Header/>
  <main className="max-w-[1440px] mx-auto px-6 py-8">
  {/* Page Title & Header Section */}
<div className="mb-8 flex flex-col items-center gap-4 text-center">
  <h1 className="pt-10 text-4xl font-bold text-white mb-2">
    Discover All Events
  </h1>

  <p className="text-slate-400">
    Find the next great experience curated just for you.
  </p>
</div>
  {/* Filter Bar Section */}
  <div className="glass-effect rounded-2xl p-4 mb-10 flex flex-wrap items-center gap-4">
    {/* Filter Dropdowns */}
    <div className="flex flex-wrap items-center gap-3">
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface/80 border border-white/10 text-slate-200 hover:border-primary/50 transition-all text-sm font-medium">
        <span className="material-symbols-outlined text-primary text-[20px]">
          category
        </span>
        Category
        <span className="material-symbols-outlined text-slate-500 text-[18px]">
          expand_more
        </span>
      </button>
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface/80 border border-white/10 text-slate-200 hover:border-primary/50 transition-all text-sm font-medium">
        <span className="material-symbols-outlined text-primary text-[20px]">
          calendar_month
        </span>
        Date
        <span className="material-symbols-outlined text-slate-500 text-[18px]">
          expand_more
        </span>
      </button>
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface/80 border border-white/10 text-slate-200 hover:border-primary/50 transition-all text-sm font-medium">
        <span className="material-symbols-outlined text-primary text-[20px]">
          payments
        </span>
        Price
        <span className="material-symbols-outlined text-slate-500 text-[18px]">
          expand_more
        </span>
      </button>
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface/80 border border-white/10 text-slate-200 hover:border-primary/50 transition-all text-sm font-medium">
        <span className="material-symbols-outlined text-primary text-[20px]">
          location_on
        </span>
        Location
        <span className="material-symbols-outlined text-slate-500 text-[18px]">
          expand_more
        </span>
      </button>
      
    </div>
    <div className="h-8 w-px bg-white/10 hidden xl:block" />
    {/* Active Filters / Tags */}
    <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/30 flex items-center gap-1">
        Music{" "}
        <span className="material-symbols-outlined text-[14px] cursor-pointer">
          close
        </span>
      </span>
      <span className="bg-white/5 text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1">
        This Weekend{" "}
        <span className="material-symbols-outlined text-[14px] cursor-pointer">
          close
        </span>
      </span>
      <button className="text-slate-500 text-xs font-bold hover:text-white transition-colors underline underline-offset-4 px-2">
        Clear all
      </button>
    </div>
  </div>
  {/* Events Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {/* Event Card 1 */}
    <div className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 card-glow flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt="Techno Night"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-alt="Vibrant night club music event with neon lights"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwC6ug6xw7ZAEzRPGWtLVaZAnUgRYzncfpvAQdwUmdCQ3Y37-REcondMOsXrSg-a-ITCY6248vgJglrAiHoM6xRHukbll5djgwAFxYId4cUkf5MsUddfAYWe17tCE-yOqKDmJGvtWE8SpCTVlRiZvNXoY_AbEZq466DjJgYSafJdsnP1sTRgQ6qg42BkczvdzVETwfNfll9fGybtU8Ghyc0upPuEBkvSFjZ5stdWAER3GuBfInE2i2y5zqTWSjgJOyjs4w-_woF8Yy"
        />
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(121,59,237,0.8)]">
          $45.00
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Music • Techno
        </div>
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          Neon Pulse: Underground Techno Night
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              calendar_today
            </span>
            Oct 24, 2024 • 22:00
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              location_on
            </span>
            Berlin, DE
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.4)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
    {/* Event Card 2 */}
    <div className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 card-glow flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt="Tech Conference"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-alt="Modern technology conference with large stage"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8OmsUNasDHr30Ocl6atpoXR4qeZOjeAaa7i6pd95R9f6gxH0TU1yd7torP6CXegmn2A74ANyp7M1-JoalnL4-sFCkBihwDDnrceD5i644Y7Hws04YXFju8_duh1RyrgzALA0dfzSRRy68Ld1SFYZ5MU10YgDWnVbpr3Vix5tFVHLeYlGl0ID3eKd5lyA6kMv9-Y4AcEEH-AlDKN6gJDUhEqTu1Ur2Adlvw41aNJKtVd52hdtdOtc2xyd2TeGjx_QCw8_iS7iJs6fo"
        />
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(121,59,237,0.8)]">
          FREE
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          Tech • AI
        </div>
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          AI Summit 2024: The Future of Automation
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              calendar_today
            </span>
            Nov 12, 2024 • 09:00
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              location_on
            </span>
            Online
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.4)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
    {/* Event Card 3 */}
    <div className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 card-glow flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt="Workshop"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-alt="Creative painting workshop with people collaborating"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh3entg0zLWI1C6bAvMnFyJUmClEd-pJyVbcyux9FIAsZkLAVJwmkB2yU3zmWsFVRV89As18y9X8dwThVEuFAbSyB3Cj2Ny6J9W0pg7Xz1oz04zwCkOV022xjSsQ4ogysi6Hbur0HYPmoK1We7KzMmG29fsdqj_LTQMwzQpiOquAcalYU7bXYUQmP7RgvwTd6J7EiffVIDEvKlcJjem2LHMQTRyMgJxlM2-FNubpd5rPN2HnyOd-_wSNTHCtN1ggaZdjinqEcvrLDD"
        />
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(121,59,237,0.8)]">
          $25.00
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          Workshop • Art
        </div>
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          Abstract Neon Art: Painting Masterclass
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              calendar_today
            </span>
            Oct 30, 2024 • 14:00
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              location_on
            </span>
            London, UK
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.4)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
    {/* Event Card 4 */}
    <div className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 card-glow flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt="Rock Concert"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-alt="Concert stage with colorful floodlights and crowd"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHpBr9UD8X_QhLR1FKFFwNncvgST1miSkNfRFGQasIREN-dQEtFcIoUTNe1se7nZodbheJUvBI3N8Skv_WbYn3yDz6M7gMzPzjnIUEN9vt89onpS5NSjFbdFAPPxSoi7DVrnoSPRAHVPU4TCHXTaKQ5v6w1Ic3sY_E-_yh1P8xq4qsZbE75J4CbX5SbSSITQ9SQB_gv8omFexqFBMnCzaIjlFt9uB9li43-W_B7vxmCcMzRO0oTUtWxE8RatCE97mZhAFKrIFEYtdO"
        />
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(121,59,237,0.8)]">
          $120.00
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          Music • Rock
        </div>
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          Stellar Harmonies: Open Air Rock Fest
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              calendar_today
            </span>
            Dec 05, 2024 • 18:30
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              location_on
            </span>
            Sydney, AU
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.4)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
    {/* Event Card 5 (Repeated for Grid Visual) */}
    <div className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 card-glow flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt="Networking"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-alt="Professionals networking at a formal rooftop lounge"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIKx9wj3uWUgawlZiWKcX-SLrb9OnQMrEGjgV-aB8VRqYqaLhOMufubjrpfRIR-jwNOF0Za-m74IkXgcJC-UomLeDZU0CtondfARlZOcOBaEDCNYKgujEJ9MZmcybIbQgffs7BsDahQbRDg4rkocRX7xiPojZzEtnq04OReuPxxn_-crLJeanidoyjyex5kIF8pw6DVblDk76jPN_1syO241DsVPpM-O2jOaVN7i8UygD3a3wBvgXIRgZjd_TlEd7SFGJhPupUxfcd"
        />
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(121,59,237,0.8)]">
          $15.00
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          Networking • Business
        </div>
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          Creators Mixer: Rooftop Networking
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              calendar_today
            </span>
            Oct 28, 2024 • 19:00
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              location_on
            </span>
            New York, NY
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.4)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
    {/* Event Card 6 (Repeated for Grid Visual) */}
    <div className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 card-glow flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt="Jazz Night"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-alt="Close up of a jazz saxophonist in a moody lit bar"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNwxpfcpXWe6RxsiWxoZWxll8VnNq50KIgXXPbjhzsFrlwuNp2-7txbhnUHnDbzOJ36xBU0qkVeqyqAs7qkl0iBj38K5vJ3a8sIbG3CAVGuXuzEZqB1we6kTefYfA-uaDeLBaOG5CT6NUDv-twZcbesZCN6lLkA82mAAVZdVyrkpCQgrG-BxbGSrZNlCALXOhTGPZTDm7tR9i7-bO7zpehf977zRmdzXTUeAYUZ-6ia7dHsNpIpTI8U0Olbm6VMql41NKcQyT6ehjB"
        />
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(121,59,237,0.8)]">
          $30.00
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          Music • Jazz
        </div>
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          Midnight Jazz: Soulful Saxophone
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              calendar_today
            </span>
            Nov 02, 2024 • 21:00
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              location_on
            </span>
            Paris, FR
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.4)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
    {/* Event Card 7 (Repeated for Grid Visual) */}
    <div className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 card-glow flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt="Startup Workshop"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-alt="Group of young people brainstorm with post-it notes"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_EkpYMwZpLbs8ViEqmd52LE6w0f9-h-mu6UbXw8VKHWg8ua8WLgOO5BcH7sZPsAAEyF_4FYJfcnXjG2ayqzPSZ-McMdiAlQtMrN3crIEQORA0UrzbA72bD0GgZBkBGD4LyFc2PvCZp4cVCM20JHpB4tuTb66JyeEhByFt1RYly6M1ug4KPZUcOFrv_hRrcHfm7pouoPF8x5mDQ3dzvx4vye5XbCXBJsvLWwsBQMgurS8fOTQTuZ9rMHk_stclz5JFoIIatnqBn3GI"
        />
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(121,59,237,0.8)]">
          FREE
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          Workshop • Startup
        </div>
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          Startup Fundamentals: Pitching to VCs
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              calendar_today
            </span>
            Nov 08, 2024 • 10:00
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              location_on
            </span>
            Singapore, SG
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.4)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
    {/* Event Card 8 (Repeated for Grid Visual) */}
    <div className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 card-glow flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt="Food Festival"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-alt="Variety of colorful street food stalls at night"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXZ_Xd21e-PwIVfTrcmQ70Q9gLYUY6bUTMYAZpt5yprlbNOD62iEs4jTJMVu57kF5TMjUbr_zYKZ6Xr58zOVlK98GBVWmogZbMij2IFr4RiqTMcYPyZ10qFSCPp2iU2_3cbMPd1a1lHLDnS-YxoO4onqqGDj5rTXN2Vxc4hb1LkNwD_77b9vkyIiLym2VSgwjzafRkY2uZUpjToHE5HtWHFzGEaTV6gOSB4JggIcpm1LBY7uF7twjcbw8WzMxuzdzm5CGGydvSCBX0"
        />
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(121,59,237,0.8)]">
          $5.00
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          Lifestyle • Food
        </div>
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          Global Street Food Festival 2024
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              calendar_today
            </span>
            Oct 27, 2024 • 12:00
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              location_on
            </span>
            Tokyo, JP
          </div>
        </div>
        <div className="mt-auto">
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.4)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  </div>
  {/* Pagination */}
  <div className="mt-16 flex items-center justify-center gap-4">
    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-white/10 text-slate-400 hover:text-white hover:border-primary/50 transition-all">
      <span className="material-symbols-outlined">chevron_left</span>
    </button>
    <div className="flex items-center gap-2">
      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold">
        1
      </button>
      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-white/10 text-slate-400 hover:text-white transition-all font-bold">
        2
      </button>
      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-white/10 text-slate-400 hover:text-white transition-all font-bold">
        3
      </button>
      <span className="text-slate-600 px-2">...</span>
      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-white/10 text-slate-400 hover:text-white transition-all font-bold">
        12
      </button>
    </div>
    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-white/10 text-slate-400 hover:text-white hover:border-primary/50 transition-all">
      <span className="material-symbols-outlined">chevron_right</span>
    </button>
  </div>
</main>
<Footer/>
</>
  )
}

export default AllEvent