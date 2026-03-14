import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹" },
  { code: "om", name: "Oromoo", flag: "🇪🇹" },
];

interface LanguageSelectorProps {
  variant?: "hero" | "nav";
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = "nav" }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
          variant === "hero"
            ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
            : "bg-muted/50 text-foreground hover:bg-muted border border-transparent"
        }`}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">{currentLanguage.name}</span>
        <span className="text-xs font-bold sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 rounded-2xl bg-card border border-border shadow-elevated z-50 overflow-hidden"
          >
            <div className="p-1.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    i18n.language === lang.code
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {i18n.language === lang.code && (
                    <motion.div
                      layoutId="active-marker"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
