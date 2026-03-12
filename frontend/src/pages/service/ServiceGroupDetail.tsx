// import { useEffect, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { FiArrowLeft } from "react-icons/fi";
// import { api } from "../../lib/api";
// import { ServiceGroup } from "../../types";
// import { Card } from "../../components/ui/Card";

// const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// const getGroupImage = (groupName: string) => {
//   const images: Record<string, string> = {
//     "ትምህርት ክፍል": "/images/service-groups/t1.jpg",
//     "አባላት እና እንክብካቤ ክፍል": "/images/service-groups/a1.jpg",
//     "ልማት ክፍል": "/images/service-groups/l4.jpg",
//     "መዝሙር ክፍል": "/images/service-groups/m4.jpg",
//     "ሙያ እና ተራድኦ": "/images/service-groups/my2.jpg",
//     "ቁዋንቁዋና ልዩ ልዩ ክፍል": "/images/service-groups/group1.jpg",
//     "ሂሳብ ክፍል": "/images/service-groups/group2.jpg",
//     "ኦዲት ክፍል": "/images/service-groups/group3.jpg",
//     "ባች እና መርሃግብር": "/images/service-groups/group4.jpg",
//     "መረጃ እና ክትትል ክፍል": "/images/service-groups/group5.jpg",
//   };
//   return images[groupName] || "/images/service-groups/group1.jpg";
// };

// const ServiceGroupDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [group, setGroup] = useState<ServiceGroup | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!id) return;
//     api.getServiceGroupById(id).then(setGroup).catch((err: any) => setError(err?.message || "Group not found")).finally(() => setLoading(false));
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
//       </div>
//     );
//   }

//   if (error || !group) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-destructive mb-4">{error || "Group not found"}</p>
//         <Link to="/dashboard/service" className="btn-primary text-sm">Back to Service Groups</Link>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <Link to="/dashboard/service" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition">
//         <FiArrowLeft className="h-4 w-4" /> Back to Service Groups
//       </Link>

//       <motion.div initial="hidden" animate="visible" variants={fadeIn}>
//         <Card className="overflow-hidden p-0">
//           <div className="flex flex-col md:flex-row">
//             {/* Image */}
//             <div className="md:w-1/3 relative">
//               <div className="h-64 md:h-full overflow-hidden">
//                 <img
//                   src={getGroupImage(group.name)}
//                   alt={group.name}
//                   className="w-full h-full object-cover"
//                   onError={(e: any) => { e.target.src = "/images/service-groups/group1.jpg"; }}
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
//               </div>
//             </div>

//             {/* Details */}
//             <div className="md:w-2/3 p-6 md:p-8">
//               <h1 className="text-2xl font-bold text-foreground mb-4">{group.name}</h1>
//               <p className="text-muted-foreground leading-relaxed">{group.description || "Learn more about this service group"}</p>
//               {group.admin_name && (
//                 <p className="text-sm text-muted-foreground mt-2 italic">Admin: {group.admin_name}</p>
//               )}

//               {/* Gallery placeholder */}
//               <div className="mt-6">
//                 <h2 className="text-lg font-semibold text-foreground mb-3">Gallery</h2>
//                 <div className="grid grid-cols-3 gap-2">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="bg-muted h-20 rounded-xl flex items-center justify-center text-muted-foreground text-sm">🖼️ {i}</div>
//                   ))}
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <h2 className="text-lg font-semibold text-foreground mb-3">Videos</h2>
//                 <div className="bg-muted h-32 rounded-xl flex items-center justify-center text-muted-foreground">📹 Video content coming soon</div>
//               </div>

//               <div className="mt-8">
//                 <button onClick={() => navigate("/dashboard/service/select")} className="btn-primary">Select This Group</button>
//               </div>
//             </div>
//           </div>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// export default ServiceGroupDetail;

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { api } from "../../lib/api";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ServiceGroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gallery = [1, 2, 3, 4, 5];
  const image = "/images/service-groups/default.jpg";

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    api
      .getServiceGroupById(id)
      .then((data: any) => setGroup(data))
      .catch((err: any) => setError(err?.message || "Group not found"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % gallery.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#263E81]" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>

        <Link to="/dashboard/service" className="text-[#263E81] font-medium">
          Back to Service Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* BACK BUTTON */}
      <div className="max-w-6xl mx-auto pt-6">
        <Link
          to="/dashboard/service"
          className="flex items-center text-sm text-[#263E81] font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to Service Groups
        </Link>
      </div>

      {/* HERO */}
      <section className="bg-[#263E81] text-white mt-4">
        <div className="max-w-6xl mx-auto py-12 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>

            <p className="text-gray-200 max-w-lg">{group.description}</p>
          </div>

          <button
            onClick={() => navigate("/dashboard/service/select")}
            className="bg-[#EDCF07] text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition"
          >
            Select This Group
          </button>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-6xl mx-auto py-12 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-[#263E81] mb-4">
            About This Service Group
          </h2>

          <p className="text-gray-600">{group.description}</p>

          {group.admin_name && (
            <p className="mt-3 text-sm text-gray-500">
              Admin: {group.admin_name}
            </p>
          )}
        </div>

        <img
          src={`/images/service-groups/${group.id}.jpg`}
          className="rounded-xl shadow-md object-cover w-full h-64"
          onError={(e: any) => (e.target.src = image)}
        />
      </section>

      {/* SUBGROUPS */}
      <section className="max-w-6xl mx-auto py-6">
        <h2 className="text-center text-2xl font-bold text-[#263E81] mb-10">
          Our Sub-Groups
        </h2>

        <div className="space-y-10">
          {group.subgroups?.map((item: any, i: number) => (
            <div key={i} className="grid md:grid-cols-2 gap-8 items-center">
              {i % 2 === 0 && (
                <img
                  src={`/images/service-groups/sub-${i + 1}.jpg`}
                  className="rounded-xl shadow-md h-60 w-full object-cover"
                />
              )}

              <div>
                <h3 className="text-xl font-bold text-[#263E81] mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-600">{item.desc}</p>
              </div>

              {i % 2 !== 0 && (
                <img
                  src={`/images/service-groups/sub-${i + 1}.jpg`}
                  className="rounded-xl shadow-md h-60 w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="max-w-6xl mx-auto py-14">
        <h2 className="text-center text-2xl font-bold text-[#263E81] mb-8">
          Activity Gallery
        </h2>

        <div className="overflow-hidden relative">
          <motion.div
            animate={{ x: -index * 320 }}
            transition={{ duration: 0.8 }}
            className="flex gap-6"
          >
            {gallery.map((g, i) => (
              <img
                key={i}
                src={`/images/service-groups/gallery-${i + 1}.jpg`}
                className="w-[300px] h-56 rounded-xl object-cover shadow"
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-t py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 text-center gap-8">
          <div>
            <h3 className="text-3xl font-bold text-[#263E81]">
              {group.members || 0}
            </h3>
            <p className="text-gray-500 mt-1">Total Members</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-[#EDCF07]">
              {group.active || 0}
            </h3>
            <p className="text-gray-500 mt-1">Active Members</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-[#263E81]">
              {group.leaders || 0}
            </h3>
            <p className="text-gray-500 mt-1">Leaders</p>
          </div>
        </div>
      </section>
    </div>
  );
}