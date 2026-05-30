import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Spinner from "../../components/ui/Spinner";
import MaterialsManager from "../admin/components/MaterialsManager";
import { api } from "../../lib/api";

const CourseMaterialsPage = () => {
  const { id: semesterCourseId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [curriculumId, setCurriculumId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    const fetchCurriculumId = async () => {
      if (!semesterCourseId) return;
      try {
        const courses = await api.getSemesterCourses();
        const semesterCourse = courses.find((c: any) => c.id === semesterCourseId);
        if (semesterCourse) {
          // Get the curriculum UUID from the semester course
          setCurriculumId(semesterCourse.course || semesterCourse.curriculum?.id);
          setCourseTitle(semesterCourse.course_details?.title || semesterCourse.curriculum?.title || "Course");
        }
      } catch (error) {
        console.error("Failed to fetch course info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurriculumId();
  }, [semesterCourseId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  if (!curriculumId) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Link
          to="/dashboard/courses"
          className="inline-flex items-center text-primary hover:text-primary-light mb-4 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {t("back_to_courses")}
        </Link>
        <div className="text-center py-12 text-muted-foreground">
          <p>{t("course_not_found")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Link
        to="/dashboard/courses"
        className="inline-flex items-center text-primary hover:text-primary-light mb-4 text-sm"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        {t("back_to_courses")}
      </Link>
      
      <MaterialsManager
        materialType="COURSE"
        courseId={curriculumId}  // ← Now passing Curriculum UUID, not SemesterCourse UUID
        title={courseTitle}
        subtitle={t("course_materials_description")}
      />
    </div>
  );
};

export default CourseMaterialsPage;