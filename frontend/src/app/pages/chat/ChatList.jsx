import { Link } from 'react-router-dom';
import { ButtonAdd } from '../../components/ui';
import { IconButton, Panel, FlexboxGrid } from "rsuite";
import { siteUrls } from '../../utils/siteUrls';
import { useAuthContext } from '../../context/AuthContext';

export default function ChatList() {
    const { user } = useAuthContext();

    const chats = [
        { id: 1, title: "Питання по React", createdBy: "Vadim", publish: "show" },
        { id: 3, title: "Обговорення API", createdBy: "Admin", publish: "show" },
    ];

    const handleOpenChat = (id) => {
        console.log("open chat", id);
    };

    return (
        <>
            <h2 className='page-title'>Seznam chatů</h2>

            <FlexboxGrid justify="start" align="top" gutter={20}>
                {chats.map((chat) => (
                    <FlexboxGrid.Item
                        key={chat.id}
                        colspan={24}
                        sm={12}
                        md={8}
                        lg={6}
                    >
                        <Panel bordered shaded className="chat-card">
                            <Link
                                to={siteUrls.viewChat(chat.id)}
                                onClick={() => handleOpenChat(chat.id)}
                                className="chat-title"
                            >
                                {chat.title}
                            </Link>

                            <div className="chat__meta">
                                <div className="chat__meta-item">
                                    <div className="chat__meta-item-label">Datum:</div>
                                    <div className="chat__meta-item-value">12.12.2025</div>
                                </div>
                                <div className="chat__meta-item">
                                    <div className="chat__meta-item-label">Vytvořil:</div>
                                    <div className="chat__meta-item-value">{chat.createdBy}</div>
                                </div>
                            </div>

                            {user?.role === "admin" && (
                                <div className='admin-actions'>
                                    <Link to={siteUrls.editChat(chat.id)} className='btn btn-sm btn-green'>
                                        Upravit
                                    </Link>

                                    <button className='btn btn-sm btn-red'>
                                        Smazat
                                    </button>
                                    <p className={`admin-status ${chat.publish === "show" ? "admin-status-published" : "admin-status-hidden"}`}>
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
