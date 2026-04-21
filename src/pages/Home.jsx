import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import '../styles/Home.css';

import {
  LayoutList,
  Users,
  Zap,
  BarChart,
  ArrowRight
} from 'lucide-react';

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
              <ArrowRight
                className="tf-btn__icon"
                size={18}
                strokeWidth={2.6}
              />
            </Link>

            <Link to="/kanbanDemo" className="tf-btn tf-btn--outline tf-btn--hero">
              Voir une démo
            </Link>
          </div>
        </div>
      </section>

      <section className="tf-features">
        <div className="tf-features__inner">
          <h2 className="tf-features__title">Tout ce dont vous avez besoin</h2>
          <p className="tf-features__subtitle">
            Des fonctionnalités puissantes pour une gestion de projet efficace
          </p>

          <div className="tf-featureGrid">

            <article className="tf-card">
              <div className="tf-card__icon">
                <LayoutList size={22} strokeWidth={2.4} color="white" />
              </div>
              <div className="tf-card__content">
                <h3 className="tf-card__title">Gestion Kanban intuitive</h3>
                <p className="tf-card__text">
                  Organisez vos tâches en colonnes personnalisables avec un système de glisser-déposer fluide et réactif.
                </p>
              </div>
            </article>

            <article className="tf-card">
              <div className="tf-card__icon">
                <Users size={22} strokeWidth={2.4} color="white" />
              </div>
              <div className="tf-card__content">
                <h3 className="tf-card__title">Collaboration en temps réel</h3>
                <p className="tf-card__text">
                  Travaillez en équipe, assignez des tâches et suivez la progression de chaque membre.
                </p>
              </div>
            </article>

            <article className="tf-card">
              <div className="tf-card__icon">
                <Zap size={22} strokeWidth={2.4} color="white" />
              </div>
              <div className="tf-card__content">
                <h3 className="tf-card__title">Productivité optimisée</h3>
                <p className="tf-card__text">
                  Gagnez du temps avec des workflows automatisés et des notifications intelligentes.
                </p>
              </div>
            </article>

            <article className="tf-card">
              <div className="tf-card__icon">
                <BarChart size={22} strokeWidth={2.4} color="white" />
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
  );
}
<<<<<<< HEAD
=======

>>>>>>> origin/main
export default Home;