import { useEffect, useState } from "react";
import { Card, Heading, Text } from "rsuite";
import { Link } from "react-router-dom";

import { siteUrls } from "../../utils/siteUrls";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { ButtonAdd, PageHeader } from "../../components/ui";
import { useAuthContext } from "../../context/AuthContext";

import { formatDateTime } from "../../utils/utils";
import AnswerButtons from "../../components/AnswerButtons";

export default function CoursesList() {
  const { user, clearNotification } = useAuthContext();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔔 Clear notification badge
  useEffect(() => {
    if (user?.notifications?.courses) {
      clearNotification("courses");
    }
  }, [user?.notifications?.courses, clearNotification]);

  // 📦 Load courses (once)
  useEffect(() => {
    const loadCourses = async () => {
      const res = await apiRequest(apiUrl.courses, "GET");

      if (res?.status === "success") {
        setCourses(res.data);
      }

      setLoading(false);
    };

    loadCourses();
  }, []);

  // 🗑 Delete course
  const deleteCourse = async (id) => {
    const confirmDelete = window.confirm("Opravdu chcete smazat tento kurz?");
    if (!confirmDelete) return;

    const res = await apiRequest(`${apiUrl.courses}/${id}`, "DELETE");

    if (res?.status === "success") {
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } else {
      alert("Nepodařilo se smazat kurz.");
    }
  };

  return (
    <>
      <PageHeader title="Kurzy" backTo={siteUrls.home} headingLevel={2} />

      {loading && <p>Načítám...</p>}

      {!loading && courses.length === 0 && (
        <p>Žádné kurzy nejsou k dispozici.</p>
      )}

      <div className="card-list">
        {!loading &&
          courses.map((course) => (
            <Card key={course._id} shaded className="mb-20">
              <Card.Header>
                <Heading level={5} size="md">
                  <Link to={siteUrls.viewCourseChoice(course._id)}>
                    {course.title}
                  </Link>
                </Heading>
              </Card.Header>

              <Card.Body>
                {course.description && (
                  <Text style={{ display: "block", marginBottom: 8 }}>
                    {course.description}
                  </Text>
                )}

                {course.location && (
                  <Text muted style={{ display: "block", marginBottom: 6 }}>
                    📍 {course.location}
                  </Text>
                )}

                <Text muted>🕒 {formatDateTime(course.dateTime)}</Text>
              </Card.Body>

              <Card.Footer>
                <AnswerButtons
                  type="courses"
                  itemId={course._id}
                  initialAnswers={course.answers}
                  yesLabel="Zúčastním se"
                  noLabel="Nezúčastním se"
                />
              </Card.Footer>

              {/* ADMIN ACTIONS */}
              {user?.role === "admin" && (
                <div
                  className="admin-actions"
                  style={{ padding: "0 18px 24px" }}
                >
                  <Link
                    to={siteUrls.editCourse(course._id)}
                    className="btn btn-sm btn-green"
                  >
                    Upravit
                  </Link>

                  <button
                    className="btn btn-sm btn-red"
                    onClick={() => deleteCourse(course._id)}
                  >
                    Smazat
                  </button>

                  <p
                    className={`admin-status ${
                      course.publish === "show"
                        ? "admin-status-published"
                        : "admin-status-hidden"
                    }`}
                  >
                    {course.publish === "show" ? "Zobrazeno" : "Skryto"}
                  </p>
                </div>
              )}
            </Card>
          ))}
      </div>

      {user?.role === "admin" && <ButtonAdd link={siteUrls.addCourse} />}
    </>
  );
}
