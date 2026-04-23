import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Settings.css';

function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profil, setProfil] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
  });

  const [password, setPassword] = useState({
    actuel: '',
    nouveau: '',
    confirmer: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
  });

  const [theme, setTheme] = useState('clair');
  const [profilMsg, setProfilMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfilSubmit = async (e) => {
    e.preventDefault();
    setProfilMsg('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/utilisateurs/${user?.id}/profil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prenom_utilisateur: profil.prenom,
          nom_utilisateur: profil.nom,
          email_utilisateur: profil.email,
        }),
      });
      const data = await res.json();
      if (res.ok) setProfilMsg('Profil mis à jour avec succès');
      else setProfilMsg(data.message || 'Erreur');
    } catch {
      setProfilMsg('Erreur lors de la mise à jour');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (password.nouveau !== password.confirmer) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/utilisateurs/${user?.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          mot_de_passe_actuel: password.actuel,
          nouveau_mot_de_passe: password.nouveau,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg('Mot de passe mis à jour avec succès');
        setPassword({ actuel: '', nouveau: '', confirmer: '' });
      } else {
        setPasswordError(data.message || 'Erreur');
      }
    } catch {
      setPasswordError('Erreur lors du changement de mot de passe');
    }
  };

  return (
      <div className="st-container">

        {/* SIDEBAR */}
        <div className="st-sidebar">
          <div className="st-logo">
            <div className="st-logo-icon">✦</div>
            <span>TaskFlow</span>
          </div>

          <nav className="st-nav">
            <button className="st-nav-item" onClick={() => navigate('/dashboard')}>
              <span>⊞</span> Dashboard
            </button>
            <button className="st-nav-item" onClick={() => navigate('/projects')}>
              <span>▦</span> Projets
            </button>
            <button className="st-nav-item active">
              <span>⚙</span> Paramètres
              <span className="st-nav-dot" />
            </button>
          </nav>

          <button className="st-logout" onClick={handleLogout}>
            <span>↪</span> Déconnexion
          </button>
        </div>

        {/* MAIN */}
        <div className="st-main">

          {/* TOPBAR */}
          <div className="st-topbar">
            <div className="st-search">
              <span>🔍</span>
              <input type="text" placeholder="Rechercher..." />
            </div>
            <div className="st-user">
              <div className="st-user-info">
                <span className="st-user-name">{user?.prenom} {user?.nom}</span>
                <span className="st-user-role">Utilisateur</span>
              </div>
              <div className="st-avatar">{user?.prenom?.[0]}{user?.nom?.[0]}</div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="st-content">
            <h1 className="st-title">Paramètres</h1>
            <p className="st-subtitle">Gérez vos préférences et paramètres de compte</p>

            {/* PROFIL */}
            <div className="st-section">
              <div className="st-section-header">
                <div className="st-section-icon" style={{ background: '#4da3ff' }}>👤</div>
                <div>
                  <h2>Profil</h2>
                  <p>Gérez vos informations personnelles</p>
                </div>
              </div>

              <form onSubmit={handleProfilSubmit}>
                <div className="st-form-row">
                  <div className="st-field">
                    <label>Prénom</label>
                    <input
                        type="text"
                        value={profil.prenom}
                        onChange={e => setProfil({ ...profil, prenom: e.target.value })}
                    />
                  </div>
                  <div className="st-field">
                    <label>Nom</label>
                    <input
                        type="text"
                        value={profil.nom}
                        onChange={e => setProfil({ ...profil, nom: e.target.value })}
                    />
                  </div>
                </div>
                <div className="st-field">
                  <label>Email</label>
                  <input
                      type="email"
                      value={profil.email}
                      onChange={e => setProfil({ ...profil, email: e.target.value })}
                  />
                </div>
                <div className="st-roles-info">
                  <span>ℹ</span>
                  <p>Vos rôles (Chef de projet ou Membre) sont définis au niveau de chaque projet, pas au niveau global du compte.</p>
                </div>
                {profilMsg && <div className="st-success">{profilMsg}</div>}
                <button type="submit" className="st-btn">Enregistrer les modifications</button>
              </form>
            </div>

            {/* SECURITE */}
            <div className="st-section">
              <div className="st-section-header">
                <div className="st-section-icon" style={{ background: '#34d399' }}>🔒</div>
                <div>
                  <h2>Sécurité</h2>
                  <p>Gérez votre mot de passe et vos paramètres de sécurité</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="st-field">
                  <label>Mot de passe actuel</label>
                  <input
                      type="password"
                      value={password.actuel}
                      onChange={e => setPassword({ ...password, actuel: e.target.value })}
                      required
                  />
                </div>
                <div className="st-form-row">
                  <div className="st-field">
                    <label>Nouveau mot de passe</label>
                    <input
                        type="password"
                        value={password.nouveau}
                        onChange={e => setPassword({ ...password, nouveau: e.target.value })}
                        required
                    />
                  </div>
                  <div className="st-field">
                    <label>Confirmer le mot de passe</label>
                    <input
                        type="password"
                        value={password.confirmer}
                        onChange={e => setPassword({ ...password, confirmer: e.target.value })}
                        required
                    />
                  </div>
                </div>
                {passwordError && <div className="st-error">{passwordError}</div>}
                {passwordMsg && <div className="st-success">{passwordMsg}</div>}
                <button type="submit" className="st-btn">Changer le mot de passe</button>
              </form>
            </div>

            {/* NOTIFICATIONS */}
            <div className="st-section">
              <div className="st-section-header">
                <div className="st-section-icon" style={{ background: '#a78bfa' }}>🔔</div>
                <div>
                  <h2>Notifications</h2>
                  <p>Choisissez comment vous souhaitez être notifié</p>
                </div>
              </div>

              <div className="st-toggle-row">
                <div>
                  <p className="st-toggle-label">Notifications par email</p>
                  <p className="st-toggle-sub">Recevez des notifications par email</p>
                </div>
                <div
                    className={`st-toggle ${notifications.email ? 'active' : ''}`}
                    onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                />
              </div>

              <div className="st-toggle-row">
                <div>
                  <p className="st-toggle-label">Notifications push</p>
                  <p className="st-toggle-sub">Recevez des notifications sur le navigateur</p>
                </div>
                <div
                    className={`st-toggle ${notifications.push ? 'active' : ''}`}
                    onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Settings;