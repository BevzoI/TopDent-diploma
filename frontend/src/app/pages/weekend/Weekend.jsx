import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card, PageHeader } from '../../components/ui';
import { apiRequest, apiUrl } from "../../utils/apiData";
import { siteUrls } from '../../utils/siteUrls';
import { useAuthContext } from "../../context/AuthContext";

export default function Weekend() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, clearNotification } = useAuthContext();

  useEffect(() => {
    if (user?.notifications?.weekend) {
      clearNotification("weekend");
    }
  }, [user?.notifications?.weekend]);   

  useEffect(() => {
    loadItems();
  }, [user?.notifications?.weekend]);

  const loadItems = async () => {
    setLoading(true);
    const res = await apiRequest(apiUrl.weekend);

    if (res?.status === "success") {
      setItems(res.data);
    }

    setLoading(false);
  };

  return (
    <>
      <PageHeader
        title="Omluvenky"
        backTo={siteUrls.home}
        headingLevel={2}
      />

      <div className="card-list">
        {loading && <p>Načítám...</p>}

        {!loading && items.length === 0 && (
          <p>Žádné omluvenky.</p>
        )}

        {!loading && items.map((item) => (
          <Card key={item._id} data={item} reload={loadItems} />
        ))}

      </div>

      <Link to={siteUrls.addWeekend} className="btn fixed-action">
        Nová omluvenka
      </Link>
    </>
  );
}

