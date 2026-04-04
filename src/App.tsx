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
import AdminLayout from "./components/Admin/layouts/AdminLayout";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminCategoryPage from "./pages/Admin/AdminCategoryPage";
import AdminHashtagPage from "./pages/Admin/AdminHashtagPage";
import FinanceRevenuePage from "./pages/Admin/FinanceRevenuePage";
import EventModerationPage from "./pages/Admin/EventModerationPage";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import SystemLogsPage from "./pages/Admin/SystemLogsPage";
import WithdrawalPage from "./pages/Admin/WithdrawalPage";
import StaffLayout from "./components/Staff/layouts/StaffLayout";
import StaffDashboardPage from "./pages/Staff/StaffDashboardPage";
import EventApprovalPage from "./pages/Staff/EventApprovalPage";
import OrganizerProfilePage from "./pages/Staff/OrganizerProfilePage";
import Login from "./pages/LoginPage";
import SeatMapViewerPage from "./pages/Organizer/SeatMapViewerPage";
import Register from "./pages/RegisterPage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMe, fetchRefreshToken } from "./store/authSlice";
import type { AppDispatch } from "./store";
import CreateEventPage from "./pages/Organizer/CreateEventPage";
import ForgotPassword from "./pages/ForgotPassword";
import ProfileUser from "./pages/User/ProfileUser";
import ProfileLayout from "./pages/User";
import OrganizerAccountPage from "./pages/Organizer/OrganizerAccountPage";
import VerifyOrganizer from "./pages/Organizer/VerifyOrganizer";
import PaymentTicket from "./components/Payment";
import EventUser from "./pages/User/EventUser";
import OrderDetailUser from "./pages/User/EventUser/OrderDetailUser";
import TicketingUser from "./pages/User/TickingUser";
import PaymentHistoryUser from "./pages/User/HistoryPaymentUser";
import PostPreviewPage from "./pages/Organizer/PostPreviewPage";
import OrganizerOverviewAllPage from "./pages/Organizer/OgranizerOverviewAllPage";
import SubscriptionPage from "./pages/Organizer/SubscriptionPage";
import RequireRole from "./components/Guards/RequireRole";
import OrderSuccess from "./pages/OrderSuccess";
import VnpayReturn from "./pages/VNPayReturn";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const refreshToken = localStorage.getItem("REFRESH_TOKEN");

  useEffect(() => {
    if (refreshToken) {
      dispatch(fetchRefreshToken());
    }
    dispatch(fetchMe());
  }, []);

  return (
    <>
      <Routes>
        {/*Attendee*/}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/event-detail/:id" element={<EventDetail />} />
        <Route path="/all-event" element={<AllEvent />} />
        <Route path="/history-event" element={<HistoryEvent />} />
        <Route path="/payment-ticket/:id" element={<PaymentTicket />} />
        <Route path="/payment-ticket" element={<PaymentTicket />} />
        <Route path="/event-detail/:id/seat-map/show" element={<SeatMapViewerPage />} />
        <Route path="/verify-organizer" element={<VerifyOrganizer />} />
        <Route path="/payment/vnpay-return" element={<VnpayReturn />} />
        <Route path="/order/success" element={<OrderSuccess />} />
        <Route path="/profile" element={<ProfileLayout />}>
          <Route path="account" element={<ProfileUser />} />
          <Route path="events" element={<EventUser />} />
          <Route path="order-detail-user/:id" element={<OrderDetailUser />} />
          <Route path="ticking-user" element={<TicketingUser />} />
          <Route path="payment-history" element={<PaymentHistoryUser />} />
        </Route>

        {/* Organizer */}
        <Route element={<RequireRole allowedRoles={["Organizer", "Attendee"]} />}>
          <Route path="/organizer" element={<DashboardLayout />}>
            <Route path="overall" element={<OrganizerOverviewAllPage />} />
            <Route path="my-events" element={<MyEventsPage />} />
            <Route element={<RequireRole allowedRoles={["Organizer"]} />}>
              <Route path="reports" element={<ReportManagementPage />} />
              <Route path="legals" element={<LegalPage />} />
              <Route path="create-event" element={<CreateEventPage />} />
              <Route path="accounts" element={<OrganizerAccountPage />} />
            </Route>
          </Route>

          <Route path="/organizer/my-events/:eventId" element={<ManagementLayout />}>
            <Route path="overview" element={<SummaryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route element={<RequireRole allowedRoles={["Organizer"]} />}>
              <Route path="marketing" element={<MarketingPage />} />
              <Route path="marketing/:marketingId" element={<MarketingDetailPage />} />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="check-in" element={<CheckInPage />} />
              <Route path="members" element={<MemberManagementPage />} />
              <Route path="edit" element={<EditEventWizardPage />} />
              <Route path="seat-map" element={<EventTicketPage />} />
              <Route path="vouchers" element={<VoucherManagementPage />} />
            </Route>
          </Route>

          <Route element={<RequireRole allowedRoles={["Organizer"]} />}>
            <Route path="/organizer/subscription" element={<SubscriptionPage />} />
            <Route
              path="/organizer/my-events/:eventId/marketing/:marketingId/post-review"
              element={<PostPreviewPage />}
            />
            <Route
              path="/organizer/my-events/:eventId/seat-map/edit"
              element={<SeatMapEditorPage />}
            />
          </Route>
        </Route>

        {/* Admin group */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="hashtags" element={<AdminHashtagPage />} />
          <Route path="finance" element={<FinanceRevenuePage />} />
          <Route path="events" element={<EventModerationPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="logs" element={<SystemLogsPage />} />
          <Route path="withdrawals" element={<WithdrawalPage />} />
        </Route>

        {/* Staff group */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboardPage />} />
          <Route path="event-approval" element={<EventApprovalPage />} />
          <Route path="organizer-profile" element={<OrganizerProfilePage />} />
        </Route>
      </Routes >
    </>
  );
}

export default App;
