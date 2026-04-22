import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Project.css";

function Project() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });

  useEffect(() => {
    fetch("http://localhost:3000/api/projets")
        .then((res) => res.json())
        .then((data) => setProjects(data.projets))
        .catch((err) => console.error("Erreur chargement projets", err));
  }, []);

  const handleCreateProject = () => {
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!newProject.title.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/api/projets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
        }),
      });

      const data = await res.json();
      setProjects([...projects, data.projet]);
      setNewProject({ title: "", description: "" });
      setShowModal(false);
    } catch (err) {
      console.error("Erreur création projet", err);
    }
  };

  return (
      <div className="projects-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2>TaskFlow</h2>

          <button
              className="menu active"
          >
            𝄜 Dashboard
          </button>

          <button
              className="menu"
              onClick={() => navigate('/projects')}
          >
            🗁 Projets
          </button>

          <button
              className="menu"
          >
            🛠 Paramètres
          </button>

          <button
              className="menu-logout"
              onClick={() => navigate('/login')}
          >
            Déconnexion ➜]
          </button>
        </div>

        <div className="project-container-2">



          <div className="projects-header">
            <h2>Tous les projets</h2>
            <button className="btn-primary" onClick={handleCreateProject}>
              + Nouveau projet
            </button>
          </div>

          <div className="projects-grid">
            {projects.length === 0 ? (
                <div className="empty-card" onClick={handleCreateProject}>
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
                          onClick={() => navigate(`/project/${project.titre.toLowerCase().replace(/\s+/g, '-')}/${project.Id_projet}`)}
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
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
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