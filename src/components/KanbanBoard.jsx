import { useCallback, useEffect, useState } from "react";
import TaskCard from "./TaskCard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const COLUMNS = ["À faire", "En cours", "En révision", "Terminé"];

const normalizeStatus = (value) => {
  const s = String(value || "").toLowerCase();
  if (s.includes("en cours")) return "En cours";
  if (s.includes("révision") || s.includes("revision")) return "En révision";
  if (s.includes("termin")) return "Terminé";
  return "À faire";
};

const normalizeTask = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.Id_tache ?? raw.id ?? raw.id_tache ?? raw.taskId ?? raw.IdTask;
  return {
    ...raw,
    id,
    titre: raw.titre ?? raw.title ?? raw.nom ?? "",
    description: raw.description ?? raw.desc ?? raw.details ?? "",
    priorite: raw.priorite ?? raw.priority ?? "moyenne",
    assigned_email: raw.assigned_email ?? raw.assignedEmail ?? raw.assignee_email ?? raw.email_assignee ?? raw.email ?? "",
    assigned_name: raw.assigned_name ?? raw.assignedName ?? raw.assignee_name ?? raw.nom_assignee ?? "",
    due_date: raw.due_date ?? raw.dueDate ?? raw.date_echeance ?? raw.echeance ?? "",
    statut: normalizeStatus(raw.statut ?? raw.status ?? raw.colonne ?? raw.column),
  };
};

function KanbanBoard({ projectId, onToast }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState("À faire");
  const [form, setForm] = useState({
    titre: "",
    description: "",
    priorite: "moyenne",
    assigned_email: "",
    due_date: "",
  });

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projets/${projectId}/taches`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast?.("error", data?.message || "Erreur chargement des tâches");
        setTasks([]);
        return;
      }
      const list = data?.taches ?? data?.tasks ?? data?.data ?? data ?? [];
      const normalized = Array.isArray(list) ? list.map(normalizeTask).filter(Boolean) : [];
      setTasks(normalized);
    } catch (error) {
      console.error("Erreur chargement tâches:", error);
      onToast?.("error", "Erreur réseau lors du chargement des tâches");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [onToast, projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onDragStart = useCallback((event, task) => {
    if (!task?.id) return;
    event.dataTransfer.setData("text/plain", String(task.id));
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const moveTask = useCallback(
    async (taskId, newStatus) => {
      const status = String(newStatus || "À faire");
      let previousStatus = null;

      setTasks((prev) =>
        prev.map((t) => {
          if (String(t.id) !== String(taskId)) return t;
          previousStatus = t.statut;
          return { ...t, statut: status };
        }),
      );

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/taches/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ statut: status }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setTasks((prev) =>
            prev.map((t) => (String(t.id) === String(taskId) ? { ...t, statut: previousStatus || t.statut } : t)),
          );
          onToast?.("error", data?.message || "Erreur lors du déplacement de la tâche");
        }
      } catch (error) {
        console.error("Erreur déplacement tâche:", error);
        setTasks((prev) =>
          prev.map((t) => (String(t.id) === String(taskId) ? { ...t, statut: previousStatus || t.statut } : t)),
        );
        onToast?.("error", "Erreur réseau lors du déplacement de la tâche");
      }
    },
    [onToast],
  );

  const onDrop = useCallback(
    (event, status) => {
      event.preventDefault();
      const taskId = event.dataTransfer.getData("text/plain");
      if (!taskId) return;
      moveTask(taskId, status);
    },
    [moveTask],
  );

  const openCreateModal = useCallback((status) => {
    setCreateStatus(status || "À faire");
    setForm({ titre: "", description: "", priorite: "moyenne", assigned_email: "", due_date: "" });
    setShowModal(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    if (creating) return;
    setShowModal(false);
  }, [creating]);

  const createTask = useCallback(async () => {
    if (!form.titre.trim()) return;
    if (!projectId) return;
    setCreating(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projets/${projectId}/taches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          titre: form.titre.trim(),
          description: form.description,
          priorite: form.priorite,
          assigned_email: form.assigned_email,
          due_date: form.due_date,
          statut: createStatus || "À faire",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast?.("error", data?.message || "Erreur lors de la création de la tâche");
        return;
      }

      const created = normalizeTask(data?.tache ?? data?.task ?? data);
      if (created) setTasks((prev) => [...prev, created]);
      setShowModal(false);
      onToast?.("success", "Tâche créée");

      if (form.assigned_email?.trim()) {
        try {
          await fetch(`${API_BASE_URL}/api/notifications`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              type: "task_invitation",
              message: `Vous avez été assigné à la tâche ${form.titre.trim()}`,
              assigned_email: form.assigned_email.trim(),
            }),
          });
        } catch (error) {
          console.error("Erreur notification assignation:", error);
        }
      }
    } catch (error) {
      console.error("Erreur création tâche:", error);
      onToast?.("error", "Erreur réseau lors de la création de la tâche");
    } finally {
      setCreating(false);
    }
  }, [createStatus, creating, form, onToast, projectId]);

  const tasksForStatus = useCallback(
    (status) => tasks.filter((t) => normalizeStatus(t?.statut) === status),
    [tasks],
  );

  return (
    <div style={{ marginTop: 16 }}>
      {loading ? (
        <div style={{ color: "#6b7280" }}>Chargement du Kanban…</div>
      ) : (
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", overflowX: "auto", paddingBottom: 10 }}>
          {COLUMNS.map((status) => (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, status)}
              style={{
                minWidth: 290,
                background: "#f9fafb",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900, color: "#111827" }}>{status}</div>
                <div style={{ color: "#6b7280", fontWeight: 800, fontSize: 12 }}>
                  {tasksForStatus(status).length}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {tasksForStatus(status).map((t) => (
                  <TaskCard key={t.id} task={t} onToast={onToast} onDragStart={onDragStart} />
                ))}
              </div>

              <button
                type="button"
                onClick={() => openCreateModal(status)}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px dashed rgba(0,0,0,0.18)",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 900,
                  color: "#378ADD",
                }}
              >
                + Ajouter une tâche
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nouvelle tâche</h2>

            <label>Titre *</label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => setForm((prev) => ({ ...prev, titre: e.target.value }))}
              placeholder="Ex: Créer la page Kanban"
            />

            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez brièvement la tâche..."
            />

            <label>Priorité</label>
            <select
              value={form.priorite}
              onChange={(e) => setForm((prev) => ({ ...prev, priorite: e.target.value }))}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            >
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
            </select>

            <label>Assigné (email)</label>
            <input
              type="email"
              value={form.assigned_email}
              onChange={(e) => setForm((prev) => ({ ...prev, assigned_email: e.target.value }))}
              placeholder="ex: membre@taskflow.com"
            />

            <label>Date d'échéance</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={closeCreateModal}
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
                onClick={createTask}
                disabled={creating}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: "#378ADD",
                  color: "#fff",
                  padding: "10px 14px",
                  cursor: creating ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default KanbanBoard;

