import { useEffect, useState } from "react";
import { Card, Heading, Text } from "rsuite";
import { Link } from "react-router-dom";

import { siteUrls } from "../../utils/siteUrls";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { ButtonAdd, PageHeader } from "../../components/ui";
import { useAuthContext } from "../../context/AuthContext";

import { formatDateTime } from "../../utils/utils";
import AnswerButtons from "../../components/AnswerButtons";

export default function EventList() {
  const { user, clearNotification } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔔 Clear notification badge
  useEffect(() => {
    if (user?.notifications?.events) {
      clearNotification("events");
    }
  }, [user?.notifications?.events, clearNotification]);

  // 📦 Load events (once)
  useEffect(() => {
    const loadEvents = async () => {
      const res = await apiRequest(apiUrl.events, "GET");

      if (res?.status === "success") {
        setEvents(res.data);
      }

      setLoading(false);
    };

    loadEvents();
  }, []);

  // 🗑 Delete event
  const deleteEvent = async (id) => {
    const confirmDelete = window.confirm("Opravdu chcete smazat tuto událost?");
    if (!confirmDelete) return;

    const res = await apiRequest(`${apiUrl.events}/${id}`, "DELETE");

    if (res?.status === "success") {
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } else {
      alert("Nepodařilo se smazat událost.");
    }
  };

  return (
    <>
      <PageHeader title="Události" backTo={siteUrls.home} headingLevel={2} />

      {loading && <p>Načítám...</p>}

      {!loading && events.length === 0 && (
        <p>Žádné události nejsou k dispozici.</p>
      )}

      <div className="card-list">
        {!loading &&
          events.map((event) => (
            <Card key={event._id} shaded className="mb-20">
              <Card.Header>
                <Heading level={5} size="md">
                  <Link to={siteUrls.viewEventChoice(event._id)}>
                    {event.title}
                  </Link>
                </Heading>
              </Card.Header>

              <Card.Body>
                {event.description && (
                  <Text style={{ display: "block", marginBottom: 8 }}>
                    {event.description}
                  </Text>
                )}

                {event.location && (
                  <Text muted style={{ display: "block", marginBottom: 6 }}>
                    📍 {event.location}
                  </Text>
                )}

                <Text muted>🕒 {formatDateTime(event.dateTime)}</Text>
              </Card.Body>

              <Card.Footer>
                <AnswerButtons
                  type="events"
                  itemId={event._id}
                  initialAnswers={event.answers}
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
                    to={siteUrls.editEvent(event._id)}
                    className="btn btn-sm btn-green"
                  >
                    Upravit
                  </Link>

                  <button
                    className="btn btn-sm btn-red"
                    onClick={() => deleteEvent(event._id)}
                  >
                    Smazat
                  </button>

                  <p
                    className={`admin-status ${
                      event.publish === "show"
                        ? "admin-status-published"
                        : "admin-status-hidden"
                    }`}
                  >
                    {event.publish === "show" ? "Zobrazeno" : "Skryto"}
                  </p>
                </div>
              )}
            </Card>
          ))}
      </div>

      {user?.role === "admin" && <ButtonAdd link={siteUrls.addEvent} />}
    </>
  );
}
