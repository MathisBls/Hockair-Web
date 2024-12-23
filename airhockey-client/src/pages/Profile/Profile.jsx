import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../LanguageContext";
import "./Profile.css";

const Profile = () => {
    const { translations } = useLanguage();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || ""); // État pour la photo de profil

    useEffect(() => {
        // Fetch user data
        const fetchUser = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await response.json();
                setUser(data);
                setFormData({
                    username: data.username || "",
                    email: data.email || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur :", error);
            }
        };

        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
      
          try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/upload-profile-picture`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: formData,
            });
      
            if (response.ok) {
              const data = await response.json();
              setProfilePicture(`${import.meta.env.VITE_BACKEND_URL}${data.user.profilePicture}`); // Mettre à jour la prévisualisation
              setSuccessMessage(translations.page.profile.info.pictureUpdated); // Message de succès
            } else {
              const error = await response.json();
              alert(error.message || translations.page.profile.info.uploadError);
            }
          } catch (error) {
            console.error('Erreur lors de l’upload de l’image :', error);
          }
        }
      };      

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) newErrors.username = translations.page.profile.errors.usernameRequired;
        if (!formData.email.includes("@")) newErrors.email = translations.page.profile.errors.invalidEmail;

        if (formData.newPassword) {
            if (formData.newPassword.length < 6)
                newErrors.newPassword = translations.page.profile.errors.passwordTooShort;
            if (formData.newPassword !== formData.confirmNewPassword)
                newErrors.confirmNewPassword = translations.page.profile.errors.passwordMismatch;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setSuccessMessage(translations.page.profile.updateSuccess);
            } else {
                const error = await response.json();
                alert(error.message || translations.page.profile.updateError);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
        }
    };

    return (
        <div className="profile-user-container">
            <h1 className="profile-user-title">{translations.page.profile.title}</h1>
            <div className="profile-user-content">
                <div className="profile-user-info">
                    <h2>{translations.page.profile.info.title}</h2>
                    <p>
                        <strong>{translations.page.profile.info.elo}:</strong> {user?.elo}
                    </p>
                    <p>
                        <strong>{translations.page.profile.info.level}:</strong> {user?.level}
                    </p>
                    <p>
                        <strong>{translations.page.profile.info.victories}:</strong> {user?.victories}
                    </p>
                    <p>
                        <strong>{translations.page.profile.info.defeats}:</strong> {user?.defeats}
                    </p>
                    <div
                        className="profile-user-picture-frame"
                        onClick={() => document.getElementById("file-input").click()}
                    >
                        {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="profile-user-picture" />
                        ) : (
                            <p className="profile-user-placeholder">{translations.page.profile.info.picturePlaceholder}</p>
                        )}
                    </div>

                    <input
                        type="file"
                        id="file-input"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>
            </div>

            <div className="profile-user-edit">
                <h2>{translations.page.profile.edit.title}</h2>

                {successMessage && <p className="profile-user-success-message">{successMessage}</p>}

                <div className="profile-user-form-group">
                    <label>{translations.page.profile.edit.username}</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                    />
                    {errors.username && <p className="profile-user-error-message">{errors.username}</p>}
                </div>

                <div className="profile-user-form-group">
                    <label>{translations.page.profile.edit.email}</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                    {errors.email && <p className="profile-user-error-message">{errors.email}</p>}
                </div>

                <div className="profile-user-form-group">
                    <label>{translations.page.profile.edit.currentPassword}</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="profile-user-form-group">
                    <label>{translations.page.profile.edit.newPassword}</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                    />
                    {errors.newPassword && <p className="profile-user-error-message">{errors.newPassword}</p>}
                </div>

                <div className="profile-user-form-group">
                    <label>{translations.page.profile.edit.confirmNewPassword}</label>
                    <input
                        type="password"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleInputChange}
                    />
                    {errors.confirmNewPassword && (
                        <p className="profile-user-error-message">{errors.confirmNewPassword}</p>
                    )}
                </div>

                <button className="profile-user-save-button" onClick={handleSave}>
                    {translations.page.profile.edit.saveButton}
                </button>
            </div>
        </div>
    );
};

export default Profile;
