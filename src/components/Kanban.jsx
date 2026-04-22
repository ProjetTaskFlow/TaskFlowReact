import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Kanban.css";

const STATUS = [
  { key: "a_faire", label: "A faire", color: "#2C3E50"},
  { key: "en_cours", label: "En cours", color: "#FF8C00"},
  { key: "termine", label: "Terminé", color: "#27AE60"}
];

function Kanban({ idProjet}) {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [draggingOver, setDraggingOver] = useState(null);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Chargement des tâches
  useEffect(() => {
    fetchTaches();
  }, [idProjet]);

  const fetchTaches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/taches${idProjet ? `?idProjet=${idProjet}` : ""}`);
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des tâches")
      };
      const data = await res.json();
      setTaches(data);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches: ", error);
      setError((error.message))
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>Ceci est le composant Kanban</div>
  );
}
export default Kanban;
