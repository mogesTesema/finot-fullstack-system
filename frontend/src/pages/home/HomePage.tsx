import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import BackToTop from "../../components/ui/BackToTop";
import PhotoCarousel from "../../components/home/PhotoCarousel";
import AboutImageCarousel from "./AboutImageCarousel";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const HomePage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        id="join"
        className="relative bg-gradient-to-br from-primary to-primary-light min-h-[90vh] flex items-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(247,223,30,0.08),transparent_60%)]" />

        <div className="container mx-auto px-4 text-center relative z-10 py-20">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium backdrop-blur-sm border border-white/10">
                <SparklesIcon className="h-4 w-4 mr-2 text-accent" />
                Gibi Gubae Community Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Welcome to{" "}
              <span className="text-accent relative">
                finot
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="hsl(52, 94%, 54%)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto text-white/80 mb-10 leading-relaxed"
            >
              A fellowship of believers dedicated to spiritual growth, community service, and mutual support.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center group"
              >
                Get Started
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all text-lg inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link
                to="/anonymous"
                className="inline-flex items-center text-white/70 hover:text-accent text-base font-medium transition group"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Visit Anonymous Q&A Forum
                <ArrowRightIcon className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z"
              fill="hsl(210, 33%, 98%)"
            />
          </svg>
        </div>
      </section>

      {/* About Section - Card with Read More */}
      <section id="about" className="py-20 sm:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Story</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              About <span className="text-primary">ASTU Gibi Gubae</span>
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-10 items-stretch max-w-6xl mx-auto"
          >
            {/* Animated Single Image - Large and Stretched */}
            <div className="flex-1 flex items-stretch justify-center mb-8 md:mb-0">
              <div className="w-full h-full flex items-stretch max-h-[520px] aspect-[4/3]">
                <AboutImageCarousel />
              </div>
            </div>
            {/* Cards for About Info */}
            <div className="flex-1 flex flex-col gap-5 justify-center">
              <div className="bg-card rounded-xl shadow p-6 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-foreground mb-1">30 Years of <span className="text-accent">Fellowship</span></h3>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                  <li>Founded in 1995 at Adama Science and Technology University</li>
                  <li>Established by Orthodox Christian students and teachers</li>
                  <li>Spiritual and academic fellowship for thousands of students</li>
                </ul>
              </div>
              <div className="bg-card rounded-xl shadow p-6 flex flex-col gap-2">
                <h4 className="font-semibold text-foreground mb-1">Our Impact</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                  <li>Many graduates serve the Holy Church and the nation</li>
                  <li>Members contribute in professional and spiritual capacities</li>
                  <li>Decades of nurturing faith and leadership</li>
                </ul>
              </div>
              <Link
                to="/about"
                className="btn-primary text-base px-7 py-3 mt-2 self-start inline-flex items-center gap-2 group"
              >
                Read More
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Donate & Q&A */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Get Involved</h3>
            <p className="text-muted-foreground">Support our mission or ask questions anonymously.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col sm:flex-row justify-center items-center gap-6"
          >
            <motion.div variants={fadeInUp}>
              <Link
                to="/donate"
                className="group flex items-center gap-3 card hover:shadow-elevated transition-all hover:-translate-y-1 px-8 py-5 border-success/20"
              >
                <div className="p-2.5 bg-success/10 rounded-xl">
                  <HeartIcon className="h-6 w-6 text-success" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-foreground block">Donate</span>
                  <span className="text-sm text-muted-foreground">Support the fellowship</span>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform ml-4" />
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link
                to="/anonymous"
                className="group flex items-center gap-3 card hover:shadow-elevated transition-all hover:-translate-y-1 px-8 py-5 border-primary/20"
              >
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-foreground block">Anonymous Q&A</span>
                  <span className="text-sm text-muted-foreground">Ask safely & privately</span>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform ml-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Photo Carousel */}
      <PhotoCarousel />

      <BackToTop />
    </div>
  );
};

export default HomePage;