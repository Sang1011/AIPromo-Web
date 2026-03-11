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
import Login from "./pages/LoginPage";
import data from "../src/data/seat-map.json";
import SeatMapViewerPage from "./pages/Organizer/SeatMapViewerPage";
import Register from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
function App() {
  const ticketTypes = [
    { id: 'SVIP', name: 'SVIP', color: '#3b82f6', price: 5000000 },
    { id: 'VIP', name: 'VIP', color: '#a855f7', price: 4250000 },
    { id: 'PRE', name: 'PRE', color: 'lightblue', price: 3500000 },
    { id: 'CAT1', name: 'CAT 1', color: '#f59e0b', price: 2750000 },
    { id: 'CAT2', name: 'CAT 2', color: '#94a3b8', price: 1800000 },
  ];
  return (
    <Routes>
      {/*Attendee*/}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/forgot-password" element={<ForgotPassword/>} />
      <Route path="/event-detail" element={<EventDetail />} />
      <Route path="/all-event" element={<AllEvent />} />
      <Route path="/history-event" element={<HistoryEvent />} />
      {/* Dashboard group */}
      <Route path="/organizer" element={<DashboardLayout />}>
        <Route path="my-events" element={<MyEventsPage />} />
        <Route path="reports" element={<ReportManagementPage />} />
        <Route path="legals" element={<LegalPage />} />
        <Route path="create-event" element={<EditEventWizardPage />} />
      </Route>

      {/* Organizer */}
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
      </Route >
      <Route path="/organizer/my-events/:eventId/seat-map/edit" element={<SeatMapEditorPage />} />
      <Route path="/organizer/my-events/:eventId/seat-map/show" element={<SeatMapViewerPage
        seatMapData={data as any}
        mode="seat"
        ticketTypes={ticketTypes}
        onConfirm={(payload) => console.log(payload)}
      />} />
    </Routes >

  );
}

export default App;
