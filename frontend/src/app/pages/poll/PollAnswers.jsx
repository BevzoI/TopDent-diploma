import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { List, Avatar, Stack, Text, Tag } from "rsuite";
import { PageHeader } from "../../components/ui";
import { siteUrls } from "../../utils/siteUrls";

import { apiRequest, apiUrl } from "../../utils/apiData";

export default function PollAnswers() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch poll + all users
  useEffect(() => {
    const loadData = async () => {
      // 1. Poll
      const pollRes = await apiRequest(`${apiUrl.poll}/${id}`, "GET");

      // 2. Users
      const usersRes = await apiRequest(apiUrl.users, "GET");

      if (pollRes?.status === "success" && usersRes?.users) {
        const pollData = pollRes.data;
        const allUsers = usersRes.users;

        // If poll.users = [] → poll for all
        const visibleUsers =
          pollData.users?.length > 0
            ? allUsers.filter((u) => pollData.users.includes(u._id))
            : allUsers;

        setPoll(pollData);
        setUsers(visibleUsers);
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  const getAnswer = (userId) => {
    if (!poll) return null;

    return poll.answers.find((a) => a.userId === userId);
  };

  return (
    <>
      {loading && <p>Načítám...</p>}

      {!loading && poll && (
        <>
          <PageHeader
            title={`Otázka: ${poll.title}`}
            backTo={siteUrls.poll}
            headingLevel={4}
            className='mb-12'/>

          <p className="mb-20">{poll.description}</p>

          <List bordered hover>
            {users.map((u) => {
              const answer = getAnswer(u._id);

              return (
                <List.Item key={u._id}>
                  <Stack spacing={15} alignItems="center">
                    <Avatar
                      circle
                      src={u.avatar}
                    />

                    <Stack.Item grow={1}>
                      <Text style={{ fontWeight: 600 }}>
                        {u.name || u.email}
                      </Text>

                      {answer && (
                        <Text size="xs" muted>
                          {new Date(answer.answeredAt).toLocaleString()}
                        </Text>
                      )}
                    </Stack.Item>

                    {/* Status odpovědi */}
                    {!answer && <Tag color="violet">Bez odpovědi</Tag>}

                    {answer?.value === "yes" && (
                      <Tag color="green">Ano</Tag>
                    )}

                    {answer?.value === "no" && (
                      <Tag color="red">Ne</Tag>
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
