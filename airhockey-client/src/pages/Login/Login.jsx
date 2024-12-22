import React, { useState } from "react";
import HeaderLogin from "../../components/HeaderLogin/HeaderLogin";
import { useLanguage } from "../../../LanguageContext";
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        // Stocker le token JWT dans le localStorage
        localStorage.setItem("token", data.token);

        navigate("/");
      } else {
        setError(data.message || translations.errors.genericError);
      }
    } catch (err) {
      setError(translations.errors.serverError);
    }
  };

  return (
    <div className="login-container">
      <HeaderLogin />
      <div className="login-content">
        <div className="login-card">
          <h1>{translations.page.login.title}</h1>
          <p>{translations.page.login.description}</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{translations.page.login.email}</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={translations.page.login.placeholder.email}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{translations.page.login.password}</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={translations.page.login.placeholder.password}
              />
            </div>
            <button type="submit" className="btn-login">
              {translations.page.login.button}
            </button>
          </form>
          <div className="login-footer">
            <p>
              {translations.page.login.dontHaveAccount}{" "}
              <a href="/register">{translations.page.login.signupRedirect}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
