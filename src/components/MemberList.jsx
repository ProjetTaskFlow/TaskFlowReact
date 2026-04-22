import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const parseJwt = (token) => {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  const payload = parseJwt(token);
  if (!payload) return { id: null, email: null };
  return {
    id: payload?.id ?? payload?.userId ?? payload?.Id_utilisateur ?? payload?.IdUtilisateur ?? payload?.sub ?? null,
    email: payload?.email ?? payload?.email_utilisateur ?? payload?.mail ?? null,
  };
};

const getInitials = (value) => {
  const cleaned = String(value || "").trim();
  if (!cleaned) return "??";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = (parts[1]?.[0] || parts[0]?.[1] || "").trim();
  return (first + second).toUpperCase() || "??";
};

const normalizeMember = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const userId = raw.Id_utilisateur ?? raw.id ?? raw.userId ?? raw.IdUser ?? raw.IdUtilisateur;
  const firstName = raw.prenom_utilisateur ?? raw.prenom ?? raw.first_name ?? raw.firstName ?? "";
  const lastName = raw.nom_utilisateur ?? raw.nom ?? raw.last_name ?? raw.lastName ?? "";
  const email = raw.email_utilisateur ?? raw.email ?? raw.mail ?? "";
  const role = raw.role ?? raw.role_projet ?? raw.role_membre ?? raw.role_utilisateur ?? raw.projet_role ?? "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    raw.nom_complet ||
    raw.name ||
    email ||
    "Utilisateur";

  return { ...raw, userId, fullName, email, role };
};

const isChefDeProjet = (value) => {
  const role = String(value || "").toLowerCase();
  return role.includes("chef") || role.includes("admin");
};

function MemberList({ projectId, onToast }) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [currentRole, setCurrentRole] = useState("");
  const [confirmMember, setConfirmMember] = useState(null);
  const [removing, setRemoving] = useState(false);

  const currentUser = getCurrentUser();

  const isSelf = useCallback(
    (member) => {
      if (!member) return false;
      if (currentUser.id && member.userId && String(member.userId) === String(currentUser.id)) return true;
      if (
        currentUser.email &&
        member.email &&
        String(member.email).toLowerCase() === String(currentUser.email).toLowerCase()
      )
        return true;
      return false;
    },
    [currentUser.email, currentUser.id],
  );

  const canManageMembers = (() => {
    if (isChefDeProjet(currentRole)) return true;
    const me = members.find((m) => isSelf(m));
    return isChefDeProjet(me?.role) || String(me?.role || "").toLowerCase().includes("admin");
  })();

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projets/${projectId}/membres`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast?.("error", data?.message || "Erreur chargement des membres");
        setMembers([]);
        return;
      }
      const list = data?.membres ?? data?.members ?? data?.data ?? data ?? [];
      const normalized = Array.isArray(list) ? list.map(normalizeMember).filter(Boolean) : [];
      setMembers(normalized);
      setCurrentRole(data?.role ?? data?.currentUserRole ?? data?.userRole ?? "");
    } catch (error) {
      console.error("Erreur chargement membres:", error);
      onToast?.("error", "Erreur réseau lors du chargement des membres");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [onToast, projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const removeMember = useCallback(async () => {
    const member = confirmMember;
    if (!member?.userId) return;
    setRemoving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projets/${projectId}/membres/${member.userId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast?.("error", data?.message || "Erreur lors du retrait du membre");
        return;
      }
      setMembers((prev) => prev.filter((m) => String(m.userId) !== String(member.userId)));
      setConfirmMember(null);
      onToast?.("success", "Membre retiré avec succès");
    } catch (error) {
      console.error("Erreur retrait membre:", error);
      onToast?.("error", "Erreur réseau lors du retrait du membre");
    } finally {
      setRemoving(false);
    }
  }, [confirmMember, onToast, projectId]);

  const closeModal = useCallback(() => {
    if (removing) return;
    setConfirmMember(null);
  }, [removing]);

  return (
    <div style={{ marginTop: 16 }}>
      {loading ? (
        <div style={{ color: "#6b7280" }}>Chargement des membres…</div>
      ) : members.length === 0 ? (
        <div style={{ color: "#6b7280" }}>Aucun membre trouvé.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {members.map((m) => {
            const roleLabel = isChefDeProjet(m.role) ? "Chef de projet" : "Membre";
            const self = isSelf(m);
            const showRemove = canManageMembers && !self;

            return (
              <div
                key={m.userId ?? m.email ?? m.fullName}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: 12,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      background: "#378ADD",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    {getInitials(m.fullName)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.fullName}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.email || "—"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      background: isChefDeProjet(m.role) ? "rgba(55,138,221,0.12)" : "rgba(107,114,128,0.12)",
                      color: isChefDeProjet(m.role) ? "#378ADD" : "#6b7280",
                      fontWeight: 900,
                      fontSize: 12,
                      padding: "5px 10px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {roleLabel}
                  </span>

                  {showRemove ? (
                    <button
                      type="button"
                      onClick={() => setConfirmMember(m)}
                      style={{
                        border: "none",
                        borderRadius: 10,
                        background: "rgba(226,75,74,0.12)",
                        color: "#E24B4A",
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Retirer
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmMember ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirmation</h2>
            <p style={{ color: "#6b7280", margin: "0 0 12px" }}>
              Voulez-vous retirer <strong style={{ color: "#111827" }}>{confirmMember.fullName}</strong> du projet ?
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
              <button
                type="button"
                onClick={closeModal}
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
                onClick={removeMember}
                disabled={removing}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: "#E24B4A",
                  color: "#fff",
                  padding: "10px 14px",
                  cursor: removing ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  opacity: removing ? 0.7 : 1,
                }}
              >
                {removing ? "Retrait..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MemberList;
