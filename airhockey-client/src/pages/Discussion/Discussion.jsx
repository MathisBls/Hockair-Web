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

  return (
    <div className="discussion-container">
      <h1 className="discussion-title">Discussions</h1>
      <ul className="discussion-list">
        {discussions.map((discussion) => {
          const userDetails = discussion.userDetails || {};
          const lastMessage = discussion.lastMessage?.content || "No messages yet.";
          const unreadMessages = discussion.lastMessage?.read === false ? 1 : 0;

          return (
            <li
              key={discussion.contactId}
              className="discussion-item"
              onClick={() => handleDiscussionClick(discussion.contactId)}
            >
              <img
                src={
                  userDetails.profilePicture ||
                  `${import.meta.env.VITE_BACKEND_URL}/default-avatar.png`
                }
                alt={userDetails.username || "User"}
                className="discussion-avatar"
              />
              <div className="discussion-info">
                <p className="discussion-username">
                  {userDetails.username || "Unknown User"}
                </p>
                <p className="discussion-last-message">
                  {lastMessage.length > 30
                    ? `${lastMessage.slice(0, 30)}...`
                    : lastMessage}
                </p>
              </div>
              {unreadMessages > 0 && (
                <span className="discussion-unread-badge">{unreadMessages}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Discussion;
