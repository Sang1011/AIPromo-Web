import { Route, Routes } from "react-router-dom";
import LegalPage from "./pages/Organizer/LegalPage";
import MyEventsPage from "./pages/Organizer/MyEventsPage";
import ReportManagementPage from "./pages/Organizer/ReportManagementPage";
import SummaryPage from "./pages/Organizer/SummaryPage";
import ManagementLayout from "./components/Organizer/layouts/ManagementLayout";
import AnalyticsPage from "./pages/Organizer/AnalyticsPage";
import OrderListPage from "./pages/Organizer/OrderListPage";
import CheckInPage from "./pages/Organizer/CheckInPage";
import EditEventWizardPage from "./pages/Organizer/EditEventWizardPage";
import SeatMapEditorPage from "./pages/Organizer/SeatMapEditorPage";
import MemberManagementPage from "./pages/Organizer/MemberManagementPage";
import VoucherManagementPage from "./pages/Organizer/VoucherManagementPage";
import DashboardLayout from "./components/Organizer/layouts/DashboardLayout";
import MarketingPage from "./pages/Organizer/MarketingPage";
import MarketingDetailPage from "./pages/Organizer/MarketingDetailPage";
import HomePage from "./pages/HomePage";
import EventDetail from "./pages/EventDetail";
import AllEvent from "./pages/AllEvent";
import HistoryEvent from "./pages/HistoryEvent";
import AdminLayout from "./components/Admin/layouts/AdminLayout";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import FinanceRevenuePage from "./pages/Admin/FinanceRevenuePage";
import EventModerationPage from "./pages/Admin/EventModerationPage";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import SystemLogsPage from "./pages/Admin/SystemLogsPage";
import StaffLayout from "./components/Staff/layouts/StaffLayout";
import StaffDashboardPage from "./pages/Staff/StaffDashboardPage";
import EventApprovalPage from "./pages/Staff/EventApprovalPage";
import OrganizerProfilePage from "./pages/Staff/OrganizerProfilePage";

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

      {/* Management group */}
      <Route path="/organizer/my-events/:eventId" element={<ManagementLayout />}>
        <Route path="overview" element={<SummaryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="marketing/:marketingId" element={<MarketingDetailPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="check-in" element={<CheckInPage />} />
        <Route path="members" element={<MemberManagementPage />} />
        <Route path="edit" element={<EditEventWizardPage />} />
        <Route path="seat-map" element={<SeatMapEditorPage />} />
        <Route path="vouchers" element={<VoucherManagementPage />} />
      </Route>

      {/* Admin group */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="finance" element={<FinanceRevenuePage />} />
        <Route path="events" element={<EventModerationPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="logs" element={<SystemLogsPage />} />
      </Route>

      {/* Staff group */}
      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<StaffDashboardPage />} />
        <Route path="event-approval" element={<EventApprovalPage />} />
        <Route path="organizer-profile" element={<OrganizerProfilePage />} />
      </Route>
    </Routes>
   
  );
}

export default App;
