import { Link } from 'react-router-dom'
import '../styles/Footer.css'
import logo from '../assets/taskflow-logo.png'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="tf-footer" aria-label="TaskFlow - Footer">
      <div className="tf-footer__ctaArea">
        <div className="tf-footer__inner">
          <h2 className="tf-footer__title">Prêt à booster votre productivité ?</h2>
          <p className="tf-footer__text">Rejoignez des milliers d'équipes qui font confiance à TaskFlow</p>

          <Link to="/register" className="tf-btn tf-btn--light tf-footer__cta">
            Démarrer maintenant <span aria-hidden="true">➔</span>
          </Link>
        </div>
      </div>

      <div className="tf-footer__bar">
        <div className="tf-footer__barInner">
          <Link to="/" className="tf-footer__brand" aria-label="TaskFlow - Accueil">
           <img className="tf-brand__logo" src={logo} alt="Logo TaskFlow" />
          </Link>

          <div className="tf-footer__legal">© {year} TaskFlow. Tous droits réservés.</div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
