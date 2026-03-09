import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ServiceGroup } from "../../types";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const getGroupImage = (groupName: string) => {
  const images: Record<string, string> = {
    "ትምህርት ክፍል": "/images/service-groups/t7.jpg",
    "አባላት እና እንክብካቤ ክፍል": "/images/service-groups/a1.jpg",
    "ልማት ክፍል": "/images/service-groups/l4.jpg",
    "መዝሙር ክፍል": "/images/service-groups/m4.jpg",
    "ሙያ እና ተራድኦ": "/images/service-groups/my3.jpg",
    "ቁዋንቁዋና ልዩ ልዩ ክፍል": "/images/service-groups/k1.jpg",
    "ሂሳብ ክፍል": "/images/service-groups/group2.jpg",
    "ኦዲት ክፍል": "/images/service-groups/group2.jpg",
    "ባች እና መርሃግብር": "/images/service-groups/b1.jpg",
    "መረጃ እና ክትትል ክፍል": "/images/service-groups/group2.jpg",
  };
  return images[groupName] || "/images/service-groups/group1.jpg";
};

const ServiceGroupList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsData = await api.getServiceGroups();
        setGroups(groupsData || []);

        if (user) {
          const selections = await api.getUserSelection();
          if (selections && selections.length > 0) {
            setHasSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B3067] flex items-center justify-center">
        <div className="text-yellow-400 animate-pulse">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button and status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition order-2 sm:order-1"
          >
            
          </Link>
          <div className="order-1 sm:order-2">
            {!hasSubmitted ? (
              <button
                onClick={() => navigate("/service-groups/select")}
                className="w-full sm:w-auto bg-yellow-400 text-[#1B3067] px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105"
              >
                Select Your Preferences
              </button>
            ) : (
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-center">
                ✓ You have already submitted your preferences
              </div>
            )}
          </div>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
            የአገልግሎት ክፍሎች
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Choose a service group to learn more
          </p>

          {groups.length === 0 ? (
            <p className="text-gray-400 text-center">
              No service groups available.
            </p>
          ) : (
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#142850] rounded-xl shadow-xl overflow-hidden cursor-pointer border border-transparent hover:border-yellow-400/30 transition-colors"
                  onClick={() => navigate(`/service-groups/${group.id}`)}
                >
                  {/* Image Section */}
                  <div className="w-full h-56 bg-[#1B3067] flex items-center justify-center p-4">
                    <img
                      src={getGroupImage(group.name)}
                      alt={group.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e: any) => {
                        e.target.src = "/images/service-groups/group1.jpg";
                      }}
                    />
                  </div>

                  {/* Text Section */}
                  <div className="p-5 text-center">
                    <h2 className="text-xl font-bold text-yellow-400">
                      {group.name}
                    </h2>
                    <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                      {group.description || "Learn more about this service group"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceGroupList;
