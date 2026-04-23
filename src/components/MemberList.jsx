import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const parseJwt = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=")));
  } catch { return null; }
};

const getCurrentUser = () => {
  const p = parseJwt(localStorage.getItem("token"));
  return { id: p?.id ?? p?.userId ?? p?.sub ?? null, email: p?.email ?? null };
};

const getInitials = (name) => {
  const parts = String(name || "").trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "??";
};

const normalizeMember = (raw) => {
  if (!raw) return null;
  const firstName = raw.prenom_utilisateur ?? raw.prenom ?? "";
  const lastName = raw.nom_utilisateur ?? raw.nom ?? "";
  return {
    ...raw,
    userId: raw.Id_utilisateur ?? raw.id ?? raw.userId,
    fullName: [firstName, lastName].filter(Boolean).join(" ") || raw.email || "Utilisateur",
    email: raw.email_utilisateur ?? raw.email ?? "",
    role: raw.role ?? raw.role_projet ?? "",
  };
};

const isChef = (role) => String(role || "").toLowerCase().includes("chef");

function MemberList({ projectId, onToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmMember, setConfirmMember] = useState(null);
  const [removing, setRemoving] = useState(false);
  const currentUser = getCurrentUser();

  const isSelf = (m) =>
    (currentUser.id && String(m.userId) === String(currentUser.id)) ||
    (currentUser.email && m.email?.toLowerCase() === currentUser.email?.toLowerCase());

  const canManage = isChef(members.find((m) => isSelf(m))?.role);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projets/${projectId}/membres`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json().catch(() => ({}));
        const list = data?.membres ?? data?.data ?? data ?? [];
        setMembers(Array.isArray(list) ? list.map(normalizeMember).filter(Boolean) : []);
      } catch { onToast?.("error", "Erreur réseau"); }
      finally { setLoading(false); }
    })();
  }, [projectId]);

  const removeMember = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projets/${projectId}/membres/${confirmMember.userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) { onToast?.("error", "Erreur lors du retrait"); return; }
      setMembers((prev) => prev.filter((m) => String(m.userId) !== String(confirmMember.userId)));
      setConfirmMember(null);
      onToast?.("success", "Membre retiré");
    } catch { onToast?.("error", "Erreur réseau"); }
    finally { setRemoving(false); }
  };

  if (loading) return <div style={{ color: "#6b7280" }}>Chargement…</div>;
  if (!members.length) return <div style={{ color: "#6b7280" }}>Aucun membre.</div>;

  return (
    <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
      {members.map((m) => (
        <div key={m.userId ?? m.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 12, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 999, background: "#378ADD", color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, flexShrink: 0 }}>
              {getInitials(m.fullName)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#111827" }}>{m.fullName}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{m.email || "—"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: isChef(m.role) ? "rgba(55,138,221,0.12)" : "rgba(107,114,128,0.12)", color: isChef(m.role) ? "#378ADD" : "#6b7280", fontWeight: 700, fontSize: 12, padding: "5px 10px", borderRadius: 999 }}>
              {isChef(m.role) ? "Chef de projet" : "Membre"}
            </span>
            {canManage && !isSelf(m) && (
              <button type="button" onClick={() => setConfirmMember(m)} style={{ border: "none", borderRadius: 10, background: "rgba(226,75,74,0.12)", color: "#E24B4A", padding: "8px 12px", cursor: "pointer", fontWeight: 700 }}>
                Retirer
              </button>
            )}
          </div>
        </div>
      ))}

      {confirmMember && (
        <div className="modal-overlay" onClick={() => !removing && setConfirmMember(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirmation</h2>
            <p style={{ color: "#6b7280" }}>Retirer <strong style={{ color: "#111827" }}>{confirmMember.fullName}</strong> du projet ?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
              <button type="button" onClick={() => setConfirmMember(null)} disabled={removing} style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, background: "#fff", padding: "10px 14px", cursor: "pointer", fontWeight: 700 }}>Annuler</button>
              <button type="button" onClick={removeMember} disabled={removing} style={{ border: "none", borderRadius: 10, background: "#E24B4A", color: "#fff", padding: "10px 14px", cursor: removing ? "not-allowed" : "pointer", fontWeight: 700, opacity: removing ? 0.7 : 1 }}>
                {removing ? "Retrait…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberList;