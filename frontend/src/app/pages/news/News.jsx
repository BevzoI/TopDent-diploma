import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Panel, FlexboxGrid, Loader, Message, Tag } from "rsuite";
import Swal from "sweetalert2";

import { apiRequest, apiUrl } from "../../utils/apiData";
import { useAuthContext } from "../../context/AuthContext";
import { siteUrls } from "../../utils/siteUrls";
import ButtonAdd from "../../components/ui/admin/ButtonAdd";
import { PageHeader } from "../../components/ui";
import { formatDate } from "../../utils/utils";

export default function News() {
  const { clearNotification, user } = useAuthContext();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.notifications?.news) {
      clearNotification("news");
    }
  }, [user?.notifications?.news, clearNotification]);

  useEffect(() => {
    const fetchNews = async () => {
      const data = await apiRequest(apiUrl.news);

      if (data?.status === "success") {
        setNews(data.data);
      } else {
        setError(data?.message || "Chyba při načítání");
      }

      setLoading(false);
    };

    fetchNews();
  }, []);

  if (loading) return <Loader size="lg" content="Načítání..." />;
  if (error)
    return (
      <Message type="error" showIcon style={{ margin: 20 }}>
        {error}
      </Message>
    );

  const deleteNewsItem = async (id) => {
    const result = await Swal.fire({
      title: "Opravdu chcete smazat tuto zprávu?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ano",
      cancelButtonText: "Zrušit",
    });

    if (!result.isConfirmed) return;

    const res = await apiRequest(`${apiUrl.news}/${id}`, "DELETE");

    if (res?.status === "success") {
      setNews((prev) => prev.filter((n) => n._id !== id));
    }
  };

  const renderVisibility = (item) => {
    if (item.visibility === "all") return <Tag color="green">Pro všechny</Tag>;
    if (item.visibility === "users")
      return <Tag color="blue">Konkrétní uživatelé</Tag>;
    if (item.visibility === "groups")
      return <Tag color="violet">Konkrétní skupiny</Tag>;
    return null;
  };

  return (
    <>
      <PageHeader title="Nástěnka" backTo={siteUrls.home} headingLevel={2} />

      <FlexboxGrid gutter={20}>
        {news.map((item) => (
          <FlexboxGrid.Item key={item._id} colspan={24} md={12} lg={8}>
            <Panel bordered shaded style={{ marginBottom: 20 }}>
              <h4>{item.title}</h4>

              <p style={{ whiteSpace: "pre-wrap" }}>{item.text}</p>

              {/* 📎 Attachments */}
              {item.attachments?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {item.attachments.map((file, index) =>
                    file.type === "image" ? (
                      <img
                        key={index}
                        src={file.url}
                        alt={file.name}
                        style={{
                          maxWidth: "100%",
                          marginBottom: 8,
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <div key={index}>
                        <a href={file.url} target="_blank" rel="noreferrer">
                          📎 {file.name}
                        </a>
                      </div>
                    )
                  )}
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                {renderVisibility(item)}
              </div>

              <p style={{ fontSize: 12, color: "#999", marginTop: 10 }}>
                Zveřejněno: {formatDate(item.createdAt)}
              </p>

              {item.author && (
                <p style={{ fontSize: 12, color: "#666" }}>
                  Autor: {item.author.name || item.author.email}
                </p>
              )}

              {user?.role === "admin" && (
                <div style={{ marginTop: 12 }}>
                  <Link
                    to={siteUrls.editNews(item._id)}
                    className="btn btn-sm btn-green"
                  >
                    Upravit
                  </Link>

                  <button
                    className="btn btn-sm btn-red"
                    onClick={() => deleteNewsItem(item._id)}
                  >
                    Smazat
                  </button>

                  <div style={{ marginTop: 8 }}>
                    <Tag color={item.publish === "show" ? "green" : "red"}>
                      {item.publish === "show" ? "Zobrazeno" : "Skryto"}
                    </Tag>
                  </div>
                </div>
              )}
            </Panel>
          </FlexboxGrid.Item>
        ))}
      </FlexboxGrid>

      {user?.role === "admin" && <ButtonAdd link={siteUrls.addNews} />}
    </>
  );
}