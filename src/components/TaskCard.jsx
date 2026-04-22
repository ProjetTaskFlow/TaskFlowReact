import Chronometre from "./Chronometre";

const getInitials = (value) => {
  const cleaned = String(value || "").trim();
  if (!cleaned) return "??";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = (parts[1]?.[0] || parts[0]?.[1] || "").trim();
  return (first + second).toUpperCase() || "??";
};

const formatDueDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
};

const getPriorityStyles = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p.includes("haut")) return { bg: "rgba(226,75,74,0.12)", color: "#E24B4A", label: "Haute" };
  if (p.includes("bas")) return { bg: "rgba(107,114,128,0.12)", color: "#6b7280", label: "Basse" };
  return { bg: "rgba(55,138,221,0.12)", color: "#378ADD", label: "Moyenne" };
};

function TaskCard({ task, onToast, onDragStart }) {
  const priority = getPriorityStyles(task?.priorite);
  const title = task?.titre || "Tâche sans titre";
  const desc = task?.description || "";
  const assignedLabel = task?.assigned_name || task?.assigned_email || task?.assignee || "";
  const initials = getInitials(assignedLabel || "?");
  const due = formatDueDate(task?.due_date || task?.date_echeance || task?.echeance);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        cursor: "grab",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, color: "#111827", marginBottom: 6 }}>{title}</div>
          {desc ? <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 10 }}>{desc}</div> : null}
        </div>

        <span
          style={{
            background: priority.bg,
            color: priority.color,
            fontWeight: 900,
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {priority.label}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "#378ADD",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 12,
              flexShrink: 0,
            }}
            aria-label={assignedLabel ? `Assigné à ${assignedLabel}` : "Non assigné"}
            title={assignedLabel || "Non assigné"}
          >
            {initials}
          </div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>{assignedLabel || "Non assigné"}</div>
        </div>

        {due ? (
          <div style={{ color: "#6b7280", fontSize: 12 }}>
            Échéance : <strong style={{ color: "#111827" }}>{due}</strong>
          </div>
        ) : null}
      </div>

      <Chronometre taskId={task?.id} onToast={onToast} />
    </div>
  );
}

export default TaskCard;

