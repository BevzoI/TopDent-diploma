import { Button, List, Avatar, Stack, Text, Tag } from "rsuite";
import ArrowLeftLineIcon from "@rsuite/icons/ArrowLeftLine";
import { Link } from 'react-router-dom';
import { siteUrls } from '../../utils/siteUrls';

export default function CourseChoice() {
    // Тимчасові дані – заміниш API
    const participants = [
        { id: 1, name: "Vadim", joined: true, date: "12.12.2025 09:30", avatar: "https://i.pravatar.cc/150?u=1" },
        { id: 2, name: "Alona", joined: false, date: "12.12.2025 10:15", avatar: "https://i.pravatar.cc/150?u=2" },
        { id: 3, name: "Admin", joined: true, date: "12.12.2025 11:00", avatar: "https://i.pravatar.cc/150?u=3" },
    ];

    return (
        <>
            <Button as={Link} to={siteUrls.courses} className="header-prev mb-20" startIcon={<ArrowLeftLineIcon />} appearance="subtle">Vrátit se zpět</Button>
            <h2 className="page-title">Účastníci kurzu</h2>

            <List bordered hover>
                {participants.map((p) => (
                    <List.Item key={p.id}>
                        <Stack spacing={15}>
                            
                            <Avatar circle src={p.avatar} />

                            <Stack.Item grow={1}>
                                <Text style={{ fontWeight: 600 }}>{p.name}</Text>
                                <Text size="xs" muted>
                                    {p.date}
                                </Text>
                            </Stack.Item>

                            {/* Статус участі */}
                            {p.joined ? (
                                <Tag color="green">Účast</Tag>
                            ) : (
                                <Tag color="red">Neúčast</Tag>
                            )}
                        </Stack>
                    </List.Item>
                ))}
            </List>
        </>
    );
}
