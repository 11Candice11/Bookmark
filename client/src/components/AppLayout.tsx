import { Outlet } from "react-router";
import { TopBar } from "./TopBar";

/** Shell shared by every page: top bar plus a column that fills the viewport. */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <Outlet />
    </div>
  );
}
