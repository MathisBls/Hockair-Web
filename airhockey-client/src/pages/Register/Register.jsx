import React, { useState } from "react";
import HeaderLogin from "../../components/HeaderLogin/HeaderLogin";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../LanguageContext";

import './Register.css';

const Register = () => {
  const { translations } = useLanguage();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError(translations.errors.passwordsDoNotMatch);
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      setError(translations.errors.weakPassword);
      return;
    }

    try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
    });

      const data = await response.json();
      if (response.ok) {
        setSuccess(translations.success.registerSuccess);
        navigate("/language");
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
      } else {
        setError(data.message || translations.errors.genericError);
      }
    } catch (err) {
      setError(translations.errors.serverError);
    }
  };

  return (
    <div className="register-container">
      <HeaderLogin />
      <div className="register-content">
        <div className="register-card">
          <h1>{translations.page.register.title}</h1>
          <p>{translations.page.register.description}</p>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group-register">
              <label htmlFor="username">{translations.page.register.username}</label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={translations.page.register.placeholder.username}
              />
            </div>
            <div className="form-group-register">
              <label htmlFor="email">{translations.page.register.email}</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={translations.page.register.placeholder.email}
              />
            </div>
            <div className="form-group-register">
              <label htmlFor="password">{translations.page.register.password}</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={translations.page.register.placeholder.password}
              />
            </div>
            <div className="form-group-register">
              <label htmlFor="confirmPassword">{translations.page.register.confirmPassword}</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder={translations.page.register.placeholder.confirmPassword}
              />
            </div>
            <button type="submit" className="btn-register">{translations.page.register.button}</button>
          </form>
          <div className="register-footer">
            <p>
              {translations.page.register.alreadyHaveAccount}{" "}
              <a href="/login">{translations.page.register.loginRedirect}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
