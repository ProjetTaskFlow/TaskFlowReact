import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const userInfo = localStorage.getItem("userInfo");
        return token ? { token, ...JSON.parse(userInfo || "{}") } : null;
    });

    const login = (token, userInfo) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        setUser({ token, ...userInfo });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);