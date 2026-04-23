import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Kanban.css";

const STATUS = [
  { key: "a_faire", label: "À faire", color: "#2C3E50" },
  { key: "en_cours", label: "En cours", color: "#FF8C00" },
  { key: "termine", label: "Terminé", color: "#27AE60" }
];

function Kanban() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [draggingOver, setDraggingOver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    nom_tache: "",
    description: "",
    statut: "a_faire",
    date_echeance: "",
    temps_prevu: "",
    temps_reel: "",
    Id_utilisateur: "",
  });

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const tachesByStatut = (statut) => taches.filter(t => t.statut === statut);

  const fetchTaches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/taches/projet/${id}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des tâches");
      const data = await res.json();
      if (Array.isArray(data)) setTaches(data);
      else if (data && Array.isArray(data.taches)) setTaches(data.taches);
      else setTaches([]);
    } catch (error) {
      setError(error.message);
      setTaches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTaches();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingTask ? "PUT" : "POST";
    const url = editingTask
        ? `${API}/api/taches/${editingTask.Id_tache}`
        : `${API}/api/taches`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          Id_projet: parseInt(id),
          Id_utilisateur: form.Id_utilisateur ? parseInt(form.Id_utilisateur) || null : null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        fetchTaches();
      }
    } catch (err) {
      console.error("Erreur enregistrement", err);
    }
  };

  const confirmDelete = (tache) => {
    setTaskToDelete(tache);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await fetch(`${API}/api/taches/${taskToDelete.Id_tache}`, { method: "DELETE" });
      if (res.ok) {
        setTaches(taches.filter(t => t.Id_tache !== taskToDelete.Id_tache));
        setShowDeleteModal(false);
        setTaskToDelete(null);
      }
    } catch (err) {
      console.error("Erreur suppression", err);
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setForm({ nom_tache: "", description: "", statut: "a_faire", date_echeance: "", temps_prevu: "", temps_reel: "", Id_utilisateur: "" });
    setShowModal(true);
  };

  const openEdit = (tache) => {
    setEditingTask(tache);
    setForm({
      nom_tache: tache.nom_tache || "",
      description: tache.description || "",
      statut: tache.statut || "a_faire",
      date_echeance: tache.date_echeance ? tache.date_echeance.split('T')[0] : "",
      temps_prevu: tache.temps_prevu || "",
      temps_reel: tache.temps_reel || "",
      Id_utilisateur: tache.Id_utilisateur || "",
    });
    setShowModal(true);
  };

  const handleDragStart = (e, tacheId) => {
    setDraggedId(tacheId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, statut) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver(statut);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggingOver(null);
    }
  };

  const handleDrop = async (e, newStatut) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver(null);
    if (!draggedId) return;
    const tache = taches.find(t => t.Id_tache === draggedId);
    if (!tache || tache.statut === newStatut) return;
    setTaches(prev => prev.map(t => t.Id_tache === draggedId ? { ...t, statut: newStatut } : t));
    try {
      const res = await fetch(`${API}/api/taches/${draggedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      const data = await res.json();
      console.log("PATCH response:", res.status, data);
      if (!res.ok) fetchTaches();
    } catch (err) {
      console.error("Erreur drag:", err);
      console.log("DROP:", draggedId, "->", newStatut);
      fetchTaches();
    }
    setDraggedId(null);
  };

  if (loading) return <div className="kb-loading"><div className="kb-spinner" /></div>;
  if (error) return <div className="kb-error">Erreur : {error}</div>;

  return (
      <div className="kb-page">

        {/* HEADER */}
        <div className="kb-header">
          <div>
            <button className="kb-back" onClick={() => navigate('/projects')}>← Retour aux projets</button>
            <h1 className="kb-title">Tableau Kanban</h1>
            <p className="kb-subtitle">Glissez-déposez les tâches pour changer leur statut</p>
          </div>
          <button className="kb-btn-new" onClick={openCreate}>+ Nouvelle tâche</button>
        </div>

        {/* BOARD */}
        <div className="kb-board">
          {STATUS.map(({ key, label, color }) => (
              <div
                  key={key}
                  className={`kb-column ${draggingOver === key ? "kb-column--over" : ""}`}
                  onDragOver={(e) => handleDragOver(e, key)}
                  onDrop={(e) => handleDrop(e, key)}
                  onDragLeave={(e) => handleDragLeave(e)}
              >
                <div className="kb-col-header" style={{ borderTop: `4px solid ${color}` }}>
                  <span className="kb-col-label">{label}</span>
                  <span className="kb-col-count">{tachesByStatut(key).length}</span>
                </div>

                <div className="kb-cards">
                  {tachesByStatut(key).length === 0 && (
                      <div className="kb-empty-drop">Déposez une tâche ici</div>
                  )}
                  {tachesByStatut(key).map((tache) => (
                      <div
                          key={tache.Id_tache}
                          className={`kb-card ${draggedId === tache.Id_tache ? "kb-card--dragging" : ""}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, tache.Id_tache)}
                      >
                        <button className="kb-card-close" onClick={() => confirmDelete(tache)}>×</button>
                        <h3 className="kb-card-title">{tache.nom_tache}</h3>
                        {tache.description && <p className="kb-card-desc">{tache.description}</p>}
                        <div className="kb-card-meta">
                          {tache.Id_utilisateur && (
                              <span className="kb-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                {tache.Id_utilisateur}
                      </span>
                          )}
                          {tache.date_echeance && (
                              <span className="kb-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                                {new Date(tache.date_echeance).toLocaleDateString("fr-FR")}
                      </span>
                          )}
                          {tache.temps_prevu && (
                              <span className="kb-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                {tache.temps_reel ? `${tache.temps_reel}h / ${tache.temps_prevu}h` : `${tache.temps_prevu}h estimées`}
                      </span>
                          )}
                        </div>
                        <button className="kb-card-edit" onClick={() => openEdit(tache)}>Modifier</button>
                      </div>
                  ))}
                </div>
              </div>
          ))}
        </div>

        {/* MODAL CREATION / MODIFICATION */}
        {showModal && (
            <div className="kb-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="kb-modal" onClick={e => e.stopPropagation()}>
                <div className="kb-modal-header">
                  <h2>{editingTask ? "Modifier la tâche" : "Créer une nouvelle tâche"}</h2>
                  <button className="kb-modal-close" onClick={() => setShowModal(false)}>×</button>
                </div>
                <form className="kb-form" onSubmit={handleSubmit}>
                  <label>
                    Titre
                    <input
                        type="text"
                        placeholder={editingTask ? form.nom_tache : "Ex: Design du header"}
                        value={form.nom_tache}
                        onChange={e => setForm({ ...form, nom_tache: e.target.value })}
                        required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                        placeholder="Décrivez la tâche..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </label>
                  <div className="kb-form-row">
                    <label>
                      Assigné à
                      <input
                          type="text"
                          placeholder={editingTask ? "Sophie Bernard" : "Nom du membre"}
                          value={form.Id_utilisateur}
                          onChange={e => setForm({ ...form, Id_utilisateur: e.target.value })}
                      />
                    </label>
                    <label>
                      Date d'échéance
                      <input
                          type="date"
                          value={form.date_echeance}
                          onChange={e => setForm({ ...form, date_echeance: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="kb-form-row">
                    <label>
                      Temps prévu (heures)
                      <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={form.temps_prevu}
                          onChange={e => setForm({ ...form, temps_prevu: e.target.value })}
                      />
                    </label>
                    {editingTask && (
                        <label>
                          Temps réel (heures)
                          <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={form.temps_reel}
                              onChange={e => setForm({ ...form, temps_reel: e.target.value })}
                          />
                        </label>
                    )}
                  </div>
                  <div className="kb-form-actions">
                    <button type="submit" className="kb-btn-submit">
                      {editingTask ? "Enregistrer" : "Créer la tâche"}
                    </button>
                    <button type="button" className="kb-btn-cancel" onClick={() => setShowModal(false)}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* MODAL SUPPRESSION */}
        {showDeleteModal && taskToDelete && (
            <div className="kb-modal-overlay" onClick={() => setShowDeleteModal(false)}>
              <div className="kb-modal kb-modal--delete" onClick={e => e.stopPropagation()}>
                <div className="kb-delete-content">
                  <h2>Supprimer la tâche ?</h2>
                  <p>Êtes-vous sûr de vouloir supprimer "{taskToDelete.nom_tache}" ? Cette action est irréversible.</p>
                  <div className="kb-delete-actions">
                    <button className="kb-btn-cancel" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                    <button className="kb-btn-delete" onClick={handleDelete}>Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default Kanban;