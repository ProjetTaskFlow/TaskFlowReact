import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Settings() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="sidebar">
        <h2>TaskFlow</h2>

        <button className="menu" onClick={() => navigate("/dashboard")}>
          𝄜 Dashboard
        </button>

        <button className="menu" onClick={() => navigate("/projects")}>
          🗁 Projets
        </button>

        <button className="menu active">🛠 Paramètres</button>

        <button className="menu-logout" onClick={() => navigate("/login")}>
          Déconnexion ➜]
        </button>
      </div>

      <div className="content">
        <div className="main">
          <h1 style={{ marginTop: 0 }}>Paramètres</h1>
          <p style={{ color: "#6b7280" }}>Page en cours de construction.</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
