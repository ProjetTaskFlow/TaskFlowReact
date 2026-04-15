import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import '../styles/Home.css'

function Home() {
  return (
    <main className="tf-home">
      <section className="tf-hero">
        <div className="tf-hero__inner">
          <div className="tf-hero__badge" aria-label="Kanban - formation PDF disponible">
            <span className="tf-hero__badgeDot" aria-hidden="true" />
            <span>Kanban / Formation PDF disponible</span>
          </div>

          <h1 className="tf-hero__title">
            Gérez vos projets
            <br />
            <span>avec simplicité</span>
          </h1>

          <p className="tf-hero__subtitle">
            TaskFlow transforme votre gestion de projets en une expérience fluide et collaborative. Kanban intuitif,
            suivi en temps réel, et bien plus encore.
          </p>

          <div className="tf-hero__cta">
            <Link to="/register" className="tf-btn tf-btn--primary tf-btn--hero">
              Commencer gratuitement
              <svg
                className="tf-btn__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 12H18"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <path
                  d="M13 7L18 12L13 17"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <Link to="/kanban" className="tf-btn tf-btn--outline tf-btn--hero">
              Voir une démo
            </Link>
          </div>
        </div>
      </section>

      <section className="tf-features">
        <div className="tf-features__inner">
          <h2 className="tf-features__title">Tout ce dont vous avez besoin</h2>
          <p className="tf-features__subtitle">Des fonctionnalités puissantes pour une gestion de projet efficace</p>

          <div className="tf-featureGrid">
            <article className="tf-card">
              <div className="tf-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7H16" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M8 12H14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M8 17H12" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                  <path
                    d="M6.5 4.5H17.5C18.6 4.5 19.5 5.4 19.5 6.5V17.5C19.5 18.6 18.6 19.5 17.5 19.5H6.5C5.4 19.5 4.5 18.6 4.5 17.5V6.5C4.5 5.4 5.4 4.5 6.5 4.5Z"
                    stroke="white"
                    strokeWidth="2.4"
                  />
                </svg>
              </div>
              <div className="tf-card__content">
                <h3 className="tf-card__title">Gestion Kanban intuitive</h3>
                <p className="tf-card__text">
                  Organisez vos tâches en colonnes personnalisables avec un système de glisser-déposer fluide et réactif.
                </p>
              </div>
            </article>

            <article className="tf-card">
              <div className="tf-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16 11C17.7 11 19 9.7 19 8C19 6.3 17.7 5 16 5C14.3 5 13 6.3 13 8C13 9.7 14.3 11 16 11Z"
                    stroke="white"
                    strokeWidth="2.4"
                  />
                  <path
                    d="M8 12C9.7 12 11 10.7 11 9C11 7.3 9.7 6 8 6C6.3 6 5 7.3 5 9C5 10.7 6.3 12 8 12Z"
                    stroke="white"
                    strokeWidth="2.4"
                  />
                  <path
                    d="M13.5 19C13.5 16.9 14.8 15.2 16.6 14.5C17.5 14.1 18.5 14 19.4 14.3C20.9 14.8 22 16.3 22 18.1V19"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 19C2 16.2 4.2 14 7 14H9C10.2 14 11.4 14.4 12.3 15.1"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="tf-card__content">
                <h3 className="tf-card__title">Collaboration en temps réel</h3>
                <p className="tf-card__text">
                  Travaillez en équipe, assignez des tâches et suivez la progression de chaque membre.
                </p>
              </div>
            </article>

            <article className="tf-card">
              <div className="tf-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13 2L4 14H12L11 22L20 10H12L13 2Z"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="tf-card__content">
                <h3 className="tf-card__title">Productivité optimisée</h3>
                <p className="tf-card__text">
                  Gagnez du temps avec des workflows automatisés et des notifications intelligentes.
                </p>
              </div>
            </article>

            <article className="tf-card">
              <div className="tf-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 19V10" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M12 19V5" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M19 19V13" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="tf-card__content">
                <h3 className="tf-card__title">Suivi et analytics</h3>
                <p className="tf-card__text">
                  Visualisez la progression, exportez des rapports et prenez de meilleures décisions.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default Home
