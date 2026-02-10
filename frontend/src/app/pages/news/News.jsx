import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Panel, FlexboxGrid, Loader, Message } from "rsuite";
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

  // 🔔 Clear news notification
  useEffect(() => {
    if (user?.notifications?.news) {
      clearNotification("news");
    }
  }, [user?.notifications?.news, clearNotification]);

  // 📦 Load news (once)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await apiRequest(apiUrl.news);

        if (data?.status === "success") {
          setNews(data.data);
        } else {
          setError(data?.message || "Сталася помилка");
        }
      } catch (e) {
        setError("Не вдалося отримати новини");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <Loader size="lg" content="Nahrávání..." />;
  }

  if (error) {
    return (
      <Message type="error" showIcon style={{ margin: 20 }}>
        {error}
      </Message>
    );
  }

  const deleteNewsItem = async (id) => {
    const result = await Swal.fire({
      title: "Opravdu chcete smazat tuto zprávu?",
      text: "Tuto akci nelze vrátit zpět.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ano, smazat",
      cancelButtonText: "Zrušit",
    });

    if (!result.isConfirmed) return;

    const res = await apiRequest(`${apiUrl.news}/${id}`, "DELETE");

    if (res?.status === "success") {
      setNews((prev) => prev.filter((n) => n._id !== id));

      Swal.fire({
        title: "Smazáno!",
        text: "Zpráva byla úspěšně odstraněna.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Chyba",
        text: "Nepodařilo se smazat zprávu.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <PageHeader title="Nástěnka" backTo={siteUrls.home} headingLevel={2} />

      <FlexboxGrid justify="start" align="top" gutter={20}>
        {news.map((item) => (
          <FlexboxGrid.Item
            key={item._id}
            colspan={24}
            sm={12}
            md={8}
            lg={6}
          >
            <Panel bordered shaded style={{ marginBottom: 20, height: "100%" }}>
              <h4 style={{ marginBottom: 10 }}>{item.title}</h4>
              <p className="mb-12">{item.text}</p>

              <p style={{ fontSize: 12, color: "#999" }}>
                Zveřejněno: {formatDate(item.createdAt)}
              </p>

              {user?.role === "admin" && (
                <div className="admin-actions">
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

                  <p
                    className={`admin-status ${
                      item.publish === "show"
                        ? "admin-status-published"
                        : "admin-status-hidden"
                    }`}
                  >
                    {item.publish === "show" ? "Zobrazeno" : "Skryto"}
                  </p>
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
