import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { api } from "../../lib/api";
import { ServiceGroup } from "../../types";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const getGroupImage = (groupName: string) => {
  const images: Record<string, string> = {
    "ትምህርት ክፍል": "/images/service-groups/t1.jpg",
    "አባላት እና እንክብካቤ ክፍል": "/images/service-groups/a1.jpg",
    "ልማት ክፍል": "/images/service-groups/l4.jpg",
    "መዝሙር ክፍል": "/images/service-groups/m4.jpg",
    "ሙያ እና ተራድኦ": "/images/service-groups/my2.jpg",
    "ቁዋንቁዋና ልዩ ልዩ ክፍል": "/images/service-groups/group1.jpg",
    "ሂሳብ ክፍል": "/images/service-groups/group2.jpg",
    "ኦዲት ክፍል": "/images/service-groups/group3.jpg",
    "ባች እና መርሃግብር": "/images/service-groups/group4.jpg",
    "መረጃ እና ክትትል ክፍል": "/images/service-groups/group5.jpg",
  };
  return images[groupName] || "/images/service-groups/group1.jpg";
};

const ServiceGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ServiceGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return;
      try {
        const data = await api.getServiceGroupById(id);
        setGroup(data);
      } catch (err: any) {
        setError(err?.message || "Group not found");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B3067] flex items-center justify-center">
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-[#1B3067] flex items-center justify-center">
        <div className="text-red-400">{error || "Group not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link
            to="/service-groups"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Service Groups
          </Link>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image */}
            <div className="md:w-1/3">
              <div className="bg-[#1B3067] rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                <img
                  src={getGroupImage(group.name)}
                  alt={group.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e: any) => {
                    e.target.src = "/images/service-groups/group1.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142850] to-transparent"></div>
              </div>
            </div>

            {/* Details */}
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-yellow-400 mb-4 drop-shadow-md">
                {group.name}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                {group.description || "Learn more about this service group"}
              </p>
              {group.admin_name && (
                <p className="text-gray-400 mt-2 text-sm italic">
                  Admin: {group.admin_name}
                </p>
              )}

              {/* Additional mock content – videos, images, etc. */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-yellow-400 mb-2">
                  Gallery
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-[#1B3067] h-20 rounded flex items-center justify-center text-gray-400 text-sm"
                    >
                      🖼️ {i}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-yellow-400 mb-2">
                  Videos
                </h2>
                <div className="bg-[#1B3067] h-32 rounded flex items-center justify-center text-gray-400">
                  📹 Video content coming soon
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigate("/service-groups/select")}
                  className="bg-yellow-400 text-[#1B3067] px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105"
                >
                  Select This Group
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceGroupDetail;
