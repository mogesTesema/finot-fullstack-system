import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AnonymousIntro = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="card text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl mb-6">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">እማሆይ የልቤ</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            A safe space to ask questions anonymously and get answers from the community. No judgment, just support.
          </p>

          <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-foreground mb-4">How it works</h2>
            <div className="space-y-3">
              {[
                { icon: ShieldCheckIcon, text: "Ask using a nickname – your identity stays hidden." },
                { icon: UserGroupIcon, text: "Anyone can answer, also anonymously." },
                { icon: ChatBubbleLeftRightIcon, text: "Questions grouped by: Academic, Spiritual, Family, Personal." },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="p-1.5 bg-card rounded-lg mt-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/anonymous/questions"
            className="btn-primary inline-flex items-center gap-2"
          >
            Join the Conversation
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AnonymousIntro;