import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {isHome && <Navbar />}

      <main className="flex-grow">
        <Outlet />
      </main>

      {isHome && <Footer />}
    </div>
  );
}