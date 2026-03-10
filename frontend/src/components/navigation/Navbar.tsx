import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon, HeartIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/90 backdrop-blur-lg shadow-card border-b border-border"
          : "bg-transparent border-b border-white/10"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Left: Logo + primary nav links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.img
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                src="/images/logo.png"
                alt="finot"
                className="h-9 w-9"
              />
              <span className={`text-xl font-bold transition-colors ${
                scrolled ? "text-primary" : "text-white"
              } group-hover:text-accent`}>
                finot
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/about"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  scrolled ? "text-foreground hover:text-accent hover:bg-muted" : "text-white/90 hover:text-accent hover:bg-white/10"
                }`}
              >
                About
              </Link>
              <Link
                to="/donate"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  scrolled ? "text-foreground hover:text-accent hover:bg-muted" : "text-white/90 hover:text-accent hover:bg-white/10"
                }`}
              >
                <HeartIcon className="h-4 w-4" />
                Donate
              </Link>
              <Link
                to="/anonymous"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  scrolled ? "text-foreground hover:text-accent hover:bg-muted" : "text-white/90 hover:text-accent hover:bg-white/10"
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                Anonymous Q&A
              </Link>
              <a
                href="#footer"
                onClick={(e) => scrollToSection(e, "footer")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  scrolled ? "text-foreground hover:text-accent hover:bg-muted" : "text-white/90 hover:text-accent hover:bg-white/10"
                }`}
              >
                Contact
              </a>
            </div>
          </div>

          {/* Right: Auth buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                scrolled
                  ? "text-primary hover:bg-primary/5"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm px-5 py-2"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile hamburger */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden focus:outline-none ${scrolled ? "text-foreground" : "text-white"}`}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-1">
                <Link
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 px-4 text-foreground hover:text-accent hover:bg-muted rounded-xl transition font-medium"
                >
                  About
                </Link>
                <Link
                  to="/donate"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 px-4 text-foreground hover:text-accent hover:bg-muted rounded-xl transition font-medium"
                >
                  <HeartIcon className="h-4 w-4 inline mr-2" />
                  Donate
                </Link>
                <Link
                  to="/anonymous"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 px-4 text-foreground hover:text-accent hover:bg-muted rounded-xl transition font-medium"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-2" />
                  Anonymous Q&A
                </Link>
                <a
                  href="#footer"
                  onClick={(e) => scrollToSection(e, "footer")}
                  className="block py-2.5 px-4 text-foreground hover:text-accent hover:bg-muted rounded-xl transition font-medium"
                >
                  Contact
                </a>
                <div className="pt-3 border-t border-border flex gap-3 px-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="btn-outline text-sm flex-1 text-center py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary text-sm flex-1 text-center py-2.5"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;