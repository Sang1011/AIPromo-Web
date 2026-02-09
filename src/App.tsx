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

function App() {
  return (
    <Routes>
      {/* Dashboard group */}
      <Route path="/organizer" element={<DashboardLayout />}>
        <Route path="my-events" element={<MyEventsPage />} />
        <Route path="reports" element={<ReportManagementPage />} />
        <Route path="legals" element={<LegalPage />} />
      </Route>


      {/* Management group */}
      <Route path="/organizer/my-events/:title" element={<ManagementLayout />}>
        <Route path="overview" element={<SummaryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="check-in" element={<CheckInPage />} />
        <Route path="members" element={<MemberManagementPage />} />
        <Route path="edit" element={<EditEventWizardPage />} />
        <Route path="seat-map" element={<SeatMapEditorPage />} />
        <Route path="vouchers" element={<VoucherManagementPage />} />
      </Route>
    </Routes>

  );
}

export default App;
