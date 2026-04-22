import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/Project.css";
import NotificationBell from "../components/NotificationBell";
import MemberList from "../components/MemberList";
import KanbanBoard from "../components/KanbanBoard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const normalizeProject = (rawProject) => {
  if (!rawProject || typeof rawProject !== "object") return null;

  const Id_projet =
    rawProject.Id_projet ??
    rawProject.id ??
    rawProject.IdProjet ??
    rawProject.id_projet ??
    rawProject.projectId;

  return {
    ...rawProject,
    Id_projet,
    titre: rawProject.titre ?? rawProject.title ?? rawProject.nom ?? rawProject.name ?? "",
    description: rawProject.description ?? rawProject.descriptif ?? "",
    role: rawProject.role ?? rawProject.role_projet ?? rawProject.role_utilisateur ?? rawProject.userRole ?? "",
  };
};

const isChefDeProjet = (project) => {
  const role = String(project?.role || "").toLowerCase();
  if (role.includes("chef")) return true;
  if (role.includes("admin")) return true;
  return Boolean(project?.isChefDeProjet ?? project?.est_chef ?? project?.isOwner);
};

function Project() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const projectId = params?.id;
  const isDetail = Boolean(projectId);

  const menuRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [toast, setToast] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newProject, setNewProject] = useState({ titre: "", description: "" });

  const [menuProjectId, setMenuProjectId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);

  const [activeTab, setActiveTab] = useState("kanban");

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast("error", data?.message || "Erreur chargement projets");
        setProjects([]);
        return;
      }
      const list = data?.projets ?? data?.projects ?? data?.data ?? data ?? [];
      const normalized = Array.isArray(list) ? list.map(normalizeProject).filter(Boolean) : [];
      setProjects(normalized);
    } catch (error) {
      console.error("Erreur chargement projets", error);
      showToast("error", "Erreur réseau lors du chargement des projets");
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!isDetail) return;
    const searchParams = new URLSearchParams(location.search || "");
    const tab = (searchParams.get("tab") || "").toLowerCase();
    if (tab === "membres") setActiveTab("membres");
    if (tab === "kanban") setActiveTab("kanban");
  }, [isDetail, location.search]);

  useEffect(() => {
    if (!menuProjectId) return;
    const onClickOutside = (event) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target)) return;
      setMenuProjectId(null);
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [menuProjectId]);

  const openCreateProject = () => {
    setCreateError("");
    setNewProject({ titre: "", description: "" });
    setShowCreateModal(true);
  };

  const submitCreateProject = useCallback(async () => {
    if (!newProject.titre.trim()) return;
    setCreatingProject(true);
    setCreateError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
       body: JSON.stringify({
  nom: newProject.titre.trim(),
  description: newProject.description
})
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(data?.message || "Erreur lors de la création du projet");
        return;
      }
      const created = normalizeProject(data?.projet ?? data?.project ?? data);
      if (!created) {
        setCreateError("Réponse serveur invalide : projet non créé");
        return;
      }
      setProjects((prev) => [...prev, created]);
      setShowCreateModal(false);
      showToast("success", "Projet créé");
    } catch (error) {
      console.error("Erreur création projet", error);
      setCreateError("Erreur réseau lors de la création du projet");
    } finally {
      setCreatingProject(false);
    }
  }, [newProject.description, newProject.titre, showToast]);

  const openDeleteProject = useCallback((project) => {
    setDeleteTarget(project);
    setMenuProjectId(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    if (deletingProject) return;
    setDeleteTarget(null);
  }, [deletingProject]);

  const deleteProject = useCallback(async () => {
    if (!deleteTarget?.Id_projet) return;
    setDeletingProject(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projets/${deleteTarget.Id_projet}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast("error", data?.message || "Erreur lors de la suppression du projet");
        return;
      }

      setProjects((prev) => prev.filter((p) => String(p.Id_projet) !== String(deleteTarget.Id_projet)));
      setDeleteTarget(null);
      showToast("success", "Projet supprimé");
      if (isDetail && String(deleteTarget.Id_projet) === String(projectId)) navigate("/projects");
    } catch (error) {
      console.error("Erreur suppression projet:", error);
      showToast("error", "Erreur réseau lors de la suppression du projet");
    } finally {
      setDeletingProject(false);
    }
  }, [deleteTarget, isDetail, navigate, projectId, showToast]);

  const currentProject = isDetail
    ? projects.find((p) => String(p.Id_projet) === String(projectId))
    : null;
  const currentProjectTitle = currentProject?.titre || `Projet #${projectId}`;

  return (
    <div className="projects-container">
      <div className="sidebar">
        <h2>TaskFlow</h2>

        <button className="menu" onClick={() => navigate("/dashboard")}>
          𝄜 Dashboard
        </button>

        <button className="menu active" onClick={() => navigate("/projects")}>
          🗁 Projets
        </button>

        <button className="menu" onClick={() => navigate("/settings")}>
          🛠 Paramètres
        </button>

        <button className="menu-logout" onClick={() => navigate("/login")}>
          Déconnexion ➜]
        </button>
      </div>

      <div className="project-container-2">
        {!isDetail ? (
          <>
            <div className="projects-header">
              <h2>Tous les projets</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <NotificationBell />
                <button className="btn-primary" onClick={openCreateProject}>
                  + Nouveau projet
                </button>
              </div>
            </div>

            <div className="projects-grid">
              {loadingProjects ? (
                <div style={{ color: "#6b7280" }}>Chargement…</div>
              ) : projects.length === 0 ? (
                <div className="empty-card" onClick={openCreateProject}>
                  <div className="plus">+</div>
                  <p>Créer un nouveau projet</p>
                  <span>Commencez à organiser vos tâches</span>
                </div>
              ) : (
                projects.map((project) => {
                  const projectTitle = project?.titre ?? "";
                  const projectSlug = slugify(projectTitle) || "projet";
                  const canDelete = isChefDeProjet(project);
                  const isMenuOpen = String(menuProjectId) === String(project.Id_projet);

                  return (
                    <div
                      key={project.Id_projet ?? projectTitle}
                      className="project-card"
                      onClick={() => navigate(`/project/${projectSlug}/${project.Id_projet}`)}
                      style={{ cursor: "pointer", position: "relative" }}
                    >
                      {canDelete ? (
                        <div style={{ position: "absolute", top: 10, right: 10 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuProjectId((prev) =>
                                String(prev) === String(project.Id_projet) ? null : project.Id_projet,
                              );
                            }}
                            aria-label="Menu projet"
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              border: "1px solid rgba(0,0,0,0.08)",
                              background: "#fff",
                              cursor: "pointer",
                              fontWeight: 900,
                              fontSize: 18,
                              lineHeight: 1,
                            }}
                          >
                            ⋯
                          </button>

                          {isMenuOpen ? (
                            <div
                              ref={menuRef}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                top: 40,
                                right: 0,
                                width: 200,
                                background: "#fff",
                                border: "1px solid rgba(0,0,0,0.08)",
                                borderRadius: 12,
                                boxShadow: "0 14px 40px rgba(0,0,0,0.14)",
                                zIndex: 999,
                                overflow: "hidden",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => openDeleteProject(project)}
                                style={{
                                  width: "100%",
                                  textAlign: "left",
                                  padding: 12,
                                  border: "none",
                                  background: "#fff",
                                  cursor: "pointer",
                                  fontWeight: 900,
                                  color: "#E24B4A",
                                }}
                              >
                                Supprimer le projet
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="card-header">
                        <span className="badge">{canDelete ? "Chef de projet" : "Membre"}</span>
                      </div>
                      <h3>{projectTitle || "Projet sans titre"}</h3>
                      <p>{project.description || ""}</p>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `0%` }} />
                      </div>
                      <div className="card-footer">
                        <span>0 tâches</span>
                        <span>1 👥</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>{currentProjectTitle}</h2>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                  ID projet : <strong style={{ color: "#111827" }}>{projectId}</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <NotificationBell />
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  style={{
                    border: "1px solid rgba(0,0,0,0.10)",
                    borderRadius: 12,
                    background: "#fff",
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  ← Tous les projets
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <button
                type="button"
                onClick={() => setActiveTab("kanban")}
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 999,
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontWeight: 900,
                  background: activeTab === "kanban" ? "#378ADD" : "#fff",
                  color: activeTab === "kanban" ? "#fff" : "#111827",
                }}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("membres")}
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 999,
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontWeight: 900,
                  background: activeTab === "membres" ? "#378ADD" : "#fff",
                  color: activeTab === "membres" ? "#fff" : "#111827",
                }}
              >
                Membres
              </button>
            </div>

            {activeTab === "membres" ? (
              <MemberList projectId={projectId} onToast={showToast} />
            ) : (
              <KanbanBoard projectId={projectId} onToast={showToast} />
            )}
          </>
        )}
      </div>

      {showCreateModal ? (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
              ×
            </button>
            <h2>Créer un nouveau projet</h2>

            <label>Nom du projet</label>
            <input
              type="text"
              placeholder="Ex: Refonte site web"
              value={newProject.titre}
              onChange={(e) => setNewProject((prev) => ({ ...prev, titre: e.target.value }))}
            />

            <label>Description</label>
            <textarea
              placeholder="Décrivez brièvement votre projet..."
              value={newProject.description}
              onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
            />

            {createError ? <p style={{ color: "#E24B4A", margin: "4px 0 0" }}>{createError}</p> : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 10,
                  background: "#fff",
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Annuler
              </button>
              <button className="btn-primary" onClick={submitCreateProject} disabled={creatingProject}>
                {creatingProject ? "Création..." : "Créer le projet"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirmation</h2>
            <p style={{ color: "#6b7280", margin: "0 0 12px" }}>
              Cette action est irréversible. Supprimer{" "}
              <strong style={{ color: "#111827" }}>{deleteTarget.titre}</strong> ?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={closeDeleteModal}
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 10,
                  background: "#fff",
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={deleteProject}
                disabled={deletingProject}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: "#E24B4A",
                  color: "#fff",
                  padding: "10px 14px",
                  cursor: deletingProject ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  opacity: deletingProject ? 0.7 : 1,
                }}
              >
                {deletingProject ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 999,
            background: toast.type === "error" ? "#E24B4A" : "#378ADD",
            color: "#fff",
            padding: "12px 14px",
            borderRadius: 14,
            boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
            fontWeight: 900,
            maxWidth: 360,
          }}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

export default Project;
