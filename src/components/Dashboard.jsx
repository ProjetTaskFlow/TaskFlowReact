import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date_debut: '',
    date_echeance: '',
  });

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projets`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) setProjets(data.projets);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjets();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          Id_utilisateur: 1, // à remplacer par l'ID du user connecté depuis le token
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setProjets(prev => [...prev, data.projet]);
        setShowModal(false);
        setFormData({ titre: '', description: '', date_debut: '', date_echeance: '' });
      }
    } catch (error) {
      console.error("Erreur création projet:", error);
    }
  };

  const colors = ['#4da3ff', '#a78bfa', '#34d399', '#f97316', '#f43f5e'];

  return (
      <div className="db-container">

        {/* SIDEBAR */}
        <div className="db-sidebar">
          <div className="db-logo">
            <div className="db-logo-icon">✦</div>
            <span>TaskFlow</span>
          </div>

          <nav className="db-nav">
            <button className="db-nav-item active" onClick={() => navigate('/dashboard')}>
              <span className="db-nav-icon">⊞</span> Dashboard
              <span className="db-nav-dot" />
            </button>
            <button className="db-nav-item" onClick={() => navigate('/projects')}>
              <span className="db-nav-icon">▦</span> Projets
              <span className="db-nav-dot" />
            </button>
            <button className="db-nav-item">
              <span className="db-nav-icon">⚙</span> Paramètres
            </button>
          </nav>

          <button className="db-logout" onClick={handleLogout}>
            <span>↪</span> Déconnexion
          </button>
        </div>

        {/* MAIN */}
        <div className="db-main">

          {/* TOPBAR */}
          <div className="db-topbar">
            <div className="db-search">
              <span className="db-search-icon">🔍</span>
              <input type="text" placeholder="Rechercher..." />
            </div>
            <div className="db-user">
              <div className="db-user-info">
                <span className="db-user-name">{user?.prenom} {user?.nom}</span>
                <div className="db-avatar">{user?.prenom?.[0]}{user?.nom?.[0]}</div>
              </div>
              <div className="db-avatar">MD</div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="db-content">
            <h1 className="db-title">Dashboard</h1>
            <p className="db-subtitle">Gérez et suivez l'avancement de tous vos projets</p>

            {/* BANNER */}
            <div className="db-banner">
              <span className="db-banner-icon">💡</span>
              <div>
                <strong>Système de rôles</strong>
                <p>Vos rôles sont définis au niveau de chaque projet. Vous pouvez être <strong>Chef de projet</strong> sur certains projets et <strong>Membre</strong> sur d'autres.</p>
              </div>
            </div>

            {/* STATS */}
            <div className="db-stats">
              <div className="db-stat-card">
                <div>
                  <p className="db-stat-label">Projets actifs</p>
                  <p className="db-stat-value">{projets.length}</p>
                </div>
                <div className="db-stat-icon" style={{ background: '#4da3ff' }}>✔</div>
              </div>
              <div className="db-stat-card">
                <div>
                  <p className="db-stat-label">Tâches totales</p>
                  <p className="db-stat-value">0</p>
                </div>
                <div className="db-stat-icon" style={{ background: '#34d399' }}>⏱</div>
              </div>
              <div className="db-stat-card">
                <div>
                  <p className="db-stat-label">Tâches terminées</p>
                  <p className="db-stat-value">0</p>
                </div>
                <div className="db-stat-icon" style={{ background: '#a78bfa' }}>✔</div>
              </div>
              <div className="db-stat-card">
                <div>
                  <p className="db-stat-label">Membres</p>
                  <p className="db-stat-value">0</p>
                </div>
                <div className="db-stat-icon" style={{ background: '#f97316' }}>👥</div>
              </div>
            </div>

            {/* PROJETS */}
            <div className="db-projects-header">
              <h2>Tous les projets</h2>
              <button className="db-btn-new" onClick={() => setShowModal(true)}>
                + Nouveau projet
              </button>
            </div>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <div className="db-projects-grid">
                  {projets.map((projet, index) => (
                      <div
                          className="db-project-card"
                          key={projet.Id_projet}
                          onClick={() => navigate(`/projects/${projet.Id_projet}/board`)}
                      >
                        <div className="db-project-top">
                          <div className="db-project-icon" style={{ background: colors[index % colors.length] }}>✔</div>
                          <span className="db-project-badge">Chef de projet</span>
                        </div>
                        <h3 className="db-project-title">{projet.titre}</h3>
                        <p className="db-project-desc">{projet.description || "—"}</p>
                        <div className="db-project-progress-row">
                          <span>Progression</span>
                          <span>0%</span>
                        </div>
                        <div className="db-progress-bar">
                          <div className="db-progress-fill" style={{ width: '0%', background: colors[index % colors.length] }} />
                        </div>
                        <div className="db-project-footer">
                          <span>⊙ 0 tâches</span>
                          <span>👥 0</span>
                        </div>
                      </div>
                  ))}

                  {/* Card créer */}
                  <div className="db-project-card db-project-create" onClick={() => setShowModal(true)}>
                    <div className="db-create-icon">+</div>
                    <p className="db-create-title">Créer un nouveau projet</p>
                    <p className="db-create-sub">Commencez à organiser vos tâches</p>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
            <div className="db-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="db-modal" onClick={e => e.stopPropagation()}>
                <h2>Nouveau projet</h2>
                <form onSubmit={handleCreate}>
                  <div className="db-modal-field">
                    <label htmlFor="titre">Titre</label>
                    <input id="titre" type="text" value={formData.titre} onChange={handleChange} required />
                  </div>
                  <div className="db-modal-field">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" value={formData.description} onChange={handleChange} rows={3} />
                  </div>
                  <div className="db-modal-row">
                    <div className="db-modal-field">
                      <label htmlFor="date_debut">Date de début</label>
                      <input id="date_debut" type="date" value={formData.date_debut} onChange={handleChange} />
                    </div>
                    <div className="db-modal-field">
                      <label htmlFor="date_echeance">Date d'échéance</label>
                      <input id="date_echeance" type="date" value={formData.date_echeance} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="db-modal-actions">
                    <button type="button" className="db-btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
                    <button type="submit" className="db-btn-submit">Créer</button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}

export default Dashboard;