import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Modif: On stocke l'objet utilisateur au lieu de juste stocker le token
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const login = (utilisateur) => {
        // Modif: Sauvegarde les infos utilisateur (id, nom, email...)
        // Le token est déjà dans le cookieHTTPOnly, donc pas besoin de le prendre manuellement dans localstorage
        localStorage.setItem("user", JSON.stringify(utilisateur));
        setUser(utilisateur);
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);