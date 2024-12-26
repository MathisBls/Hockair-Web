import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../../LanguageContext";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import "./MessageFriend.css";

const MessageFriend = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [selectedContact, setSelectedContact] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);

    const messageEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setCurrentUserId(data._id);
                } else {
                    console.error("Failed to fetch user profile");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/friends/list`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setContacts(data);

                    const contactFromUrl = data.find(contact => contact._id === id);
                    if (contactFromUrl) {
                        setSelectedContact(contactFromUrl);
                    }
                } else {
                    console.error("Failed to fetch contacts");
                }
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };

        fetchContacts();
    }, [id]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedContact) return;

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/messages/${selectedContact._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                } else {
                    console.error("Failed to fetch messages");
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [selectedContact]);

    const handleContactClick = (contact) => {
        if (contact._id !== selectedContact?._id) {
            setSelectedContact(contact);
            setMessages([]);
            navigate(`/friends/chat/${contact._id}`);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/messages`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        receiverId: selectedContact._id,
                        content: newMessage,
                    }),
                }
            );

            if (response.ok) {
                const message = await response.json();
                setMessages((prevMessages) => [...prevMessages, message]);
                setNewMessage("");
                scrollToBottom();
            } else {
                console.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleContextMenu = (e, messageId) => {
        e.preventDefault();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let x = e.pageX;
        let y = e.pageY;

        const contextMenuWidth = 150;
        const contextMenuHeight = 50;

        if (x + contextMenuWidth > windowWidth) {
            x = windowWidth - contextMenuWidth - 10;
        }

        if (y + contextMenuHeight > windowHeight) {
            y = windowHeight - contextMenuHeight - 10;
        }

        setContextMenu({ x, y, messageId });
    };

    const closeContextMenu = () => setContextMenu(null);

    const deleteMessage = async (messageId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/messages/${messageId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.ok) {
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg._id !== messageId)
                );
                closeContextMenu();
            } else {
                console.error("Failed to delete message");
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    return (
        <div className="message-container" onClick={closeContextMenu}>
            <div className="contacts-panel">
                <ul className="contacts-list">
                    {contacts.map((contact) => (
                        <li
                            key={contact._id}
                            className={`contact-item ${
                                selectedContact && selectedContact._id === contact._id ? "active" : ""
                            }`}
                            onClick={() => handleContactClick(contact)}
                        >
                            <img
                                src={
                                    contact.profilePicture ||
                                    `${import.meta.env.VITE_BACKEND_URL}/default-avatar.png`
                                }
                                alt={contact.username}
                                className="contact-profile-picture"
                            />
                            <span className="contact-name">{contact.username}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-section">
                <div className="message-header">
                {selectedContact ? `${translations.page.messageUser.chatWith} ${selectedContact.username}` : translations.page.messageUser.selectContact}
                </div>

                <div className="message-body">
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`message-bubble ${
                                msg.senderId === currentUserId ? "sent" : "received"
                            }`}
                            onContextMenu={(e) => handleContextMenu(e, msg._id)}
                        >
                            <p>{msg.content}</p>
                            {msg.senderId === currentUserId && msg.read && (
                                <CheckCircle className="message-read-icon" />
                            )}
                        </div>
                    ))}
                    <div ref={messageEndRef}></div>
                </div>

                {selectedContact && (
                    <div className="message-input-container">
                        <input
                            type="text"
                            className="message-input"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            placeholder={translations.page.messageUser.typeMessage}
                        />
                        <button className="send-button" onClick={sendMessage}>
                            {translations.page.messageUser.sendMessage}
                        </button>
                    </div>
                )}
            </div>

            {contextMenu && (
                <div
                    className="custom-context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    {messages.find((msg) => msg._id === contextMenu.messageId)?.senderId === currentUserId && (
                        <button onClick={() => deleteMessage(contextMenu.messageId)}>
                            {translations.page.messageUser.deleteMessage}
                        </button>
                    )}
                    <button onClick={closeContextMenu}>{translations.page.messageUser.cancel}</button>
                </div>
            )}
        </div>
    );
};

export default MessageFriend;
