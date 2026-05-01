// src/pages/dashboard/courses/CourseManagement.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  PlusCircleIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types/course";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const DAYS: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

const CourseManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    batch_year: 1,
    day1: "MON",
    day2: "",
    start_time: "09:00",
    end_time: "10:30",
    venue: "",
    semester: 1,
  });

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses();
      // Filter courses created by this admin (for demo, show all)
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
      toast.error(t("failed_to_load_courses"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t("course_name_required"));
      return;
    }

    setSubmitting(true);
    try {
      await api.createCourse({
        ...formData,
        day2: formData.day2 || null,
        created_by: user?.id || 1,
      });
      toast.success(t("course_created_success"));
      setShowCreateForm(false);
      setFormData({
        name: "",
        batch_year: 1,
        day1: "MON",
        day2: "",
        start_time: "09:00",
        end_time: "10:30",
        venue: "",
        semester: 1,
      });
      fetchCourses();
    } catch (error) {
      console.error("Failed to create course", error);
      toast.error(t("failed_to_create_course"));
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysText = (course: Course) => {
    let days = DAYS[course.day1];
    if (course.day2) {
      days += ` & ${DAYS[course.day2]}`;
    }
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("course_management")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("course_management_description")}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <PlusCircleIcon className="h-4 w-4" />
          {showCreateForm ? t("cancel") : t("create_course")}
        </button>
      </motion.div>

      {/* Create Course Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card mb-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("create_new_course")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Course Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("course_name")} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("course_name_placeholder")}
                  className="input w-full"
                  required
                />
              </div>

              {/* Batch Year */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("batch_year")} *
                </label>
                <select
                  name="batch_year"
                  value={formData.batch_year}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("semester")} *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>

              {/* Day 1 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("day1")} *
                </label>
                <select
                  name="day1"
                  value={formData.day1}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="MON">Monday</option>
                  <option value="TUE">Tuesday</option>
                  <option value="WED">Wednesday</option>
                  <option value="THU">Thursday</option>
                  <option value="FRI">Friday</option>
                  <option value="SAT">Saturday</option>
                  <option value="SUN">Sunday</option>
                </select>
              </div>

              {/* Day 2 (Optional) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("day2_optional")}
                </label>
                <select
                  name="day2"
                  value={formData.day2}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="">None</option>
                  <option value="MON">Monday</option>
                  <option value="TUE">Tuesday</option>
                  <option value="WED">Wednesday</option>
                  <option value="THU">Thursday</option>
                  <option value="FRI">Friday</option>
                  <option value="SAT">Saturday</option>
                  <option value="SUN">Sunday</option>
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("start_time")} *
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("end_time")} *
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>

              {/* Venue */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("venue")}
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder={t("venue_placeholder")}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? t("creating") : t("create_course")}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-outline px-6"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AcademicCapIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{t("no_courses_yet")}</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            <PlusCircleIcon className="h-4 w-4" />
            {t("create_first_course")}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{course.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AcademicCapIcon className="h-4 w-4" />
                      {t("batch")} {course.batch_year} • {t("semester")} {course.semester}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {getDaysText(course)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {course.start_time} - {course.end_time}
                    </span>
                    {course.venue && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {course.venue}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/courses/${course.id}/attendance`)}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-2 self-start md:self-center"
                >
                  <ClipboardDocumentListIcon className="h-4 w-4" />
                  {t("take_attendance")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseManagement;