import { motion } from "framer-motion";
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

const serviceGroups = [
  { name: "Choir (Mezmur)", icon: MusicalNoteIcon, desc: "Leading worship through spiritual hymns and songs." },
  { name: "Charity & Outreach", icon: HeartIcon, desc: "Serving the community through charitable works." },
  { name: "Media & Communication", icon: FilmIcon, desc: "Documenting events and managing digital outreach." },
  { name: "Teaching (Timhirt)", icon: BookOpenIcon, desc: "Facilitating Bible study and spiritual education." },
  { name: "Evangelism (Sibket)", icon: MegaphoneIcon, desc: "Spreading the faith through outreach programs." },
  { name: "Prayer & Liturgy", icon: HandRaisedIcon, desc: "Organizing prayer sessions and liturgical services." },
];

const stats = [
  { label: "Years of Fellowship", value: "30+", icon: SparklesIcon },
  { label: "Active Students", value: "500+", icon: AcademicCapIcon },
  { label: "Service Groups", value: "6+", icon: UserGroupIcon },
  { label: "Graduates Impacted", value: "5000+", icon: HeartIcon },
];

const galleryImages = [
  "/images/gibi1.jpg",
  "/images/gibi2.jpg",
  "/images/gibi3.jpg",
  "/images/gibi4.jpg",
  "/images/gibi5.jpg",
];

export default function AboutPage() {
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
              Our Story
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              About <span className="text-accent">ASTU Gibi Gubae</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-white/80 max-w-2xl mx-auto">
              A fellowship of believers dedicated to spiritual growth, community service, and mutual support since 1995.
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
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">History</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                30 Years of <span className="text-accent">Fellowship</span>
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
                  The ASTU Gibi Gubae is a spiritual and academic fellowship established at Adama Science and Technology University during the time when the institution was still known as Nazareth Technical College. It was founded in <strong className="text-foreground">1995 (1988 EC)</strong> by committed Orthodox Christian students and teachers.
                </p>
                <p>
                  For the past thirty years, Gibi Gubae has played a significant role in nurturing thousands of students. Many of its members have graduated and gone on to serve the Holy Church and the nation in various professional and spiritual capacities.
                </p>
                <h4 className="text-lg font-semibold text-foreground mt-6 mb-3">Currently providing:</h4>
                <ul className="space-y-2">
                  {[
                    "Regular spiritual teachings and Bible study",
                    "Liturgical services and prayer gatherings",
                    "Spiritual counseling and mentorship",
                    "Training programs rooted in Orthodox doctrine",
                    "A strong fellowship network promoting unity",
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
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Ageglot</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Service Groups</h2>
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
                Our <span className="text-accent">Community</span>
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
              The Platform
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">About finot</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Finot is a digital platform created specifically for the Gibi Gubae community. It streamlines membership management, enables anonymous support, facilitates transparent donations, and helps members find service groups.
            </p>
            <p className="font-semibold text-primary">
              Built with love by and for the community. ✨
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to join the fellowship?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your account and become part of the Gibi Gubae community today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">Get Started</Link>
              <Link to="/" className="btn-outline text-lg px-8 py-4">Back to Home</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}