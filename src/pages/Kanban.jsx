import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemberList from '../components/MemberList';
import '../styles/Dashboard.css'; // Reuse dashboard styles for layout if needed

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const parseJwt = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=")));
  } catch { return null; }
};

function Kanban() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProjectAndRole = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Simuler ou récupérer les infos du projet et le rôle
        // Idéalement on ferait un appel à GET /api/projets/:id
        const response = await fetch(`${API_BASE_URL}/api/projets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProject(data.projet || data);
          // Le back devrait nous dire le rôle, sinon on le déduit des membres
          const user = parseJwt(token);
          const membresRes = await fetch(`${API_BASE_URL}/api/projets/${id}/membres`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (membresRes.ok) {
            const membresData = await membresRes.json();
            const membresList = membresData.membres || membresData.data || membresData;
            const myMembership = membresList.find(m => 
              String(m.Id_utilisateur || m.userId || m.id) === String(user?.id || user?.userId)
            );
            if (myMembership) {
              setRole(myMembership.role || myMembership.role_projet);
            }
          }
        }
      } catch (error) {
        console.error("Erreur chargement projet", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProjectAndRole();
  }, [id]);

  const isChef = String(role || "").toLowerCase().includes("chef");

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteMessage(null);
    if (!inviteEmail) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/projets/${id}/membres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await response.json();
      if (response.ok) {
        setInviteMessage({ type: 'success', text: "Membre invité avec succès !" });
        setInviteEmail('');
        // Pour rafraîchir la liste, on pourrait utiliser une clé sur MemberList ou re-fetch
      } else {
        setInviteMessage({ type: 'error', text: data.message || "Erreur lors de l'invitation" });
      }
    } catch (error) {
      setInviteMessage({ type: 'error', text: "Erreur réseau" });
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        navigate('/dashboard');
      } else {
        alert("Erreur lors de la suppression du projet");
        setDeleting(false);
      }
    } catch (error) {
      alert("Erreur réseau");
      setDeleting(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Chargement du projet...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Projet : {project?.titre || "Sans nom"}</h1>
        {isChef && (
          <button 
            onClick={() => setShowDeleteModal(true)}
            style={{ background: '#E24B4A', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Supprimer le projet
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 40 }}>
        {/* Colonne de gauche: Kanban / Tâches (Mock) */}
        <div style={{ flex: 2 }}>
          <div style={{ background: '#f3f4f6', padding: 20, borderRadius: 12, minHeight: 400 }}>
            <h2>Tableau Kanban</h2>
            <p style={{ color: '#6b7280' }}>Zone des tâches (à implémenter)</p>
          </div>
        </div>

        {/* Colonne de droite: Gestion des membres */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <h3>Inviter un membre</h3>
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <input 
                type="email" 
                placeholder="Email de l'utilisateur" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
                required
              />
              <button 
                type="submit"
                style={{ background: '#378ADD', color: 'white', border: 'none', padding: 10, borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
              >
                Inviter
              </button>
            </form>
            {inviteMessage && (
              <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: inviteMessage.type === 'success' ? '#d1fae5' : '#fee2e2', color: inviteMessage.type === 'success' ? '#065f46' : '#991b1b', fontSize: 14 }}>
                {inviteMessage.text}
              </div>
            )}
          </div>

          <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <h3>Membres du projet</h3>
            <MemberList projectId={id} onToast={(type, msg) => alert(msg)} />
          </div>

        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal" style={{ background: 'white', padding: 24, borderRadius: 12, maxWidth: 400, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Supprimer le projet ?</h2>
            <p style={{ color: '#4b5563' }}>Êtes-vous sûr de vouloir supprimer définitivement le projet <strong>{project?.titre}</strong> ? Cette action est irréversible et supprimera toutes les tâches associées.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteProject}
                disabled={deleting}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#E24B4A', color: 'white', cursor: deleting ? 'not-allowed' : 'pointer' }}
              >
                {deleting ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Kanban;
