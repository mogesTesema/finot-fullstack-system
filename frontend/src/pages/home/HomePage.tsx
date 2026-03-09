// src/pages/home/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import BackToTop from "../../components/ui/BackToTop";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const HomePage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section - keeps deep blue for dramatic effect */}
      <section
        id="join"
        className="relative bg-gradient-to-br from-primary to-primary-light min-h-[90vh] flex items-center"
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(247,223,30,0.08),transparent_60%)]" />
        
        <div className="container mx-auto px-4 text-center relative z-10 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
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
                  <path d="M2 8C50 2 150 2 198 8" stroke="hsl(52, 94%, 54%)" strokeWidth="3" strokeLinecap="round"/>
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

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z"
              fill="hsl(210, 33%, 98%)"
            />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 sm:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
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
            className="mb-20"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Images Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { src: "/images/gibi1.jpg", alt: "Gibigubae 1", mt: "" },
                  { src: "/images/gibi2.jpg", alt: "Gibigubae 2", mt: "mt-8" },
                  { src: "/images/gibi3.jpg", alt: "Gibigubae 3", mt: "-mt-4" },
                  { src: "/images/gibi4.jpg", alt: "Gibigubae 4", mt: "" },
                ].map((img) => (
                  <motion.img
                    key={img.src}
                    whileHover={{ scale: 1.03 }}
                    src={img.src}
                    alt={img.alt}
                    className={`rounded-2xl object-cover w-full h-48 sm:h-64 shadow-card ${img.mt}`}
                  />
                ))}
              </div>

              {/* Text */}
              <div className="space-y-5 text-muted-foreground text-sm md:text-base leading-relaxed">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  30 Years of <span className="text-accent">Fellowship</span>
                </h3>
                <p>
                  The ASTU Gibi Gubae is a spiritual and academic fellowship established at Adama Science and Technology University during the time when the institution was still known as Nazareth Technical College. It was founded in 1995 (1988 EC) by committed Orthodox Christian students and teachers.
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
              </div>
            </div>
          </motion.div>

          {/* About Finot Card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
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

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Get Involved
            </h3>
            <p className="text-muted-foreground">
              Support our mission or ask questions anonymously.
            </p>
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
                <div className="p-2.5 bg-green-50 rounded-xl">
                  <HeartIcon className="h-6 w-6 text-green-600" />
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
                className="group flex items-center gap-3 card hover:shadow-elevated transition-all hover:-translate-y-1 px-8 py-5 border-purple-200"
              >
                <div className="p-2.5 bg-purple-50 rounded-xl">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
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

      <BackToTop />
    </div>
  );
};

export default HomePage;
