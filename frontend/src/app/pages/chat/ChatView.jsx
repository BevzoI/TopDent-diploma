import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heading, HeadingGroup,List, HStack, Text, Avatar, Button, Stack, Input, InputGroup } from "rsuite";
import { siteUrls } from "../../utils/siteUrls";
import SendIcon from "@rsuite/icons/Send";
import ArrowLeftLineIcon from "@rsuite/icons/ArrowLeftLine";

export default function ChatView() {
    const { chatId } = useParams();

    const [message, setMessage] = useState("");

    // Тимчасові дані
    const messages = [
        {
            id: 1,
            sender: "Alice",
            content: "Hey, are we still meeting tomorrow?",
            time: "2024-12-05 10:15",
            avatar: "https://i.pravatar.cc/150?u=1",
        },
        {
            id: 2,
            sender: "Bob",
            content: "Yes, let’s meet at 3 PM.",
            time: "2024-12-05 10:18",
            avatar: "https://i.pravatar.cc/150?u=2",
        },
        {
            id: 3,
            sender: "Charlie",
            content: "Can you send me the report?",
            time: "2024-12-05 11:00",
            avatar: "https://i.pravatar.cc/150?u=3",
        },
        {
            id: 4,
            sender: "David",
            content: "I will, no worries.",
            time: "2024-12-05 11:05",
            avatar: "https://i.pravatar.cc/150?u=4",
        },
        {
            id: 1,
            sender: "Alice",
            content: "Hey, are we still meeting tomorrow?",
            time: "2024-12-05 10:15",
            avatar: "https://i.pravatar.cc/150?u=1",
        },
        {
            id: 2,
            sender: "Bob",
            content: "Yes, let’s meet at 3 PM.",
            time: "2024-12-05 10:18",
            avatar: "https://i.pravatar.cc/150?u=2",
        },
        {
            id: 3,
            sender: "Charlie",
            content: "Can you send me the report?",
            time: "2024-12-05 11:00",
            avatar: "https://i.pravatar.cc/150?u=3",
        },
        {
            id: 4,
            sender: "David",
            content: "I will, no worries.",
            time: "2024-12-05 11:05",
            avatar: "https://i.pravatar.cc/150?u=4",
        },
        {
            id: 1,
            sender: "Alice",
            content: "Hey, are we still meeting tomorrow?",
            time: "2024-12-05 10:15",
            avatar: "https://i.pravatar.cc/150?u=1",
        },
        {
            id: 2,
            sender: "Bob",
            content: "Yes, let’s meet at 3 PM.",
            time: "2024-12-05 10:18",
            avatar: "https://i.pravatar.cc/150?u=2",
        },
        {
            id: 3,
            sender: "Charlie",
            content: "Can you send me the report?",
            time: "2024-12-05 11:00",
            avatar: "https://i.pravatar.cc/150?u=3",
        },
        {
            id: 4,
            sender: "David",
            content: "I will, no worries.",
            time: "2024-12-05 11:05",
            avatar: "https://i.pravatar.cc/150?u=4",
        },
        {
            id: 1,
            sender: "Alice",
            content: "Hey, are we still meeting tomorrow?",
            time: "2024-12-05 10:15",
            avatar: "https://i.pravatar.cc/150?u=1",
        },
        {
            id: 2,
            sender: "Bob",
            content: "Yes, let’s meet at 3 PM.",
            time: "2024-12-05 10:18",
            avatar: "https://i.pravatar.cc/150?u=2",
        },
        {
            id: 3,
            sender: "Charlie",
            content: "Can you send me the report?",
            time: "2024-12-05 11:00",
            avatar: "https://i.pravatar.cc/150?u=3",
        },
        {
            id: 4,
            sender: "David",
            content: "I will, no worries.",
            time: "2024-12-05 11:05",
            avatar: "https://i.pravatar.cc/150?u=4",
        },
    ];

    const sendMessage = () => {
        console.log("send:", message);
        setMessage("");
    };

    return (
        <div className="chat-container">
            <HeadingGroup className="chat-header">
                <Button as={Link} to={siteUrls.chat} className="header-prev" startIcon={<ArrowLeftLineIcon />} appearance="subtle">Vrátit se zpět</Button>
                <Heading level={5}>ACME Corporation</Heading>
                {/* <Text muted size="sm">Vytvořil: Admin, 12.12.2025</Text> */}
            </HeadingGroup>

            <List>
                {messages.map((message) => (
                    <List.Item key={message.id} className="chat-item">
                        <HStack spacing={15} alignItems="center">
                            <Avatar src={message.avatar} alt={message.sender} circle />
                            <HStack.Item flex={1}>
                                <HStack className="chat-item__header">
                                    <Text className="chat-item__user">{message.sender}</Text>
                                    <Text className="chat-item__date" size="sm">
                                        {message.time}
                                    </Text>
                                </HStack>
                                <Text className="chat-item__message">{message.content}</Text>
                            </HStack.Item>
                        </HStack>
                    </List.Item>
                ))}
            </List>

            {/* Форма відправлення */}
            <div className="chat-form-send">
                <InputGroup inside size="lg">
                    <Input placeholder="Napište zprávu..." value={message} onChange={setMessage} />
                    <InputGroup.Button onClick={sendMessage}>
                        <SendIcon />
                    </InputGroup.Button>
                </InputGroup>
            </div>
        </div>
    );
}
