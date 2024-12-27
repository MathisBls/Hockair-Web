import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Discussion.css";

const Discussion = () => {
  const [discussions, setDiscussions] = useState([]);
  const [, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user ID
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
          console.error("Failed to fetch user profile.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Fetch discussions
    const fetchDiscussions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/messages/latest`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setDiscussions(data);
        } else {
          console.error("Failed to fetch discussions.");
        }
      } catch (error) {
        console.error("Error fetching discussions:", error);
      }
    };

    fetchDiscussions();
  }, []);

  const handleDiscussionClick = (contactId) => {
    navigate(`/friends/chat/${contactId}`);
  };
  const conversations = [
    {
      id: 1,
      friendName: "Alice",
      lastMessage: "On se fait une partie ce soir ?",
      profilePic: "https://example.com/alice.jpg",
      unreadCount: 2,
    },
    {
      id: 2,
      friendName: "Bob",
      lastMessage: "Bien joué pour ta victoire !",
      profilePic: "https://example.com/bob.jpg",
      unreadCount: 0,
    },
    {
      id: 3,
      friendName: "Charlie",
      lastMessage: "J'ai trouvé une nouvelle stratégie",
      profilePic: "https://example.com/charlie.jpg",
      unreadCount: 5,
    },
    {
      id: 4,
      friendName: "Diana",
      lastMessage: "Merci pour les conseils",
      profilePic: "https://example.com/diana.jpg",
      unreadCount: 0,
    },
  ];
  return (
    <div className="discussion-container">
      <h1 className="discussion-title">Récentes conversations</h1>
      <div className="conversation-list">
        {conversations.map((conv) => (
          <div key={conv.id} className="conversation-item">
            <img src={conv.profilePic} alt={conv.friendName} className="friend-avatar" />
            <div className="conversation-info">
              <h2 className="friend-name">{conv.friendName}</h2>
              <p className="last-message">{conv.lastMessage}</p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="unread-count">{conv.unreadCount}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discussion;
