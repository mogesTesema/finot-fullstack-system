import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ServiceGroup } from "../../types";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
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
          if (selections && selections.length > 0) setHasSubmitted(true);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">የአገልግሎት ክፍሎች</h2>
          <p className="text-muted-foreground text-sm mt-1">Choose a service group to learn more</p>
        </div>
        {!hasSubmitted ? (
          <button
            onClick={() => navigate("/service-groups/select")}
            className="btn-primary text-sm"
          >
            Select Your Preferences
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl text-sm font-medium">
            <CheckCircleIcon className="h-4 w-4" />
            Preferences submitted
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No service groups available.</p>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {groups.map((group) => (
            <motion.div
              key={group.id}
              variants={fadeIn}
              whileHover={{ y: -4 }}
              className="card cursor-pointer hover:shadow-elevated transition-all overflow-hidden p-0"
              onClick={() => navigate(`/service-groups/${group.id}`)}
            >
              <div className="w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={getGroupImage(group.name)}
                  alt={group.name}
                  className="w-full h-full object-cover"
                  onError={(e: any) => { e.target.src = "/images/service-groups/group1.jpg"; }}
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2">{group.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {group.description || "Learn more about this service group"}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ServiceGroupList;