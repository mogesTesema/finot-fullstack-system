// src/pages/home/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import BackToTop from "../../components/ui/BackToTop";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 120 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const HomePage = () => {
  return (
    <div className="bg-[#1B3067] text-white overflow-hidden">
      {/* Hero Section */}
      <section
        id="join"
        className="relative bg-gradient-to-br from-[#1B3067] to-[#142850] pt-24 pb-16 md:pt-32 md:pb-32"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4"
          >
            Welcome to <span className="text-yellow-400">finot</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-2xl max-w-3xl mx-auto text-gray-200 mb-8 px-4"
          >
            Gibigubae is a fellowship of believers dedicated to spiritual
            growth, community service, and mutual support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
              Do you want to join us?
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="bg-yellow-400 text-[#1B3067] px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition hover:scale-105"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="border-2 border-yellow-400 text-yellow-400 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 hover:text-[#1B3067] transition hover:scale-105"
              >
                Login
              </Link>
            </div>
            
            <div className="mt-8">
               <p className="text-gray-300 mb-2 font-medium">Have spiritual questions?</p>
               <Link to="/anonymous" className="inline-flex items-center text-yellow-400 hover:text-yellow-300 text-lg font-semibold transition hover:underline">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" />
                  Visit Anonymous Q&A Forum
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 bg-[#142850]">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              About <span className="text-yellow-400">Us</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full" />
          </motion.div>

          {/* ASTU Gibi Gubae Details */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Images Grid */}
              <div className="grid grid-cols-2 gap-4 h-full">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="/images/gibi1.jpg"
                  alt="Gibigubae 1"
                  className="rounded-xl object-cover w-full h-48 sm:h-64 shadow-lg border border-yellow-400/20"
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="/images/gibi2.jpg"
                  alt="Gibigubae 2"
                  className="rounded-xl object-cover w-full h-48 sm:h-64 shadow-lg border border-yellow-400/20 mt-8"
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="/images/gibi3.jpg"
                  alt="Gibigubae 3"
                  className="rounded-xl object-cover w-full h-48 sm:h-64 shadow-lg border border-yellow-400/20 -mt-8"
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="/images/gibi4.jpg"
                  alt="Gibigubae 4"
                  className="rounded-xl object-cover w-full h-48 sm:h-64 shadow-lg border border-yellow-400/20"
                />
              </div>

              {/* Text Description */}
              <div className="space-y-6 text-gray-200 text-sm md:text-base leading-relaxed text-justify">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-6 border-b border-gray-600 pb-4">
                  ASTU Gibi Gubae
                </h3>
                <p>
                  The ASTU Gibi Gubae is a spiritual and academic fellowship established at Adama Science and Technology University during the time when the institution was still known as Nazareth Technical College. It was founded in 1995 (1988 Ethiopian Calendar) by committed Orthodox Christian students and teachers who desired to create a spiritual environment within the university community.
                </p>
                <p>
                  The founders recognized that university life can present many intellectual, moral, and spiritual challenges for young Orthodox students. As a result, they established Gibi Gubae to serve as a center for spiritual growth, fellowship, and guidance. Their vision was to ensure that students would not only excel in their academic studies but also remain strong in the faith and teachings of the Holy Orthodox Church.
                </p>
                <p>
                  For the past thirty (30) years, Gibi Gubae has played a significant role in nurturing thousands of students. Many of its members have graduated and gone on to serve the Holy Church and the nation in various professional and spiritual capacities. The fellowship has become a pillar of spiritual life on campus.
                </p>

                <h4 className="text-xl font-semibold text-yellow-300 mt-6 mb-3">Currently, ASTU Gibi Gubae provides:</h4>
                <ul className="list-disc pl-5 space-y-2 marker:text-yellow-400">
                  <li>Regular spiritual teachings and Bible study programs</li>
                  <li>Liturgical services and prayer gatherings</li>
                  <li>Spiritual counseling and mentorship</li>
                  <li>Training programs rooted in Orthodox doctrine</li>
                  <li>Moral and character development support</li>
                  <li>A strong fellowship network that promotes unity and love</li>
                </ul>

                <p className="mt-4">
                  Through these activities, the fellowship ensures that Orthodox youth are sharpened spiritually while pursuing excellence in science, technology, and other academic disciplines. It creates a balanced environment where faith and education grow together.
                </p>
                <p className="italic border-l-4 border-yellow-400 pl-4 mt-6 text-gray-300">
                  ASTU Gibi Gubae continues to stand as a testimony to dedication, faith, and service—strengthening students to become responsible citizens, devoted Orthodox Christians, and future leaders who contribute positively to both the Church and the country.
                </p>
              </div>
            </div>
          </motion.div>

          {/* About Finot */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-[#1B3067] rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-700 max-w-4xl mx-auto text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-6 drop-shadow-md">
              About finot
            </h3>
            <div className="space-y-4 text-gray-200 text-sm sm:text-base leading-relaxed md:px-8">
              <p>
                Finot is a digital platform created specifically for the Gibi Gubae community at Adama Science and Technology University. It is designed to support and organize the fellowship through simple and modern technology.
              </p>
              <p>
                The platform helps streamline membership management, making it easier to register and coordinate members. It also provides an anonymous support system, allowing individuals to seek help safely and privately. In addition, Finot enables easy and transparent donations and helps members find and join service groups that match their talents and interests.
              </p>
              <p className="font-semibold text-yellow-300 mt-6 pt-4 border-t border-gray-600/50 inline-block">
                Built with love by and for the community, Finot strengthens unity, service, and spiritual growth within Gibi Gubae.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-14 sm:py-20 bg-[#142850]"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
              Get Involved
            </h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Support our mission or ask anonymously.
            </p>
          </motion.div>

          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8"
          >
            <Link
              to="/donate"
              className="group relative flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
            >
              <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition"></span>
              <HeartIcon className="h-6 w-6 text-yellow-300 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold text-lg">Donate</span>
            </Link>
            <Link
              to="/anonymous"
              className="group relative flex items-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
            >
              <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition"></span>
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-yellow-300 group-hover:-rotate-12 transition-transform" />
              <span className="font-semibold text-lg">Anonymous Q&A</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <BackToTop />
    </div>
  );
};

export default HomePage;
