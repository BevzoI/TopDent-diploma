import { useEffect, useState } from "react";
import { Card, Button, Heading, Text } from "rsuite";
import { Link } from "react-router-dom";

import { siteUrls } from "../../utils/siteUrls";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { ButtonAdd, PageHeader } from "../../components/ui";
import { useAuthContext } from "../../context/AuthContext";
import { formatDateTime } from '../../utils/utils';
import AnswerButtons from '../../components/AnswerButtons';

export default function EventList() {
  const { user, clearNotification } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.notifications?.events) {
        clearNotification("events");
    }
}, [user?.notifications?.events]);

  // Load all events
  useEffect(() => {
    const loadEvents = async () => {
      const res = await apiRequest(apiUrl.events, "GET");

      if (res?.status === "success") {
        setEvents(res.data);
      }

      setLoading(false);
    };

    loadEvents();
  }, [user?.notifications?.events]);

  // Delete event
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
          events.map((ev) => (
            <Card key={ev._id} shaded className="mb-20">
              <Card.Header>
                <Heading level={5} size="md" bold>
                  <Link to={siteUrls.eventAnswers(ev._id)}>{ev.title}</Link>
                </Heading>
              </Card.Header>

              <Card.Body>
                {ev.description && (
                  <Text style={{ display: "block", marginBottom: 8 }}>
                    {ev.description}
                  </Text>
                )}

                {ev.address && (
                  <Text muted style={{ display: "block", marginBottom: 8 }}>
                    📍 {ev.address}
                  </Text>
                )}

                <Text muted>🕒 {formatDateTime(ev.dateTime)}</Text>
              </Card.Body>

              <Card.Footer>
			  <AnswerButtons
				type="events"
				itemId={ev._id}
				initialAnswers={ev.answers}
				yesLabel="Přijdu"
				noLabel="Nepřijdu"
				/>

              </Card.Footer>

              {/* ADMIN ACTIONS */}
              {user?.role === "admin" && (
                <div className="admin-actions" style={{ padding: "0 18px 24px" }}>
                  <Link
                    to={siteUrls.editEvent(ev._id)}
                    className="btn btn-sm btn-green"
                  >
                    Upravit
                  </Link>

                  <button
                    className="btn btn-sm btn-red"
                    onClick={() => deleteEvent(ev._id)}
                  >
                    Smazat
                  </button>

                  <p
                    className={`admin-status ${
                      ev.publish === "show"
                        ? "admin-status-published"
                        : "admin-status-hidden"
                    }`}
                  >
                    {ev.publish === "show" ? "Zobrazeno" : "Skryto"}
                  </p>
                </div>
              )}
            </Card>
          ))}
      </div>

      {user?.role === "admin" && (
        <ButtonAdd link={siteUrls.addEvent} />
      )}
    </>
  );
}
