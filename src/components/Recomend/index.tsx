import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import API from '../../services/api';

// Interfaces
interface RecommendationEvent {
  eventId: string;
  finalScore: number;
  semanticScore: number;
  source: string;
  title: string;
  bannerUrl: string;
  location: string | null;
  eventStartAt: string | null;
  eventEndAt: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}

interface ApiResponse {
  isSuccess: boolean;
  data: RecommendationEvent[];
  message: string;
  timestamp: string;
}
interface UserInfo {
  userId?: string;
  name?: string;
  roles?: string[];
}

export default function EventRecommendations() {
  const [events, setEvents] = useState<RecommendationEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentInfor } = useSelector((state: RootState) => state.AUTH);
  const user = currentInfor as UserInfo;
  const userId = user?.userId;

  useEffect(() => {
    // Chỉ gọi API khi đã có userId từ Redux
    if (userId) {
      fetchRecommendations(userId);
    }
  }, [userId]);

  const fetchRecommendations = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      // Sử dụng API.callWithToken() - nó sẽ tự lấy token từ localStorage 
      // hoặc bạn có thể truyền token vào nếu muốn: API.callWithToken(myToken)
      const response = await API.callWithToken().get<ApiResponse>(
        `/activity/recommendations/${uid}`, 
        {
          params: {
            topN: 20,
            futureOnly: false
          }
        }
      );

      // Với Axios, dữ liệu trả về từ Server nằm trong response.data
      const result = response.data;

      if (result.isSuccess) {
        setEvents(result.data);
      } else {
        throw new Error(result.message || 'Không thể lấy dữ liệu gợi ý');
      }
    } catch (err: any) {
      // Axios trả về lỗi trong err.response?.data?.message hoặc err.message
      const errorMessage = err.response?.data?.message || err.message || 'Đã có lỗi xảy ra';
      setError(errorMessage);
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic Render (Giữ nguyên các phần cũ) ---
  if (loading) return <div className="p-6 animate-pulse text-gray-400 text-center">Đang tìm kiếm sự kiện phù hợp...</div>;
  
  if (error) return (
    <div className="p-6 text-center">
      <p className="text-red-400 mb-2">{error}</p>
      <button 
        onClick={() => userId && fetchRecommendations(userId)}
        className="text-primary hover:underline text-sm"
      >
        Thử lại
      </button>
    </div>
  );

  if (!userId) return null;

  return (
    <div className="p-6 bg-background-dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Zap className="text-primary fill-primary" size={24} />
          <h1 className="text-2xl font-bold text-white tracking-tight">Gợi Ý Dành Cho Bạn</h1>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border-dark rounded-2xl">
            <p className="text-text-muted">Chưa có gợi ý nào vào lúc này.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component EventCard giữ nguyên logic format...
function EventCard({ event }: { event: RecommendationEvent }) {
  const matchPercentage = Math.round(event.finalScore * 100);
  
  return (
    <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden hover:border-primary transition-all group flex flex-col h-full">
      <div className="relative h-40">
        <img src={event.bannerUrl} className="w-full h-full object-cover" alt="" />
        <div className="absolute top-2 right-2 bg-primary/90 text-[10px] font-bold px-2 py-1 rounded text-white shadow-lg">
          {matchPercentage}% MATCH
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-white font-semibold line-clamp-2 mb-4 h-12 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-gray-400">
            <MapPin size={14} className="text-primary" />
            <span className="truncate">{event.location || 'Hồ Chí Minh'}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border-dark">
            <span className="text-primary font-bold">
              {event.minPrice ? `${event.minPrice.toLocaleString()}đ` : 'Miễn phí'}
            </span>
            <button className="text-white bg-surface-dark p-1.5 rounded-lg group-hover:bg-primary transition-colors">
               <Zap size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}