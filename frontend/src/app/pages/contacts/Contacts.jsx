import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Image, Grid, Row, Col, Panel, Loader, Message } from "rsuite";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { useAuthContext } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { filePath, siteUrls } from "../../utils/siteUrls";
import { ButtonAdd, PageHeader } from "../../components/ui";
import { copy, formatDate } from "../../utils/utils";

export default function Contacts() {
  const { user } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setHeaderData } = useOutletContext();

  useEffect(() => {
    setHeaderData({
      title: "Seznam uživatelů",
    });
  }, [setHeaderData]);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest(apiUrl.users);

      if (data.status === "success") {
        setUsers(data.users);
      } else {
        setError(data.message || "Nepodařilo se načíst uživatele");
      }
    } catch (e) {
      setError("Chyba při načítání uživatelů");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Opravdu chcete smazat uživatele?",
      text: "Tato akce je nevratná.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ano, smazat",
      cancelButtonText: "Zrušit",
    });

    if (!result.isConfirmed) return;

    const res = await apiRequest(`${apiUrl.users}/${id}`, "DELETE");

    if (res?.status === "success") {
      setUsers((prev) => prev.filter((u) => u.id !== id));

      Swal.fire({
        title: "Smazáno!",
        text: "Uživatel byl úspěšně odstraněn.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Chyba",
        text: "Nepodařilo se smazat uživatele.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleCopy = (user) => {
    copy(
      process.env.REACT_APP_URL + `?user=${user.email}&pass=${user.password}`
    );

    Swal.fire({
      title: "Zkopírováno!",
    });
  };

  return (
    <>
      <PageHeader
        title="Seznam uživatelů"
        backTo={siteUrls.home}
        headingLevel={2}
        className="mb-20"
      />

      <Grid fluid>
        <Row gutter={20}>
          {users.map((u) => {
            const avatar = u.avatar?.includes("cloudinary")
              ? u.avatar
              : filePath.avatars + (u.avatar || "AV1.webp");

            return (
              <Col key={u.id} xs={24} sm={24} md={12} lg={8}>
                <Panel bordered shaded className="card-user">
                  <Image
                    src={avatar}
                    alt={u.email}
                    className="card-user__avatar"
                  />

                  <div className="card-user__info">
                    <div className="card-user__info-item">
                      <div className="card-user__info-item-value">{u.name || "—"}</div>
                    </div>

                    <div className="card-user__info-item">
                      <div className="card-user__info-item-label">Role:</div>
                      <div className="card-user__info-item-value">{u.role}</div>
                    </div>

                    <div className="card-user__info-item">
                      <div className="card-user__info-item-label">Email:</div>
                      <div className="card-user__info-item-value">{u.email}</div>
                    </div>

                    <div className="card-user__info-item">
                      <div className="card-user__info-item-label">Telefon:</div>
                      <div className="card-user__info-item-value">
                        {u.phone || "—"}
                      </div>
                    </div>

                    <div className="card-user__info-item">
                      <div className="card-user__info-item-label">Klinika:</div>
                      <div className="card-user__info-item-value">
                        {u.clinic || "—"}
                      </div>
                    </div>

                    {/* 🔥 GROUPS BLOCK */}
                    <div className="card-user__info-item">
                      <div className="card-user__info-item-label">Skupiny:</div>
                      <div className="card-user__info-item-value">
                        {u.groups && u.groups.length > 0
                          ? u.groups.map((g) => g.name).join(", ")
                          : "—"}
                      </div>
                    </div>

                    <div className="card-user__info-item">
                      <div className="card-user__info-item-label">
                        Datum narození:
                      </div>
                      <div className="card-user__info-item-value">
                        {formatDate(u.birthDate) || "—"}
                      </div>
                    </div>
                  </div>

                  {user?.role === "admin" && (
                    <div className="admin-actions">
                      <Link
                        to={siteUrls.editContacts(u.id)}
                        className="btn btn-sm btn-green"
                      >
                        Upravit
                      </Link>

                      {u.id !== user.id && (
                        <button
                          className="btn btn-sm btn-red"
                          onClick={() => deleteUser(u.id)}
                        >
                          Smazat
                        </button>
                      )}

                      <button
                        className="btn btn-sm btn-yellow"
                        onClick={() => handleCopy(u)}
                      >
                        Zkopírovat
                      </button>
                    </div>
                  )}
                </Panel>
              </Col>
            );
          })}
        </Row>
      </Grid>

      <ButtonAdd link={siteUrls.addContacts} />
    </>
  );
}