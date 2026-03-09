// src/components/layout/Layout.jsx
import { Outlet, useLocation, Link } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-[#1B3067]">
      {isHome ? (
        <Navbar />
      ) : (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#1B3067] shadow-md py-4 px-4">
          <div className="container mx-auto">
            <Link to="/" className="inline-flex items-center space-x-2 group">
              <img
                src="/images/logo.png"
                alt="finot"
                className="h-8 w-8 transition-transform duration-500 group-hover:rotate-180"
              />
              <span className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                finot
              </span>
            </Link>
          </div>
        </header>
      )}

      <main className={`flex-grow ${isHome ? "" : "pt-20"}`}>
        <Outlet />
      </main>

      {isHome && <Footer />}
    </div>
  );
}
