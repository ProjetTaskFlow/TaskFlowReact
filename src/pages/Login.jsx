import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext"
import logo from '../assets/taskflow-logo.png';
import "../styles/Login.css";

function Login() {
  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault(); // Pour empêcher le rechargement de la page
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/utilisateurs/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: password }),
        credentials: "include", //Nécessaire pour les cookies de session
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Email ou mot de passe incorrect");
        return;
      }

      // Connexion réussie donc appel login() du AuthContext avec token reçu de l'API
      if (res.ok) {
        login(data.utilisateur);
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Erreur de connexion", error);
      setError("Impossible de contacter le serveur. Réessayez plus tard.")
    } finally {
      setLoading(false);
    }
  };

  // Rendu
  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo & Titre */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#00BFFF" fillOpacity="0.12"/>
              <path d="M18 6L30 13V23L18 30L6 23V13L18 6Z"
                    stroke="#00BFFF" strokeWidth="2" fill="none"/>
              <path d="M18 12L24 15.5V22.5L18 26L12 22.5V15.5L18 12Z"
                    fill="#00BFFF" fillOpacity="0.3"/>
            </svg>
          </div>
          <span className="login-brand-name">TaskFlow</span>
        </div>

        <h1 className="login-title">Bienvenue</h1>
        <p className="login-subtitle">Connectez-vous à votre compte TaskFlow</p>

        {/* Message d'erreur - affiché uniquement si error n'est pas vide */}
        {error && (
            <div className="login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>

          {/* Champ Email */}
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" width="16" height="16"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
              <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean.dupont@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="login-field">
            <div className="login-field-header">
              <label htmlFor="password">Mot de passe</label>
              <button type="button" className="login-forgot"
                      onClick={() => navigate("/mot-de-passe-oublie")}>
                Mot de passe oublié ?
              </button>
            </div>
            <div className="login-input-wrap">
              <svg className="login-input-icon" width="16" height="16"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
              />
              <button type="button" className="login-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Masquer" : "Afficher"}>
                {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                )}
              </button>
            </div>
          </div>

          {/* Bouton Se connecter */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
                <span className="login-btn-spinner" />
            ) : (
                <>
                  Se connecter
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
            )}
          </button>
        </form>

        {/* Lien inscription */}
        <p className="login-register">
          Pas encore de compte ?{" "}
          <button type="button" className="login-register-link"
            onClick={() => navigate("/register")}>
            Créer un compte
          </button>
        </p>

      </div>
    </div>
  );
}
export default Login;