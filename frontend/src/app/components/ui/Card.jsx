import { useAuthContext } from "../../context/AuthContext";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { formatDate } from '../../utils/utils';

export default function Card({ data }) {
  const { user: currentUser } = useAuthContext();

  const handleStatus = async (status) => {
    await apiRequest(`${apiUrl.weekend}/${data._id}/status`, "PATCH", { status });
    window.location.reload(); // або emit → loadItems()
  };

  const statusClass =
    data.status === "approved"
      ? "btn-green"
      : data.status === "rejected"
      ? "btn-red"
      : "btn-yellow";

  const statusLabel =
    data.status === "approved"
      ? "Schváleno"
      : data.status === "rejected"
      ? "Zamítnuto"
      : "Čeká na potvrzení";

  return (
    <div className="card mb-20">
      <div className="card__header d-flex flex-between flex-items-center gap-4 mb-8">
        <div className="card__header-left">
          <div className="card__header-user">
            Od: {data.userId.name || "Uživatel"}
          </div>

          <div className="card__header-date">
            {formatDate(data.createdAt)}
          </div>
        </div>

        <div className="card__header-right">
          <button className={`btn btn-sm ${statusClass} card__header-btn`}>
            {statusLabel}
          </button>
        </div>
      </div>

      <div className="card__body d-flex flex-between flex-items-start gap-4">
        <div className="card__body-left">
          <div className="card__body-item">
            <p className="card__body-item-label">V termínu:</p>
            <p className="card__body-item-value">
              {formatDate(data.dateFrom)} – {formatDate(data.dateTo)}
            </p>
          </div>

          <div className="card__body-item">
            <p className="card__body-item-label">Z důvodu:</p>
            <p className="card__body-item-value">{data.reason}</p>
          </div>

          {data.note && (
            <div className="card__body-item">
              <p className="card__body-item-label">Poznámka:</p>
              <p className="card__body-item-value">{data.note}</p>
            </div>
          )}
        </div>

        {currentUser?.role === "admin" && (
          <div className="card__body-right d-flex flex-column flex-align-start gap-8">
            <button
              className="btn btn-sm btn-green card__body-btn"
              onClick={() => handleStatus("approved")}
            >
              Potvrdit
            </button>

            <button
              className="btn btn-sm btn-red card__body-btn"
              onClick={() => handleStatus("rejected")}
            >
              Odmítnout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
