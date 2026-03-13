import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/navigation/Navbar";
import Footer from "../../components/navigation/Footer";
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("page-at-top");
    return () => document.body.classList.remove("page-at-top");
  }, []);

  const cards = [
    {
      id: "location",
      title: t("our_location"),
      subtitle: t("adama_ethiopia"),
      Icon: MapPinIcon,
    },
    {
      id: "mail",
      title: t("email_us"),
      subtitle: "info@finot.org",
      Icon: EnvelopeIcon,
    },
    {
      id: "phone",
      title: t("call_us"),
      subtitle: "+251 911 223344",
      Icon: PhoneIcon,
    },
  ];

  return (
    <>
      <Navbar />

      <div className="relative bg-[#F8FAFC] text-slate-900">
        {/* Hero */}
        <section className="relative w-full h-[40vh] md:h-[50vh] flex flex-col items-center justify-center text-center bg-[#253D7F]">
          {/* Logo */}
          <img
            src="/images/logo.png"
            alt="Finot Logo"
            className="mx-auto h-24 w-24 object-contain mb-4"
          />

          {/* Page title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#EDCF07] drop-shadow-md">
            {t("contact")}
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-base md:text-lg text-[#F8FAFC] max-w-2xl mx-auto">
            {t("reach_out")}
          </p>
        </section>
        {/* Navbar transparent fix */}
        <style>{`
          nav[role="navigation"], nav.fixed, nav[style], .fixed.top-0, header nav {
            background: transparent !important;
            box-shadow: none !important;
            transition: background 0.3s ease, box-shadow 0.3s ease;
          }
          nav a, nav button, .fixed a, .fixed button, header a {
            color: white !important;
            transition: color 0.3s ease;
          }
          nav { z-index: 9999 !important; }
        `}</style>

        {/* Cards Section */}
        <section className="py-14 bg-[#F8FAFC]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {cards.map((c) => {
                const isActive = active === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActive(isActive ? null : c.id)}
                    aria-pressed={isActive}
                    className="relative overflow-hidden rounded-2xl shadow-lg transform transition hover:-translate-y-1 focus:outline-none group"
                  >
                    {/* Gradient overlay */}
                    <div
                      aria-hidden
                      className={`absolute inset-0 pointer-events-none bg-gradient-to-b from-[#253D7F] via-[#253D7F] to-[#253D7F] transform transition-transform duration-500 ${
                        isActive ? "translate-y-0" : "translate-y-full"
                      }`}
                    />

                    {/* Card content */}
                    <div className="relative bg-white rounded-2xl p-10 flex flex-col items-center text-center min-h-[250px] md:min-h-[280px] transition-colors duration-500 group-hover:bg-[#253D7F]">
                      {/* Icon */}
                      <div className="rounded-full p-6 mb-4 bg-[#EDCF07] group-hover:bg-white flex items-center justify-center transition-colors duration-500">
                        <c.Icon
                          className={`h-10 w-10 text-[#253D7F] group-hover:text-[#253D7F] transition-colors duration-500`}
                        />
                      </div>

                      {/* Text */}
                      <h3 className="font-semibold text-xl md:text-2xl text-[#253D7F] group-hover:text-white transition-colors duration-500">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-sm md:text-base text-slate-600 group-hover:text-white transition-colors duration-500">
                        {c.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Form + Map */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <span className="inline-block bg-[#EDCF07] text-[#253D7F] px-3 py-1 rounded-full text-xs mb-4 font-semibold">
                  {t("get_in_touch")}
                </span>
                <h3 className="text-2xl font-semibold mb-3 text-[#253D7F]">
                  {t("contact_us")}
                </h3>
                <p className="text-slate-600 mb-4">
                  {t("contact_desc")}
                </p>
                <div className="mb-4">
                  <a
                    href="https://maps.google.com/?q=Adama,Ethiopia"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#253D7F] hover:underline text-sm"
                  >
                    {t("open_in_maps")}
                  </a>
                </div>
                <div className="rounded-lg overflow-hidden border border-[#253D7F]">
                  <iframe
                    title="finot-location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15985.127073385102!2d39.268539!3d8.544455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8571f6e0f3d1%3A0xf9d9b2f5a1d7c1a!2sAdama%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1670000000000!5m2!1sen!2sus"
                    className="w-full h-80 md:h-96 border-0"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg border border-[#253D7F]">
                <h2 className="text-2xl font-semibold mb-6 text-[#253D7F]">
                  {t("contact_us_today")}
                </h2>
                <form
                  className="space-y-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t("first_name")}
                      className="w-full px-4 py-2 rounded border border-[#253D7F] placeholder:text-[#253D7F] focus:outline-none focus:ring-2 focus:ring-[#]"
                    />
                    <input
                      type="text"
                      placeholder={t("last_name")}
                      className="w-full px-4 py-2 rounded border border-[#253D7F] placeholder:text-[#253D7F] focus:outline-none focus:ring-2 focus:ring-[#EDCF07]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t("phone")}
                      className="w-full px-4 py-2 rounded border border-[#253D7F] placeholder:text-[#253D7F] focus:outline-none focus:ring-2 focus:ring-[#253D7F]"
                    />
                    <input
                      type="email"
                      placeholder={t("email")}
                      className="w-full px-4 py-2 rounded border border-[#253D7F] placeholder:text-[#253D7F] focus:outline-none focus:ring-2 focus:ring-[#EDCF07]"
                    />
                  </div>
                  <textarea
                    placeholder={t("your_message")}
                    rows={6}
                    className="w-full px-4 py-2 rounded border border-[#253D7F] placeholder:text-[#253D7F] focus:outline-none focus:ring-2 focus:ring-[#EDCF07]"
                  />
                  <button
                    type="submit"
                    className="bg-[#EDCF07] hover:bg-[#FFD700] text-[#253D7F] px-6 py-3 rounded font-semibold transition-colors duration-300"
                  >
                    {t("send_message")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
