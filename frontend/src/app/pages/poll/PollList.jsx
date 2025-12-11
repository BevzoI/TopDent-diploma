import { useEffect, useState } from "react";
import { Card, Button, Heading, Text } from "rsuite";
import { Link } from "react-router-dom";

import { siteUrls } from "../../utils/siteUrls";
import { apiRequest, apiUrl } from "../../utils/apiData";
import { ButtonAdd, PageHeader } from "../../components/ui";
import { useAuthContext } from "../../context/AuthContext";
import AnswerButtons from '../../components/AnswerButtons';

export default function PollList() {
    const { user } = useAuthContext();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load all polls
    useEffect(() => {
        const loadPolls = async () => {
            const res = await apiRequest(apiUrl.poll, "GET");

            if (res?.status === "success") {
                setPolls(res.data);
            }

            setLoading(false);
        };

        loadPolls();
    }, []);

    async function deletePoll(id) {
        const confirmDelete = window.confirm("Opravdu chcete smazat tento dotazník?");
        if (!confirmDelete) return;

        const res = await apiRequest(`${apiUrl.poll}/${id}`, "DELETE");

        if (res?.status === "success") {
            // Одразу оновлюємо список, без reload
            setPolls((prev) => prev.filter((p) => p._id !== id));
        } else {
            alert("Nepodařilo se smazat dotazník.");
        }
    }

    return (
        <>
            <PageHeader title="Dotazníky" backTo={siteUrls.home} headingLevel={2} />

            {loading && <p>Načítám...</p>}

            {!loading && polls.length === 0 && <p>Žádné dotazníky nejsou k dispozici.</p>}

            <div className="card-list">
                {!loading &&
                    polls.map((poll) => (
                        <Card key={poll._id} shaded className="mb-20">
                            <Card.Header>
                                <Heading level={5} size="md" bold>
                                    <Link to={siteUrls.pollAnswers(poll._id)}>{poll.title}</Link>
                                </Heading>
                            </Card.Header>

                            <Card.Body>
                                <Text>{poll.description}</Text>
                            </Card.Body>

                            <Card.Footer>
                            <AnswerButtons
                                type="poll"
                                itemId={poll._id}
                                initialAnswers={poll.answers}
                                yesLabel="Ano"
                                noLabel="Ne"
                                />

                            </Card.Footer>
                            {user?.role === "admin" && (
                                <div className="admin-actions" style={{ padding: "0px 18px 24px" }}>
                                    <Link to={siteUrls.editPoll(poll._id)} className="btn btn-sm btn-green">
                                        Upravit
                                    </Link>

                                    <button className="btn btn-sm btn-red" onClick={() => deletePoll(poll._id)}>
                                        Smazat
                                    </button>

                                    <p className={`admin-status ${poll.publish === "show" ? "admin-status-published" : "admin-status-hidden"}`}>{poll.publish === "show" ? "Zobrazeno" : "Skryto"}</p>
                                </div>
                            )}
                        </Card>
                    ))}
            </div>

            <ButtonAdd link={siteUrls.addPoll} />
        </>
    );
}
