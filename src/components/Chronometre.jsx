import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatHHMMSS = (totalSeconds) => {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatHoursMinutes = (totalSeconds) => {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h <= 0 && m <= 0) return "0min";
  if (h <= 0) return `${m}min`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}min`;
};

const extractTotalSeconds = (data) => {
  if (!data) return 0;
  if (typeof data.total_seconds === "number") return data.total_seconds;
  if (typeof data.totalSeconds === "number") return data.totalSeconds;
  if (typeof data.duree_secondes === "number") return data.duree_secondes;
  if (Array.isArray(data.temps)) {
    return data.temps.reduce((sum, t) => sum + (Number(t?.duree_secondes) || 0), 0);
  }
  if (Array.isArray(data.times)) {
    return data.times.reduce((sum, t) => sum + (Number(t?.duree_secondes) || 0), 0);
  }
  return 0;
};

function Chronometre({ taskId, onToast }) {
  const [running, setRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;

    const fetchTotal = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/taches/${taskId}/temps`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        if (!cancelled) setTotalSeconds(extractTotalSeconds(data));
      } catch (error) {
        console.error("Erreur chargement temps tâche:", error);
      }
    };

    fetchTotal();
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  useEffect(() => {
    if (!running) return;
    const intervalId = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(intervalId);
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);

  const stop = useCallback(() => {
    setRunning(false);
    if (elapsedSeconds > 0) setShowSaveModal(true);
  }, [elapsedSeconds]);

  const closeModal = useCallback(() => {
    setShowSaveModal(false);
    setElapsedSeconds(0);
  }, []);

  const saveTime = useCallback(async () => {
    if (!taskId || elapsedSeconds <= 0) return;

    try {
      const token = localStorage.getItem("token");
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(`${API_BASE_URL}/api/taches/${taskId}/temps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ duree_secondes: elapsedSeconds, date: today }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast?.("error", data?.message || "Erreur lors de l'enregistrement du temps");
        return;
      }

      setTotalSeconds((prev) => prev + elapsedSeconds);
      setElapsedSeconds(0);
      setShowSaveModal(false);
      onToast?.("success", "Temps enregistré");
    } catch (error) {
      console.error("Erreur enregistrement temps tâche:", error);
      onToast?.("error", "Erreur réseau lors de l'enregistrement du temps");
    }
  }, [elapsedSeconds, onToast, taskId]);

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#111827" }}>
          {formatHHMMSS(elapsedSeconds)}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {!running ? (
            <button
              type="button"
              onClick={start}
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                background: "#fff",
                padding: "6px 10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ▶ Démarrer
            </button>
          ) : (
            <button
              type="button"
              onClick={pause}
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                background: "#fff",
                padding: "6px 10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ⏸ Pause
            </button>
          )}

          <button
            type="button"
            onClick={stop}
            disabled={elapsedSeconds <= 0}
            style={{
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 8,
              background: elapsedSeconds <= 0 ? "rgba(0,0,0,0.04)" : "#fff",
              padding: "6px 10px",
              cursor: elapsedSeconds <= 0 ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            ⏹ Arrêter
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
        Temps total enregistré : <strong style={{ color: "#111827" }}>{formatHoursMinutes(totalSeconds)}</strong>
      </div>

      {showSaveModal ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Enregistrer le temps ?</h2>
            <p style={{ color: "#6b7280", margin: "0 0 12px" }}>
              Temps total : <strong style={{ color: "#111827" }}>{formatHHMMSS(elapsedSeconds)}</strong>
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
                onClick={saveTime}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: "#378ADD",
                  color: "#fff",
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Chronometre;

