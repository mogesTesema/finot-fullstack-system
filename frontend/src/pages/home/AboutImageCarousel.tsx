import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const aboutImages = [
  { src: "/images/gibi1.jpg", alt: "Community 1" },
  { src: "/images/gibi2.jpg", alt: "Community 2" },
  { src: "/images/gibi3.jpg", alt: "Community 3" },
  { src: "/images/gibi4.jpg", alt: "Community 4" },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    position: "absolute" as const,
  }),
  center: {
    x: 0,
    opacity: 1,
    position: "relative" as const,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    position: "absolute" as const,
  }),
};

const AboutImageCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % aboutImages.length);
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="relative w-full h-full max-h-[520px] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={aboutImages[index].src}
            src={aboutImages[index].src}
            alt={aboutImages[index].alt}
            className="w-full h-full object-cover rounded-2xl"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 80, damping: 24 }, opacity: { duration: 0.6 } }}
            loading="lazy"
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AboutImageCarousel;
