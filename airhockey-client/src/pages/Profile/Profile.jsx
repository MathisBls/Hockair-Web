import React, { useState, useEffect } from 'react';

import { useLanguage } from '../../../LanguageContext';
import Toast from '../../components/Toast/Toast';
import './Profile.css';

const Profile = () => {
  const { translations } = useLanguage();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || ''
  ); // État pour la photo de profil

  const [toast, setToast] = useState({ visible: false, message: '', type: '' }); // État pour gérer les toasts

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await response.json();
        setUser(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des données utilisateur :',
          error
        );
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
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/upload-profile-picture`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfilePicture(
            `${import.meta.env.VITE_BACKEND_URL}${data.user.profilePicture}`
          ); // Mettre à jour la prévisualisation
          setSuccessMessage(translations.page.profile.info.pictureUpdated); // Message de succès
          setToast({
            visible: true,
            message: translations.page.profile.info.pictureUpdated,
            type: 'success',
          }); // Afficher le toast
        } else {
          const error = await response.json();
          setToast({
            visible: true,
            message:
              error.message || translations.page.profile.info.uploadError,
            type: 'error',
          }); // Afficher le toast d'erreur
        }
      } catch (error) {
        console.error('Erreur lors de l’upload de l’image :', error);
        setToast({
          visible: true,
          message: translations.page.profile.info.uploadError,
          type: 'error',
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim())
      newErrors.username = translations.page.profile.errors.usernameRequired;
    if (!formData.email.includes('@'))
      newErrors.email = translations.page.profile.errors.invalidEmail;

    if (formData.newPassword) {
      if (formData.newPassword.length < 6)
        newErrors.newPassword =
          translations.page.profile.errors.passwordTooShort;
      if (formData.newPassword !== formData.confirmNewPassword)
        newErrors.confirmNewPassword =
          translations.page.profile.errors.passwordMismatch;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setSuccessMessage(translations.page.profile.updateSuccess);
        setToast({
          visible: true,
          message: translations.page.profile.updateSuccess,
          type: 'success',
        }); // Afficher le toast de succès
      } else {
        const error = await response.json();
        setToast({
          visible: true,
          message: error.message || translations.page.profile.updateError,
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      setToast({
        visible: true,
        message: translations.page.profile.updateError,
        type: 'error',
      });
    }
  };

  return (
    <div className='profile-container'>
      <div className='profile-header'>
        <div className='profile-picture-container'>
          <div
            className='profile-picture-frame'
            onClick={() => document.getElementById('file-input').click()}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt='Profile'
                className='profile-picture'
              />
            ) : (
              <div className='profile-picture-placeholder'>
                <i className='fas fa-user'></i>
              </div>
            )}
          </div>
          <input
            type='file'
            id='file-input'
            accept='image/*'
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <h1 className='profile-username'>{user?.username}</h1>
      </div>

      <div className='profile-content'>
        <div className='profile-stats'>
          <h2>{translations.page.profile.info.title}</h2>
          <div className='stats-grid'>
            <div className='stat-item'>
              <span className='stat-label'>
                {translations.page.profile.info.elo}
              </span>
              <span className='stat-value'>{user?.elo}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>
                {translations.page.profile.info.level}
              </span>
              <span className='stat-value'>{user?.level}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>
                {translations.page.profile.info.victories}
              </span>
              <span className='stat-value'>{user?.victories}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>
                {translations.page.profile.info.defeats}
              </span>
              <span className='stat-value'>{user?.defeats}</span>
            </div>
          </div>
        </div>

        <div className='profile-edit'>
          <h2>{translations.page.profile.edit.title}</h2>
          {successMessage && (
            <p className='success-message'>{successMessage}</p>
          )}
          <form onSubmit={handleSave}>
            <div className='form-group'>
              <label htmlFor='username'>
                {translations.page.profile.edit.username}
              </label>
              <input
                type='text'
                id='username'
                name='username'
                value={formData.username}
                onChange={handleInputChange}
              />
              {errors.username && (
                <p className='error-message'>{errors.username}</p>
              )}
            </div>
            <div className='form-group'>
              <label htmlFor='email'>
                {translations.page.profile.edit.email}
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <p className='error-message'>{errors.email}</p>}
            </div>
            <div className='form-group'>
              <label htmlFor='currentPassword'>
                {translations.page.profile.edit.currentPassword}
              </label>
              <input
                type='password'
                id='currentPassword'
                name='currentPassword'
                value={formData.currentPassword}
                onChange={handleInputChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='newPassword'>
                {translations.page.profile.edit.newPassword}
              </label>
              <input
                type='password'
                id='newPassword'
                name='newPassword'
                value={formData.newPassword}
                onChange={handleInputChange}
              />
              {errors.newPassword && (
                <p className='error-message'>{errors.newPassword}</p>
              )}
            </div>
            <div className='form-group'>
              <label htmlFor='confirmNewPassword'>
                {translations.page.profile.edit.confirmNewPassword}
              </label>
              <input
                type='password'
                id='confirmNewPassword'
                name='confirmNewPassword'
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
              />
              {errors.confirmNewPassword && (
                <p className='error-message'>{errors.confirmNewPassword}</p>
              )}
            </div>
            <button type='submit' className='save-button'>
              {translations.page.profile.edit.saveButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
