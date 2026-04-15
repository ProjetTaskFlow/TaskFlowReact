# TaskFlow Front-end

Interface React de l'application de gestion de projet qui se nomme TaskFlow, communiquant avec l'API REST.

## Prérequis

- Node.js v18+
- npm
- Une API back-end fonctionnelle


## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

## Quickstart

```bash
# 1. Cloner le depot
git clone https://github.com/ProjetTaskFlow/TaskFlowReact
cd taskflow

# 2. Installer les dependances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Editer .env et renseigner les variables necessaires

# 4. Lancer le serveur de developpement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

## Variables d'environnement

VITE_API_URL=http://localhost:3000

## Scripts disponibles

| Commande          | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Lancer le serveur de developpement |
| `npm run build`   | Construire le projet pour la prod  |
| `npm run preview` | Previsualiser le build de prod     |
| `npm run lint`    | Lancer ESLint sur le projet        |

## Exemples d'utilisation

| URL                           | Description      |
|-------------------------------|------------------|
| `http://localhost:5173/`      | Page d'accueil   |
| `http://localhost:5173/login` | Formulaire de connexion |
| `http://localhost:5173/dashboard` | Tableau de bord  |


## Structure


```
src/
├── components/            
│   └── Footer.jsx
│   └── Navbar.jsx
│   └── Dashboard.jsx
├── context/        
│   └── AuthContext.jsx
├── pages/            
│   └── Project.jsx
│   └── Kanban.jsx
│   └── Home.jsx
│   └── Login.jsx
│   └── Settings.jsx
│   └── Register.jsx
├── styles/
│   └── index.css
├── App.jsx            
└── main.jsx           
```

## Stack technique

- **React**
- **Vite**
- **react-dom**
- **react-router-dom**