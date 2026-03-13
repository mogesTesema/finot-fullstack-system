import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { FaTelegram, FaInstagram, FaTiktok } from "react-icons/fa";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/images/logo.png" alt="finot" className="h-8 w-8" />
              <h3 className="text-2xl font-bold text-accent">finot</h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {t("contact_desc")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">{t("quick_links")}</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "#about", label: t("about") },
                { href: "#join", label: t("get_started") },
                { href: "/donate", label: t("donate") },
                { href: "/anonymous", label: t("anonymous_qa") },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-white/70 hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">{t("contact")}</h3>
            <div className="space-y-3 text-sm">
              {[
                { icon: EnvelopeIcon, text: "info@finot.org" },
                { icon: PhoneIcon, text: "+251 911 223344" },
                { icon: MapPinIcon, text: "Adama, Ethiopia" },
              ].map(({ icon: Icon, text }) => (
                <p key={text} className="flex items-center space-x-3 text-white/70">
                  <Icon className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>{text}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">{t("follow_us")}</h3>
            <div className="flex space-x-3">
              {[
                { href: "https://t.me/Astugibigubae", icon: FaTelegram, label: "Telegram" },
                { href: "https://www.instagram.com/astu_gbigubae", icon: FaInstagram, label: "Instagram" },
                { href: "https://www.tiktok.com/@astu_gbigubae", icon: FaTiktok, label: "TikTok" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2.5 rounded-xl text-white/70 hover:text-accent hover:bg-white/20 transition-all"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-white/50 text-sm">
          <p>&copy; {currentYear} finot. {t("all_rights_reserved")}</p>
          <p className="mt-1">{t("built_with_heart")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;