import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/Organizer/layouts/DashboardLayout";
import ManagementLayout from "./components/Organizer/layouts/ManagementLayout";
import AnalyticsPage from "./pages/Organizer/AnalyticsPage";
import CheckInPage from "./pages/Organizer/CheckInPage";
import EditEventWizardPage from "./pages/Organizer/EditEventWizardPage";
import EventTicketPage from "./pages/Organizer/EventTicketPage";
import LegalPage from "./pages/Organizer/LegalPage";
import MarketingDetailPage from "./pages/Organizer/MarketingDetailPage";
import MarketingPage from "./pages/Organizer/MarketingPage";
import MemberManagementPage from "./pages/Organizer/MemberManagementPage";
import MyEventsPage from "./pages/Organizer/MyEventsPage";
import OrderListPage from "./pages/Organizer/OrderListPage";
import ReportManagementPage from "./pages/Organizer/ReportManagementPage";
import SummaryPage from "./pages/Organizer/SummaryPage";
import VoucherManagementPage from "./pages/Organizer/VoucherManagementPage";
import SeatMapEditorPage from "./pages/Organizer/SeatMapEditorPage";
import HomePage from "./pages/HomePage";
import EventDetail from "./pages/EventDetail";
import AllEvent from "./pages/AllEvent";
import HistoryEvent from "./pages/HistoryEvent";

function App() {
  return (
    <Routes>
      {/*Attendee*/}
      <Route path="/" element={<HomePage />} />
      <Route path="/event-detail" element={<EventDetail />} />
      <Route path="/all-event" element={<AllEvent />} />
      <Route path="/history-event" element={<HistoryEvent />} />
      {/* Dashboard group */}
      <Route path="/organizer" element={<DashboardLayout />}>
        <Route path="my-events" element={<MyEventsPage />} />
        <Route path="reports" element={<ReportManagementPage />} />
        <Route path="legals" element={<LegalPage />} />
      </Route>

      {/* Organizer group */}
      <Route path="/organizer/my-events/:eventId" element={<ManagementLayout />}>
        <Route path="overview" element={<SummaryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="marketing/:marketingId" element={<MarketingDetailPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="check-in" element={<CheckInPage />} />
        <Route path="members" element={<MemberManagementPage />} />
        <Route path="edit" element={<EditEventWizardPage />} />
        <Route path="seat-map" element={<EventTicketPage />} />
        <Route path="vouchers" element={<VoucherManagementPage />} />
        <Route path="seat-map/edit" element={<SeatMapEditorPage />} />
      </Route>
    </Routes>

  );
}

export default App;
