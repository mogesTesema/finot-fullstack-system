// @ts-nocheck
// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [serviceGroups, setServiceGroups] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'groups', 'questions', 'events'
  const [filters, setFilters] = useState({
    role: "",
    batch: "",
    department: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allUsers = await api.getAllUsers();
        setUsers(allUsers);
        const groups = await api.getServiceGroups();
        setServiceGroups(groups);
        const allQuestions = await api.getQuestions();
        setQuestions(allQuestions);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.batch && user.profile.batch !== filters.batch) return false;
    if (filters.department && user.profile.department !== filters.department)
      return false;
    return true;
  });

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      background: "#142850",
      color: "#fff",
    });
    if (result.isConfirmed) {
      try {
        await api.deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", error.message, "error");
      }
    }
  };

  const handleAssignAdmin = async (groupId, userId) => {
    try {
      await api.assignGroupAdmin(groupId, userId);
      Swal.fire("Success!", "Admin assigned.", "success");
      // Refresh users to update role (in mock, we'd need to update local state)
      const updatedUsers = await api.getAllUsers();
      setUsers(updatedUsers);
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    // Similar to delete user, but for questions
    // Implementation similar to deleteUser
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B3067] flex items-center justify-center">
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B3067] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-yellow-400">
            Super Admin Dashboard
          </h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {["users", "groups", "questions", "events"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize font-semibold transition ${
                activeTab === tab
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <div className="bg-[#142850] rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">
                All Users
              </h2>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select
                  value={filters.role}
                  onChange={(e) =>
                    setFilters({ ...filters, role: e.target.value })
                  }
                  className="px-4 py-2 bg-[#1B3067] border border-gray-600 rounded text-white"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="service_admin">Service Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <select
                  value={filters.batch}
                  onChange={(e) =>
                    setFilters({ ...filters, batch: e.target.value })
                  }
                  className="px-4 py-2 bg-[#1B3067] border border-gray-600 rounded text-white"
                >
                  <option value="">All Batches</option>
                  <option value="Freshman">Freshman</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th/GC">5th/GC</option>
                </select>
                <input
                  type="text"
                  placeholder="Filter by department"
                  value={filters.department}
                  onChange={(e) =>
                    setFilters({ ...filters, department: e.target.value })
                  }
                  className="px-4 py-2 bg-[#1B3067] border border-gray-600 rounded text-white"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-yellow-400 border-b border-gray-700">
                    <tr>
                      <th className="py-2">Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Batch</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700">
                        <td className="py-2 text-white">{user.full_name}</td>
                        <td className="text-gray-300">{user.email}</td>
                        <td className="text-gray-300">{user.role}</td>
                        <td className="text-gray-300">{user.profile.batch}</td>
                        <td className="text-gray-300">
                          {user.profile.department}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300 mr-2"
                            title="Delete user"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          {user.role !== "service_admin" && (
                            <button
                              onClick={() => {
                                // Show a modal to select group
                                Swal.fire({
                                  title: "Assign as Admin",
                                  input: "select",
                                  inputOptions: serviceGroups.reduce(
                                    (acc, g) => {
                                      acc[g.group_id] = g.group_name;
                                      return acc;
                                    },
                                    {},
                                  ),
                                  showCancelButton: true,
                                  confirmButtonText: "Assign",
                                  background: "#142850",
                                  color: "#fff",
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    handleAssignAdmin(
                                      parseInt(result.value),
                                      user.id,
                                    );
                                  }
                                });
                              }}
                              className="text-yellow-400 hover:text-yellow-300"
                              title="Make group admin"
                            >
                              <UserPlusIcon className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Groups Tab – show service groups and their admins */}
        {activeTab === "groups" && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <div className="bg-[#142850] rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">
                Service Groups
              </h2>
              <div className="grid gap-4">
                {serviceGroups.map((group) => (
                  <div
                    key={group.group_id}
                    className="bg-[#1B3067] p-4 rounded flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-yellow-400">
                        {group.group_name}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {group.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        Admin ID: {group.admin_id || "None"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // Show user list to assign new admin
                        Swal.fire({
                          title: "Select New Admin",
                          input: "select",
                          inputOptions: users
                            .filter((u) => u.role === "student")
                            .reduce((acc, u) => {
                              acc[u.id] = u.full_name;
                              return acc;
                            }, {}),
                          showCancelButton: true,
                          confirmButtonText: "Assign",
                          background: "#142850",
                          color: "#fff",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleAssignAdmin(group.group_id, result.value);
                          }
                        });
                      }}
                      className="bg-yellow-400 text-[#1B3067] px-3 py-1 rounded text-sm"
                    >
                      Change Admin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Questions Tab – moderate Q&A */}
        {activeTab === "questions" && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <div className="bg-[#142850] rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">
                Moderate Questions
              </h2>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.question_id} className="bg-[#1B3067] p-4 rounded">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-yellow-400 font-semibold">
                          {q.display_name}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          {q.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.question_id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-white mt-1">{q.question_body}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Events Tab – post global events */}
        {activeTab === "events" && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <div className="bg-[#142850] rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">
                Post Global Event
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const event = {
                    title: formData.get("title"),
                    quote: formData.get("quote"),
                    date: formData.get("date"),
                    time: formData.get("time"),
                    location: formData.get("location"),
                    target_audience: "all", // global
                  };
                  try {
                    await api.createEvent(event);
                    Swal.fire("Success", "Event posted!", "success");
                    e.target.reset();
                  } catch (error) {
                    Swal.fire("Error", error.message, "error");
                  }
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  required
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  name="quote"
                  placeholder="Quote (optional)"
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="date"
                    required
                    className="px-4 py-2 bg-[#1B3067] border border-gray-600 rounded text-white"
                  />
                  <input
                    type="time"
                    name="time"
                    required
                    className="px-4 py-2 bg-[#1B3067] border border-gray-600 rounded text-white"
                  />
                </div>
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  required
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded text-white"
                />
                <button
                  type="submit"
                  className="bg-yellow-400 text-[#1B3067] px-6 py-2 rounded font-semibold hover:bg-yellow-300"
                >
                  Post Event
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
