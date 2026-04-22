import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/taskflow-logo.png';
import { useAuth } from '../context/AuthContext';

function Header() {
  const location = useLocation();
  const { user } = useAuth();

  const pathname = (location?.pathname || '').toLowerCase();
  const isAuthenticated = Boolean(user?.token);
  const hideAuthButtons =
    isAuthenticated &&
    (pathname.startsWith('/settings') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/project') ||
      pathname.startsWith('/projects'));

  return (
    <header className="tf-header">
      <div className="tf-header__inner">

        {/* LEFT */}
        <Link to="/" className="tf-brand" aria-label="TaskFlow - Accueil">
          <img className="tf-brand__logo" src={logo} alt="Logo TaskFlow" />
        </Link>

        {/* RIGHT */}
        {!hideAuthButtons ? (
          <div className="tf-header__actions">
            <Link to="/login" className="tf-btn tf-btn--outline">
              Connexion
            </Link>
            <Link to="/register" className="tf-btn tf-btn--primary">
              Commencer
            </Link>
          </div>
        ) : null}

      </div>
    </header>
  );
}

export default Header;
