import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { List, Avatar, Stack, Text, Tag } from "rsuite";
import { PageHeader } from "../../components/ui";
import { siteUrls } from "../../utils/siteUrls";

import { apiRequest, apiUrl } from "../../utils/apiData";
import { formatDateTime } from '../../utils/utils';

export default function EventAnswers() {
  const { id } = useParams();

  const [eventData, setEventData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch event + users
  useEffect(() => {
    const loadData = async () => {
      // 1. Event
      const eventRes = await apiRequest(`${apiUrl.events}/${id}`, "GET");

      // 2. Users
      const usersRes = await apiRequest(apiUrl.users, "GET");

      if (eventRes?.status === "success" && usersRes?.users) {
        const ev = eventRes.data;
        const allUsers = usersRes.users;

        // If event.users = [] → visible for all
        const visibleUsers =
          ev.users?.length > 0
            ? allUsers.filter((u) => ev.users.includes(u._id))
            : allUsers;

        setEventData(ev);
        setUsers(visibleUsers);
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  const getAnswer = (userId) => {
    if (!eventData) return null;
    return eventData.answers.find((a) => a.userId === userId);
  };

  return (
    <>
      <PageHeader
        title="Odpovědi na událost"
        backTo={siteUrls.events}
        headingLevel={2}
      />

      {loading && <p>Načítám...</p>}

      {!loading && eventData && (
        <>
          <h4 style={{ marginTop: 10, marginBottom: 8 }}>
            Událost: <strong>{eventData.title}</strong>
          </h4>

          {eventData.address && (
            <p style={{ marginBottom: 6 }}>📍 {eventData.address}</p>
          )}

          <p style={{ marginBottom: 20 }}>
            🕒 {formatDateTime(eventData.dateTime)}
          </p>

          <List bordered hover>
            {users.map((u) => {
              const answer = getAnswer(u._id);

              return (
                <List.Item key={u._id}>
                  <Stack spacing={15} alignItems="center">
                    <Avatar
                      circle
                      src={u.avatar || `https://i.pravatar.cc/150?u=${u._id}`}
                    />

                    <Stack.Item grow={1}>
                      <Text style={{ fontWeight: 600 }}>
                        {u.name || u.email}
                      </Text>

                      {answer && (
                        <Text size="xs" muted>
                          {new Date(answer.answeredAt).toLocaleString("cs-CZ")}
                        </Text>
                      )}
                    </Stack.Item>

                    {/* Status odpovědi */}
                    {!answer && (
                      <Tag color="violet" size="sm">
                        Bez odpovědi
                      </Tag>
                    )}

                    {answer?.value === "yes" && (
                      <Tag color="green" size="sm">
                        Přijdu
                      </Tag>
                    )}

                    {answer?.value === "no" && (
                      <Tag color="red" size="sm">
                        Nepřijdu
                      </Tag>
                    )}
                  </Stack>
                </List.Item>
              );
            })}
          </List>
        </>
      )}
    </>
  );
}
