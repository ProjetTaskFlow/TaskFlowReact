import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
      <div className="container">

        {/* Sidebar */}
        <div className="sidebar">
          <h2>TaskFlow</h2>

          <button className="menu active">
            𝄜 Dashboard
          </button>

          <button className="menu" onClick={() => navigate('/projects')}>
            🗁 Projets
          </button>

          <button className="menu">
            🛠 Paramètres
          </button>

          <button className="menu-logout" onClick={handleLogout}>
            Déconnexion ➜]
          </button>
        </div>

        {/* CONTENT */}
        <div className="content">
          <div className="main">
            <h1>Dashboard</h1>

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