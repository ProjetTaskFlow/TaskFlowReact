import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Project.css";

function Project() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ titre: "", description: "" });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/projets`)
        .then((res) => res.json())
        .then((data) => setProjects(data.projets))
        .catch((err) => console.error("Erreur chargement projets", err));
  }, []);

  const handleSubmit = async () => {
    if (!newProject.titre.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: newProject.titre,
          description: newProject.description,
          Id_utilisateur: 1,
        }),
      });

      const data = await res.json();
      if (data.projet) {
        setProjects([...projects, data.projet]);
      }
      setNewProject({ titre: "", description: "" });
      setShowModal(false);
    } catch (err) {
      console.error("Erreur création projet", err);
    }
  };

  return (
      <div className="projects-container">

        {/* SIDEBAR */}
        <div className="sidebar">
          <h2>TaskFlow</h2>

          <button className="menu" onClick={() => navigate('/dashboard')}>
            𝄜 Dashboard
          </button>

          <button className="menu active" onClick={() => navigate('/projects')}>
            🗁 Projets
          </button>

          <button className="menu">
            🛠 Paramètres
          </button>

          <button className="menu-logout" onClick={() => { localStorage.removeItem("token"); navigate('/login'); }}>
            Déconnexion ➜]
          </button>
        </div>

        <div className="project-container-2">
          <div className="projects-header">
            <h2>Tous les projets</h2>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Nouveau projet
            </button>
          </div>

          <div className="projects-grid">
            {projects.length === 0 ? (
                <div className="empty-card" onClick={() => setShowModal(true)}>
                  <div className="plus">+</div>
                  <p>Créer un nouveau projet</p>
                  <span>Commencez à organiser vos tâches</span>
                </div>
            ) : (
                <>
                  {projects.map((project) => (
                      <div
                          key={project.Id_projet}
                          className="project-card"
                          onClick={() => navigate(`/projects/${project.Id_projet}/board`)}
                          style={{ cursor: "pointer" }}
                      >
                        <div className="card-header">
                          <span className="badge">Admin</span>
                        </div>
                        <h3>{project.titre}</h3>
                        <p>{project.description}</p>
                        <div className="progress">
                          <div className="progress-bar" style={{ width: `0%` }} />
                        </div>
                        <div className="card-footer">
                          <span>0 tâches</span>
                          <span>1 👥</span>
                        </div>
                      </div>
                  ))}
                  <div className="empty-card" onClick={() => setShowModal(true)}>
                    <div className="plus">+</div>
                    <p>Créer un nouveau projet</p>
                    <span>Commencez à organiser vos tâches</span>
                  </div>
                </>
            )}
          </div>
        </div>

        {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                <h2>Créer un nouveau projet</h2>

                <label>Nom du projet</label>
                <input
                    type="text"
                    placeholder="Ex: Refonte site web"
                    value={newProject.titre}
                    onChange={(e) => setNewProject({ ...newProject, titre: e.target.value })}
                />

                <label>Description</label>
                <textarea
                    placeholder="Décrivez brièvement votre projet..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />

                <button className="btn-primary btn-full" onClick={handleSubmit}>
                  Créer le projet
                </button>
              </div>
            </div>
        )}
      </div>
  );
}

export default Project;