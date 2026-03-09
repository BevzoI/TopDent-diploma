import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ButtonAdd, PageHeader } from "../../components/ui";
import { Panel, FlexboxGrid, Message } from "rsuite";

import { siteUrls } from "../../utils/siteUrls";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { useAuthContext } from "../../context/AuthContext";

export default function ChatList() {
  const { user, clearNotification } = useAuthContext();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // 🔔 Clear chat notification badge
  useEffect(() => {
    if (user?.notifications?.chat) {
      clearNotification("chat");
    }
  }, [user?.notifications?.chat, clearNotification]);

  // 🟦 Load chats
  useEffect(() => {
    const loadChats = async () => {
      const res = await apiRequest(apiUrl.chat, "GET");

      if (res?.status === "success") {
        setChats(res.data || []);
      } else {
        setApiError("Nepodařilo se načíst chaty.");
      }

      setLoading(false);
    };

    loadChats();
  }, []);

  // 🟦 Delete chat
  const deleteChat = async (id) => {
    if (!window.confirm("Opravdu chcete smazat tento chat?")) return;

    const res = await apiRequest(`${apiUrl.chat}/${id}`, "DELETE");

    if (res?.status === "success") {
      setChats((prev) => prev.filter((c) => c.id !== id));
    } else {
      setApiError("Nepodařilo se smazat chat.");
    }
  };

  return (
    <>
      <PageHeader title="Seznam chatů" backTo={siteUrls.home} headingLevel={2} />

      {apiError && (
        <Message type="error" showIcon style={{ marginBottom: 15 }}>
          {apiError}
        </Message>
      )}

      {loading && <p>Načítám…</p>}

      {!loading && chats.length === 0 && (
        <p>Žádné chaty nejsou k dispozici.</p>
      )}

      <FlexboxGrid justify="start" align="top" gutter={20}>
        {chats.map((chat) => (
          <FlexboxGrid.Item
            key={chat._id}
            colspan={24}
            sm={12}
            md={8}
            lg={6}
          >
            <Panel bordered shaded className="chat-card">
              <Link to={siteUrls.viewChat(chat._id)} className="chat-title">
                {chat.title}
              </Link>

              <div className="chat__meta">
                <div className="chat__meta-item">
                  <div className="chat__meta-item-label">Vytvořeno:</div>
                  <div className="chat__meta-item-value">
                    {chat.createdAt
                      ? new Date(chat.createdAt).toLocaleDateString("cs-CZ")
                      : "—"}
                  </div>
                </div>

                <div className="chat__meta-item">
                  <div className="chat__meta-item-label">Skupiny:</div>
                  <div className="chat__meta-item-value">
                    {chat.groups?.length === 0
                      ? "Všichni"
                      : chat.groups?.map((g) => g.name).join(", ")}
                  </div>
                </div>
              </div>

              {user?.role === "admin" && (
                <div className="admin-actions">
                  <Link
                    to={siteUrls.editChat(chat._id)}
                    className="btn btn-sm btn-green"
                  >
                    Upravit
                  </Link>

                  <button
                    className="btn btn-sm btn-red"
                    onClick={() => deleteChat(chat._id)}
                  >
                    Smazat
                  </button>

                  <p
                    className={`admin-status ${
                      chat.publish === "show"
                        ? "admin-status-published"
                        : "admin-status-hidden"
                    }`}
                  >
                    {chat.publish === "show" ? "Zobrazeno" : "Skryto"}
                  </p>
                </div>
              )}
            </Panel>
          </FlexboxGrid.Item>
        ))}
      </FlexboxGrid>

      <ButtonAdd link={siteUrls.addChat} />
    </>
  );
}