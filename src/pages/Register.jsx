import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Register.css';

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

const UserIcon = () => (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
);

const MailIcon = () => (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M2 8l10 7 10-7"/>
    </svg>
);

const LockIcon = () => (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="11" width="14" height="10" rx="2"/>
        <path d="M8 11V7a4 4 0 018 0v4"/>
    </svg>
);

const ArrowRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
);

const PASSWORD_RULES = [
    { test: (p) => p.length >= 12, label: "12 caractères minimum" },
    { test: (p) => /[a-z]/.test(p), label: "Une minuscule" },
    { test: (p) => /[A-Z]/.test(p), label: "Une majuscule" },
    { test: (p) => /[0-9]/.test(p), label: "Un chiffre" },
];

const Register = () => {
    const navigate = useNavigate();

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [formData, setFormData] = useState({
        prenom: "",
        nom: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    });

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const failedRules = PASSWORD_RULES.filter(r => !r.test(formData.password));
        if (failedRules.length > 0) {
            setErrorMsg(failedRules.map(r => r.label).join(", "));
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Les mots de passe ne correspondent pas");
            return;
        }
        if (!formData.acceptTerms) {
            setErrorMsg("Vous devez accepter les conditions générales");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/utilisateurs/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    prenom_utilisateur: formData.prenom,
                    nom_utilisateur: formData.nom,
                    email_utilisateur: formData.email,
                    mdp_utilisateur: formData.password,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setErrorMsg(data.message || "Erreur lors de l'inscription");
                return;
            }
            navigate("/login");
        } catch (error) {
            console.error("Erreur lors de l'inscription:", error);
            setErrorMsg("Une erreur s'est produite lors de l'inscription");
        }
    };

    const password = formData.password;

    return (
        <main className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-logo">
                    <img src="taskflow-logo.png" alt="TaskFlow" />
                    <span className="auth-logo-name">TaskFlow</span>
                </div>

                <h1 className="auth-title">Créer un compte</h1>
                <p className="auth-subtitle">Commencez à organiser vos projets dès maintenant</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="prenom">Prénom</label>
                            <div className="input-wrapper">
                                <UserIcon />
                                <input type="text" id="prenom" placeholder="Jean" value={formData.prenom} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="nom">Nom</label>
                            <div className="input-wrapper">
                                <UserIcon />
                                <input type="text" id="nom" placeholder="Dupont" value={formData.nom} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <MailIcon />
                            <input type="email" id="email" placeholder="jean.dupont@example.com" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Mot de passe</label>
                        <div className="password-wrapper">
                            <LockIcon />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        {/* Indicateurs de règles en temps réel */}
                        {password && (
                            <div className="password-rules">
                                {PASSWORD_RULES.map((rule, i) => (
                                    <span key={i} className={`password-rule ${rule.test(password) ? "valid" : "invalid"}`}>
                                        {rule.test(password) ? "✓" : "✗"} {rule.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirmation du mot de passe</label>
                        <div className="password-wrapper">
                            <LockIcon />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="terms-group">
                        <input type="checkbox" id="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} required />
                        <span>
                            Veuillez accepter nos{" "}
                            <Link to="/mentions-legales#donnees">conditions générales d'utilisation</Link>
                        </span>
                    </div>

                    {errorMsg && <div className="error-message-box">{errorMsg}</div>}

                    <button type="submit" className="auth-submit">
                        Créer mon compte <ArrowRight />
                    </button>
                </form>

                <p className="register-link">
                    Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </main>
    );
};

export default Register;