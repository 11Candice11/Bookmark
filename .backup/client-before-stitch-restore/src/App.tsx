import { Link, Navigate, Outlet, Route, Routes } from "react-router";
import BookPage from "./pages/BookPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import NotFoundPage from "./pages/NotFoundPage";

function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/book" className="text-lg font-semibold tracking-tight text-indigo-700">
            Bookmark
          </Link>
          <span className="text-sm text-slate-500">Branch appointments</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/book" replace />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/confirmation/:reference" element={<ConfirmationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
