import Navbar from "../../components/navigation/Navbar";
import Footer from "../../components/navigation/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5 },
  }),
};

const featureCards = [
  {
    title: "Ask Anonymously",
    description:
      "Choose a nickname and ask questions safely without revealing your identity.",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: "Verified Responses",
    description:
      "Every answer can be verified by admins to ensure quality and trust.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Community Support",
    description:
      "Students can respond to questions, building a peer-to-peer support system.",
    icon: UserGroupIcon,
  },
];

const steps = [
  {
    title: "Ask Anonymously",
    description:
      "No registration needed. Students can ask questions safely using a nickname.",
    icon: ChatBubbleLeftRightIcon,
    color: "#EDCF07",
  },
  {
    title: "Choose Category",
    description:
      "Select Academic, Spiritual, or General to post your question for better clarity.",
    icon: ArrowRightOnRectangleIcon,
    color: "#253D7F",
  },
  {
    title: "Receive Responses",
    description:
      "Anyone can answer anonymously. Verified responses ensure quality guidance.",
    icon: ShieldCheckIcon,
    color: "#EDCF07",
  },
  {
    title: "Community Support",
    description:
      "Peer-to-peer answers create a supportive anonymous community environment.",
    icon: UserGroupIcon,
    color: "#253D7F",
  },
];

const stepFadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5 },
  }),
};

const AnonymousIntro = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Hero / Intro Section */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#253D7F] mb-4">
              እማሆይ የልቤ
            </h1>
            <p className="text-[#253D7F] text-lg md:text-xl mb-12">
              A secure web platform to ask questions and receive guidance
              anonymously.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            {featureCards.map((card, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group"
              >
                <div className="w-16 h-16 rounded-full bg-[#EDCF07] flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-[#253D7F]">
                  <card.icon className="h-8 w-8 text-[#253D7F] group-hover:text-[#EDCF07]" />
                </div>
                <h3 className="text-xl font-semibold text-[#253D7F] group-hover:text-[#EDCF07] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 group-hover:text-[#253D7F]">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
            className="mb-16"
          >
            <Link
              to="/anonymous/questions"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#253D7F] text-[#EDCF07] font-semibold text-lg hover:bg-[#1f3160] transition-colors duration-300"
            >
              Join the Conversation
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </motion.div>

          {/* How It Works Section */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-[#253D7F] text-center mb-12">
              How It Works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={stepFadeIn}
                  className="bg-white border-2 rounded-2xl p-6 flex flex-col items-center text-center shadow-md transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#EDCF07]"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: step.color }}
                  >
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl text-[#253D7F] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AnonymousIntro;
