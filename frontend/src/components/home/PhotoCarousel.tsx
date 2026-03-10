import { motion } from "framer-motion";

const photos = [
  { src: "/images/service-groups/group1.jpg", alt: "Fellowship group 1" },
  { src: "/images/service-groups/group2.jpg", alt: "Fellowship group 2" },
  { src: "/images/service-groups/group3.jpg", alt: "Fellowship group 3" },
  { src: "/images/service-groups/group4.jpg", alt: "Fellowship group 4" },
  { src: "/images/service-groups/group5.jpg", alt: "Fellowship group 5" },
  { src: "/images/service-groups/t1.jpg", alt: "Fellowship activity" },
  { src: "/images/service-groups/t2.jpg", alt: "Fellowship activity" },
  { src: "/images/service-groups/m1.jpg", alt: "Ministry work" },
  { src: "/images/service-groups/m2.jpg", alt: "Ministry work" },
  { src: "/images/service-groups/l1.jpg", alt: "Liturgy" },
];

// Duplicate for seamless loop
const duplicated = [...photos, ...photos];

const PhotoCarousel = () => {
  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Students</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-2">
            Finot <span className="text-primary">Community</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Moments from our fellowship gatherings, services, and community life.
          </p>
        </div>
      </div>

      {/* Row 1 - left to right */}
      <div className="relative mb-4">
        <motion.div
          className="flex gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          style={{ width: "fit-content" }}
        >
          {duplicated.map((photo, i) => (
            <div
              key={`row1-${i}`}
              className="flex-shrink-0 w-72 h-52 md:w-96 md:h-64 rounded-2xl overflow-hidden shadow-card"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Row 2 - right to left */}
      <div className="relative">
        <motion.div
          className="flex gap-4"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 45, ease: "linear", repeat: Infinity }}
          style={{ width: "fit-content" }}
        >
          {[...duplicated].reverse().map((photo, i) => (
            <div
              key={`row2-${i}`}
              className="flex-shrink-0 w-56 h-40 md:w-72 md:h-48 rounded-2xl overflow-hidden shadow-card"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PhotoCarousel;