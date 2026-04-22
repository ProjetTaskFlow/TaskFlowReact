import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Kanban.css";

const STATUS = [
  { key: "a_faire", label: "A faire", color: "#2C3E50"},
  { key: "en_cours", label: "En cours", color: "#FF8C00"},
  { key: "termine", label: "Terminé", color: "#27AE60"}
];

function Kanban({ Id_projet }) {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [draggingOver, setDraggingOver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    nom_tache: "",
    description: "",
    statut: "a_faire",
    date_echeance: "",
    temps_prevu: "",
    temps_reel: "",
  });

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Chargement des tâches
  const fetchTaches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/taches${Id_projet ? `?idProjet=${Id_projet}` : ""}`);
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des tâches")
      };
      const data = await res.json();
      setTaches(data);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches: ", error);
      setError((error.message))
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaches();
  }, [Id_projet]);

  // Drag and drop
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, statut) => {
    e.preventDefault();
    setDraggingOver(statut);
  };

  const handleDrop = async (e, newStatut) => {
    e.preventDefault();
    setDraggingOver(null);
    if (!draggedId) return;

    const tache = taches.find((t) => t.Id_tache === draggedId);
    if (!tache || tache.statut === newStatut) return;

    // Mise à jour optimiste
    setTaches((prev) =>
        prev.map((t) => (t.Id_tache === draggedId ? { ...t, statut: newStatut } : t))
    );

    try {
      const res = await fetch(`${API}/api/taches/${draggedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Rollback si erreur
      setTaches((prev) =>
          prev.map((t) => (t.Id_tache === draggedId ? { ...t, statut: tache.statut } : t))
      );
    }

    setDraggedId(null);
  };

  // Modal création
  const openCreate = () => {
    setEditingTask(null);
    setForm({ nom_tache: "", description: "", statut: "a_faire", date_echeance: "", temps_prevu: "", temps_reel: "" });
    setShowModal(true);
  };
  // Rendu
  if (loading) return <div className="kb-loading"><div className="kb-spinner" /></div>;
  if (error)   return <div className="kb-error">Erreur : {error}</div>;

  return (
      <div className="kb-page">
        {/* Header */}
        <div className="kb-header">
          <div>
            <h1 className="kb-title">Tableau Kanban</h1>
            <p className="kb-subtitle">Glissez-déposez les tâches pour changer leur statut</p>
          </div>
          <button className="kb-btn-new" onClick={openCreate}>
            <span>+</span> Nouvelle tâche
          </button>
        </div>

        {/* Colonnes */}
        <div className="kb-board">
          {STATUS.map(({ key, label, color }) => (
              <div
                  key={key}
                  className={`kb-column ${draggingOver === key ? "kb-column--over" : ""}`}
                  onDragOver={(e) => handleDragOver(e, key)}
                  onDrop={(e) => handleDrop(e, key)}
                  onDragLeave={() => setDraggingOver(null)}
              >
                {/* En-tête colonne */}
                <div className="kb-col-header" style={{ "--col-color": color }}>
                  <span className="kb-col-label">{label}</span>
                  <span className="kb-col-count">{tachesByStatut(key).length}</span>
                </div>

                {/* Cartes */}
                <div className="kb-cards">
                  {tachesByStatut(key).map((tache) => (
                      <div
                          key={tache.Id_tache}
                          className={`kb-card ${draggedId === tache.Id_tache ? "kb-card--dragging" : ""}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, tache.Id_tache)}
                          onDragEnd={() => setDraggedId(null)}
                      >
                        {/* Bouton supprimer */}
                        <button className="kb-card-close" onClick={() => handleDelete(tache.Id_tache)}>×</button>

                        <h3 className="kb-card-title">{tache.nom_tache}</h3>

                        {tache.description && (
                            <p className="kb-card-desc">{tache.description}</p>
                        )}

                        <div className="kb-card-meta">
                          {tache.assignee && (
                              <span className="kb-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
                                {tache.assignee}
                      </span>
                          )}
                          {tache.date_echeance && (
                              <span className="kb-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                {formatDate(tache.date_echeance)}
                      </span>
                          )}
                          {(tache.temps_prevu || tache.temps_reel) && (
                              <span className="kb-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
                                {tache.temps_reel ?? "—"}h / {tache.temps_prevu ?? "—"}h
                      </span>
                          )}
                        </div>

                        <button className="kb-card-edit" onClick={() => openEdit(tache)}>Modifier</button>
                      </div>
                  ))}

                  {/* Zone de dépôt vide */}
                  {tachesByStatut(key).length === 0 && (
                      <div className="kb-empty-drop">Déposez une tâche ici</div>
                  )}
                </div>
              </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
            <div className="kb-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
              <div className="kb-modal">
                <div className="kb-modal-header">
                  <h2>{editingTask ? "Modifier la tâche" : "Nouvelle tâche"}</h2>
                  <button className="kb-modal-close" onClick={() => setShowModal(false)}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="kb-form">
                  <label>
                    Nom de la tâche *
                    <input required value={form.nom_tache} onChange={(e) => setForm({ ...form, nom_tache: e.target.value })} placeholder="Ex: Design du header" />
                  </label>
                  <label>
                    Description
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez la tâche..." rows={3} />
                  </label>
                  <div className="kb-form-row">
                    <label>
                      Statut
                      <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                        {STATUTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </label>
                    <label>
                      Date d'échéance
                      <input type="date" value={form.date_echeance} onChange={(e) => setForm({ ...form, date_echeance: e.target.value })} />
                    </label>
                  </div>
                  <div className="kb-form-row">
                    <label>
                      Temps prévu (h)
                      <input type="number" min="0" value={form.temps_prevu} onChange={(e) => setForm({ ...form, temps_prevu: e.target.value })} placeholder="0" />
                    </label>
                    <label>
                      Temps réel (h)
                      <input type="number" min="0" value={form.temps_reel} onChange={(e) => setForm({ ...form, temps_reel: e.target.value })} placeholder="0" />
                    </label>
                  </div>
                  <div className="kb-form-actions">
                    <button type="button" className="kb-btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
                    <button type="submit" className="kb-btn-submit">{editingTask ? "Sauvegarder" : "Créer la tâche"}</button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
export default Kanban;
