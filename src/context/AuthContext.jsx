import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true); // true pendant la vérification initiale

    const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

    // Au chargement de l'app, on appelle /me pour vérifier
    // si l'utilisateur a un cookie valide
    // credentials: "include" envoie automatiquement le cookie HTTPOnly
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API}/api/utilisateurs/me`, {
                    credentials: "include", // ← envoie le cookie automatiquement
                });

                if (res.ok) {
                    const data = await res.json();
                    // Stocke les infos utilisateur dans le contexte
                    setUser(data.utilisateur);
                } else {
                    // Cookie expiré ou invalide
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (utilisateur) => {
        // Plus besoin de gérer le token — il est dans le cookie
        // On stocke juste les infos utilisateur dans le contexte
        setUser(utilisateur);
    };

    const logout = async () => {
        // Appelle l'API pour effacer le cookie côté serveur
        await fetch(`${API}/api/utilisateurs/logout`, {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);