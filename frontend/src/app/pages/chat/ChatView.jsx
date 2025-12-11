import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Input, Button, List, Avatar } from "rsuite";

import { apiRequest, apiUrl } from "../../utils/apiData";
import { useAuthContext } from "../../context/AuthContext";

export default function ChatView() {
  const { id } = useParams();
  const { user } = useAuthContext();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [lastTimestamp, setLastTimestamp] = useState(null);
  const scrollRef = useRef();

  // 🔵 Завантаження всього чату при вході
  useEffect(() => {
    const loadChat = async () => {
      const res = await apiRequest(`${apiUrl.chat}/${id}`, "GET");

      if (res?.status === "success") {
        setChat(res.data);
        setMessages(res.data.messages);

        if (res.data.messages.length > 0) {
          setLastTimestamp(
            res.data.messages[res.data.messages.length - 1].createdAt
          );
        }

        scrollToBottom();
      }
    };

    loadChat();
  }, [id]);

  // 🔵 Автооновлення кожні 2 секунди
  useEffect(() => {
    const interval = setInterval(loadNewMessages, 2500);
    return () => clearInterval(interval);
  });

  // 🟢 Завантажуємо тільки нові повідомлення
  const loadNewMessages = async () => {
    if (!lastTimestamp) return;

    const res = await apiRequest(
      `${apiUrl.chat}/${id}/messages?since=${lastTimestamp}`
    );

    if (res?.status === "success" && res.data.length > 0) {
      setMessages((prev) => [...prev, ...res.data]);

      setLastTimestamp(res.data[res.data.length - 1].createdAt);

      scrollToBottom();
    }
  };

  // 🟢 Відправка повідомлення
  const sendMessage = async () => {
    if (!text.trim()) return;

    const payload = {
      sender: user._id,
      content: text.trim(),
    };

    const res = await apiRequest(`${apiUrl.chat}/${id}/message`, "POST", payload);

    if (res?.status === "success") {
      // додаємо одразу, не чекаємо інтервал
      setMessages((prev) => [...prev, res.data.messages.at(-1)]);

      setLastTimestamp(res.data.messages.at(-1).createdAt);

      setText("");
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  if (!chat) return <p>Načítám...</p>;

  return (
    <div className="chat-view">
      <h3>{chat.title}</h3>

      <List hover>
        {messages.map((msg) => {
          const isMine = msg.sender === user._id || msg.sender?._id === user._id;

          return (
            <List.Item
              key={msg._id}
              style={{
                textAlign: isMine ? "right" : "left",
                padding: "10px 5px",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: isMine ? "#d0f0d0" : "#e8e8e8",
                  borderRadius: 8,
                  padding: "8px 12px",
                  maxWidth: "70%",
                }}
              >
                {!isMine && (
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {msg.sender?.name || msg.sender?.email}
                  </div>
                )}
                <div>{msg.content}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
                  {new Date(msg.createdAt).toLocaleTimeString("cs-CZ")}
                </div>
              </div>
            </List.Item>
          );
        })}

        <div ref={scrollRef}></div>
      </List>

      <div className="chat-input" style={{ marginTop: 20, display: "flex", gap: 8 }}>
        <Input
          value={text}
          onChange={(v) => setText(v)}
          placeholder="Napište zprávu..."
        />
        <Button appearance="primary" onClick={sendMessage}>
          Odeslat
        </Button>
      </div>
    </div>
  );
}
