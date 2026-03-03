import React, { useMemo, useState } from "react";

interface EventCardProps {
  category: string;
  image: string;
  date: string;
  title: string;
  location: string;
  price: string;
}

const EventCard: React.FC<EventCardProps> = ({
  category,
  image,
  date,
  title,
  location,
  price,
}) => {
  return (
    <div
      className="rounded-[2rem] overflow-hidden group cursor-pointer
      transition-all duration-300 hover:-translate-y-1
      flex flex-col h-full"
      style={{
        background: "#18122B",
        border: "1px solid rgba(124,59,237,0.1)",
        backdropFilter: "blur(16px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = "1px solid rgba(124,59,237,0.4)";
        e.currentTarget.style.boxShadow =
          "0 0 30px rgba(124,59,237,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(124,59,237,0.1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${image}')` }}
        />
        <div
          className="absolute top-6 left-6 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase z-10"
          style={{
            background: "linear-gradient(135deg,#7c3bed,#a855f7)",
          }}
        >
          {category}
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(11,11,18,0.9), rgba(124,59,237,0.2))",
          }}
        />
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold mb-3">
          <span className="material-symbols-outlined text-sm">
            calendar_today
          </span>
          {date}
        </div>

        <h3 className="text-2xl font-bold text-white leading-snug mb-6 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-sm">
              location_on
            </span>
            <span className="text-sm">{location}</span>
          </div>

          <div
            className="text-xl font-black"
            style={{
              background:
                "linear-gradient(135deg,#7c3bed 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {price}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventListSection: React.FC = () => {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("Mọi lúc");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả thể tag");
  const [locationFilter, setLocationFilter] = useState("Địa điểm");

  const events: EventCardProps[] = [
    {
      category: "Tech AI",
      image: "https://picsum.photos/600/400?1",
      date: "15/12/2024",
      title: "AI & Tương lai ngành Sáng tạo",
      location: "Hồ Chí Minh",
      price: "450.000đ",
    },
    {
      category: "Music",
      image: "https://picsum.photos/600/400?2",
      date: "22/12/2024",
      title: "Neon Night Music Festival",
      location: "Hà Nội",
      price: "1.200k",
    },
    {
      category: "Workshop",
      image: "https://picsum.photos/600/400?3",
      date: "28/12/2024",
      title: "Lớp vẽ màu nước căn bản",
      location: "Đà Lạt",
      price: "Miễn phí",
    },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchSearch = event.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "Tất cả thể tag" ||
        event.category === categoryFilter;

      const matchLocation =
        locationFilter === "Địa điểm" ||
        event.location === locationFilter;

      return matchSearch && matchCategory && matchLocation;
    });
  }, [search, categoryFilter, locationFilter]);

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #070a17 0%, #0b0f1f 50%, #070a17 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2rem] border border-white/10 mb-16">
          <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
            <div>
              <h2 className="text-5xl font-black text-white mb-3">
                Sự kiện nổi bật
              </h2>
              <p className="text-slate-400">
                Khám phá và tham gia những sự kiện đỉnh cao nhất.
              </p>
            </div>

            <button className="px-6 py-3 rounded-xl bg-white/10 text-indigo-400 font-semibold hover:bg-white/20 transition">
              Tất cả sự kiện 
            </button>
          </div>

          {/* FILTER BAR */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* SEARCH */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm tên sự kiện..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f1326] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* TIME */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-[#0f1326] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-indigo-500"
            >
              <option>Mọi lúc</option>
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>

            {/* CATEGORY */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0f1326] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-indigo-500"
            >
              <option>Tất cả thể tag</option>
              <option>Tech AI</option>
              <option>Music</option>
              <option>Workshop</option>
            </select>

            {/* LOCATION */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-[#0f1326] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-indigo-500"
            >
              <option>Địa điểm</option>
              <option>Hồ Chí Minh</option>
              <option>Hà Nội</option>
              <option>Đà Lạt</option>
            </select>
          </div>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
          {filteredEvents.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            Không tìm thấy sự kiện phù hợp.
          </div>
        )}
      </div>
    </section>
  );
};

export default EventListSection;
