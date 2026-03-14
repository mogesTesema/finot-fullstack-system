import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  SparklesIcon,
  UserGroupIcon,
  AcademicCapIcon,
  HeartIcon,
  BookOpenIcon,
  MusicalNoteIcon,
  MegaphoneIcon,
  FilmIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function AboutPage() {
  const { t } = useTranslation();

  const serviceGroups = [
    { name: t("group_choir"), icon: MusicalNoteIcon, desc: t("group_choir_desc") },
    { name: t("group_charity"), icon: HeartIcon, desc: t("group_charity_desc") },
    { name: t("group_media"), icon: FilmIcon, desc: t("group_media_desc") },
    { name: t("group_teaching"), icon: BookOpenIcon, desc: t("group_teaching_desc") },
    { name: t("group_evangelism"), icon: MegaphoneIcon, desc: t("group_evangelism_desc") },
    { name: t("group_prayer"), icon: HandRaisedIcon, desc: t("group_prayer_desc") },
  ];

  const stats = [
    { label: t("stats_years"), value: "30+", icon: SparklesIcon },
    { label: t("stats_students"), value: "500+", icon: AcademicCapIcon },
    { label: t("stats_groups"), value: "6+", icon: UserGroupIcon },
    { label: t("stats_graduates"), value: "5000+", icon: HeartIcon },
  ];

  const galleryImages = [
    "/images/gibi1.jpg",
    "/images/gibi2.jpg",
    "/images/gibi3.jpg",
    "/images/gibi4.jpg",
    "/images/gibi5.jpg",
  ];
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary to-primary-light py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(247,223,30,0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium backdrop-blur-sm border border-white/10 mb-4"
            >
              <SparklesIcon className="h-4 w-4 mr-2 text-accent" />
              {t("our_story_desc")}
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t("about")} <span className="text-accent">{t("astu_gibi_gubae")}</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-2xl mx-auto">
              {t("fellowship_desc")}
            </motion.p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80L60 70C120 60 240 50 360 45C480 40 600 40 720 43C840 46 960 52 1080 55C1200 58 1320 58 1380 58L1440 58V80H0Z" fill="hsl(210, 33%, 98%)" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="card text-center"
              >
                <stat.icon className="h-7 w-7 text-accent mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">{t("history")}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                {t("years_of_fellowship")}
              </h2>
              <div className="w-16 h-1 bg-accent mx-auto rounded-full mt-3" />
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Images */}
              <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
                {["/images/gibi1.jpg", "/images/gibi2.jpg", "/images/gibi3.jpg", "/images/gibi4.jpg"].map((src, i) => (
                  <motion.img
                    key={src}
                    whileHover={{ scale: 1.03 }}
                    src={src}
                    alt={`Gibi Gubae fellowship ${i + 1}`}
                    className={`rounded-2xl object-cover w-full h-48 sm:h-56 shadow-card ${i === 1 ? 'mt-6' : i === 2 ? '-mt-4' : ''}`}
                  />
                ))}
              </motion.div>

              {/* Text */}
              <motion.div variants={fadeInUp} className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  {t("history_p1")}
                </p>
                <p>
                  {t("history_p2")}
                </p>
                <h4 className="text-lg font-semibold text-foreground mt-6 mb-3">{t("currently_providing")}</h4>
                <ul className="space-y-2">
                  {[
                    t("service_teaching"),
                    t("service_liturgy"),
                    t("service_counseling"),
                    t("service_training"),
                    t("service_fellowship"),
                  ].map((item) => (
                    <li key={item} className="flex items-start">
                      <span className="h-2 w-2 rounded-full bg-accent mt-2 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Groups */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">{t("services")}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("service_groups")}</h2>
              <div className="w-16 h-1 bg-accent mx-auto rounded-full mt-3" />
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {serviceGroups.map((group) => (
                <motion.div
                  key={group.name}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="card hover:shadow-elevated transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                      <group.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t("our_community")}
              </h2>
            </motion.div>
            <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {galleryImages.map((src, i) => (
                <motion.img
                  key={src}
                  whileHover={{ scale: 1.05 }}
                  src={src}
                  alt={`Community photo ${i + 1}`}
                  className="rounded-2xl object-cover w-full h-48 shadow-card"
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Finot Platform */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="card max-w-3xl mx-auto text-center border-accent/20"
          >
            <div className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm font-medium mb-4">
              <SparklesIcon className="h-4 w-4 mr-1.5 text-accent" />
              {t("the_platform")}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">{t("about")} finot</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("platform_desc")}
            </p>
            <p className="font-semibold text-primary">
              {t("built_with_love")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t("ready_to_join")}</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {t("join_desc")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">{t("get_started")}</Link>
              <Link to="/" className="btn-outline text-lg px-8 py-4">{t("back_to_home")}</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}