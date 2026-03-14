import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const { t } = useTranslation();

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
    <div className="relative bg-[#F8FAFC] text-slate-900">
      {/* Hero */}
      <section className="relative w-full h-[40vh] md:h-[50vh] flex flex-col items-center justify-center text-center bg-[#253D7F]">
        <div className="absolute top-6 left-6 md:left-12">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeftIcon className="w-4 h-4" />
            {t("back_to_home", "Back to Home")}
          </Link>
        </div>

        {/* Logo */}
        <img
          src="/images/logo.png"
          alt="Finot Logo"
          className="mx-auto h-20 w-20 object-contain mb-4"
        />

        {/* Page title */}
        <h1 className="text-3xl md:text-4xl font-semibold text-[#EDCF07] drop-shadow-sm">
          {t("contact")}
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-sm md:text-base text-white/90 max-w-2xl mx-auto font-light">
          {t("reach_out")}
        </p>
      </section>

      {/* Cards Section */}
      <section className="py-14 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {cards.map((c) => {
              return (
                <div
                  key={c.id}
                  className="relative bg-white rounded-2xl p-6 flex flex-col items-center text-center min-h-[180px] shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#EDCF07] hover:bg-[#EDCF07]/10 group"
                >
                  {/* Icon */}
                  <div className="rounded-xl p-3 mb-3 bg-slate-50 text-[#253D7F] transition-colors duration-300 group-hover:bg-[#EDCF07] group-hover:text-[#253D7F]">
                    <c.Icon className="h-6 w-6" />
                  </div>

                  {/* Text */}
                  <h3 className="font-medium text-base text-slate-900">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 font-light">
                    {c.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div>
              <span className="inline-block bg-[#EDCF07] text-[#253D7F] px-3 py-1 rounded-full text-xs mb-4 font-semibold">
                {t("get_in_touch")}
              </span>
              <h3 className="text-xl font-medium mb-2 text-[#253D7F]">
                {t("contact_us")}
              </h3>
              <p className="text-slate-500 text-sm font-light mb-4">
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
            <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border border-slate-200">
              <h2 className="text-xl font-medium mb-6 text-[#253D7F]">
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
  );
}
