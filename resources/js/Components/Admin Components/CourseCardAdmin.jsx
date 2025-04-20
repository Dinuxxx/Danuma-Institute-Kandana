import React from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";

const CourseCard = ({ id, title,grade, instructor, pattern }) => {

  const [teacherName, setTeacherName] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (instructor) {
      // Fetch the teacher's details using the teacher_id
      setLoading(true);
      axios.get(`/teachers-id/${instructor}`)
        .then(response => {
          const teacher = response.data;
          if (teacher && teacher.user && teacher.user.registration) {
            // Format as Title + First name + Last name (e.g. Mr. Ayan Sampath)
            const title = teacher.user.registration.title || "";
            const firstName = teacher.user.registration.first_name || "";
            const lastName = teacher.user.registration.last_name || "";
            setTeacherName(`${title} ${firstName} ${lastName}`);
          } else {
            setTeacherName("No Teacher Assigned");
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching teacher details:", error);
          setTeacherName("Unknown");
          setLoading(false);
        });
    } else {
      setTeacherName("No Teacher Assigned");
      setLoading(false);
    }
  }, [instructor]);

  return (
    <div className="relative bg-white shadow-md rounded-lg overflow-hidden flex flex-col bg-blue-200">
      <div
        className="h-32 w-full"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="p-4">
        <Link
          href={`/admin/courses/${id}/edit`}
          className="text-orange-500 font-bold text-lg hover:underline"
        >
          {id} - {title} (grade-{grade})
        </Link>
        <p className="text-gray-600">{loading ? "Loading..." : teacherName}</p>
      </div>
    </div>
  );
};

export default CourseCard;
