import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="sidebar">
        <h2>TaskFlow</h2>

        <button className="menu active">𝄜 Dashboard</button>

        <button className="menu" onClick={() => navigate("/projects")}>
          🗁 Projets
        </button>

        <button className="menu">🛠 Paramètres</button>

        <button className="menu-logout" onClick={() => navigate("/login")}>
          Déconnexion ➜]
        </button>
      </div>

      <div className="content">
        <div className="main">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <h1 style={{ margin: 0 }}>Dashboard</h1>
            <NotificationBell />
          </div>

          <div className="cards">
            <div className="card">
              <h3>Projets actifs</h3>
              <p>4</p>
            </div>

            <div className="card">
              <h3>Tâches totales</h3>
              <p>89</p>
            </div>

            <div className="card">
              <h3>Tâches terminées</h3>
              <p>47</p>
            </div>

            <div className="card">
              <h3>Membres</h3>
              <p>23</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

