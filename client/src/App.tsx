import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./components/AppLayout";
import BookPage from "./pages/BookPage";
import BranchLocatorPage from "./pages/BranchLocatorPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/book" replace />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/confirmation/:reference" element={<ConfirmationPage />} />
        <Route path="/bookings" element={<MyBookingsPage />} />
        <Route path="/branches" element={<BranchLocatorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
