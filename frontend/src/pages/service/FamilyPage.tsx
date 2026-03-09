import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Family, FamilyMember } from "../../types";
import Swal from "sweetalert2";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const FamilyPage = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const familyData = await api.getMyFamily();
        setFamily(familyData);
        if (familyData) {
          const membersData = await api.getFamilyMembers(familyData.id);
          setMembers(membersData);
        }
      } catch (error: any) {
        console.error("Failed to fetch family", error);
        if (error.response && error.response.status === 404) {
          // No family assigned – show message
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load family data.",
            confirmButtonColor: "#fbbf24",
            background: "#142850",
            color: "#fff",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchFamily();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  if (!family) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="bg-[#142850] rounded-2xl shadow-xl p-8 text-center"
      >
        <UserGroupIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">
          No Family Assigned
        </h2>
        <p className="text-gray-300">You haven't been assigned to a family yet.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="space-y-6"
    >
      <div className="bg-[#142850] rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">{family.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1B3067] p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Father</p>
            <p className="text-white font-medium text-lg">{family.father?.name || "—"}</p>
            <div className="mt-2 text-sm text-gray-300 space-y-1">
              <p>
                <span className="text-gray-400">Batch:</span>{" "}
                {family.father?.profile?.batch || "—"}
              </p>
              <p>
                <span className="text-gray-400">Department:</span>{" "}
                {family.father?.profile?.department || "—"}
              </p>
              <p>
                <span className="text-gray-400">Phone:</span>{" "}
                {family.father?.profile?.personal_phone || "—"}
              </p>
              <p>
                <span className="text-gray-400">Telegram:</span>{" "}
                {family.father?.profile?.telegram || "—"}
              </p>
            </div>
          </div>

          <div className="bg-[#1B3067] p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Mother</p>
            <p className="text-white font-medium text-lg">{family.mother?.name || "—"}</p>
            <div className="mt-2 text-sm text-gray-300 space-y-1">
              <p>
                <span className="text-gray-400">Batch:</span>{" "}
                {family.mother?.profile?.batch || "—"}
              </p>
              <p>
                <span className="text-gray-400">Department:</span>{" "}
                {family.mother?.profile?.department || "—"}
              </p>
              <p>
                <span className="text-gray-400">Phone:</span>{" "}
                {family.mother?.profile?.personal_phone || "—"}
              </p>
              <p>
                <span className="text-gray-400">Telegram:</span>{" "}
                {family.mother?.profile?.telegram || "—"}
              </p>
            </div>
          </div>
        </div>

        {family.religious_father && (
          <div className="bg-[#1B3067] p-4 rounded-lg mt-4">
            <p className="text-sm text-gray-400 mb-1">Religious Father</p>
            <p className="text-white font-medium">{family.religious_father}</p>
          </div>
        )}
      </div>

      <div className="bg-[#142850] rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">
          Family Members ({members.length})
        </h3>
        {members.length === 0 ? (
          <p className="text-gray-400">No other members in this family.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-yellow-400 border-b border-gray-700">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Batch</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Telegram</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-gray-700">
                    <td className="py-2 text-white">{member.name}</td>
                    <td className="text-gray-300">{member.profile?.batch || "—"}</td>
                    <td className="text-gray-300">{member.profile?.department || "—"}</td>
                    <td className="text-gray-300">{member.profile?.personal_phone || "—"}</td>
                    <td className="text-gray-300">{member.profile?.telegram || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FamilyPage;
