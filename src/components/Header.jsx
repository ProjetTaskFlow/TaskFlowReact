import { Link } from 'react-router-dom'
import '../styles/Header.css'
import logo from '../assets/taskflow-logo.svg'

function Header() {
  return (
    <header className="tf-header">
      <div className="tf-header__inner">
        <Link to="/" className="tf-brand" aria-label="TaskFlow - Accueil">
          <img className="tf-brand__logo" src={logo} alt="Logo TaskFlow" />
          <span className="tf-brand__name">TaskFlow</span>
        </Link>

        <div className="tf-header__actions">
          <Link to="/login" className="tf-btn tf-btn--outline">
            Connexion
          </Link>
          <Link to="/register" className="tf-btn tf-btn--primary">
            Commencer
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
