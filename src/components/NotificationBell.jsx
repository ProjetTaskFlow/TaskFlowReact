import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getNotificationId = (notification) =>
  notification?.id ??
  notification?.Id_notification ??
  notification?.id_notification ??
  notification?.notificationId;

const isNotificationRead = (notification) =>
  Boolean(
    notification?.read ??
      notification?.lu ??
      notification?.lue ??
      notification?.is_read ??
      notification?.isRead ??
      notification?.est_lu,
  );

const getInitials = (value) => {
  const cleaned = String(value || "").trim();
  if (!cleaned) return "TF";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = (parts[1]?.[0] || parts[0]?.[1] || "").trim();
  return (first + second).toUpperCase() || "TF";
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function NotificationBell() {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const list = data?.notifications ?? data?.notifs ?? data?.data ?? data ?? [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const unreadCount = notifications.reduce((count, n) => (isNotificationRead(n) ? count : count + 1), 0);

  const markRead = useCallback(async (notification) => {
    const id = getNotificationId(notification);
    if (!id) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => {
          const nid = getNotificationId(n);
          if (String(nid) !== String(id)) return n;
          return { ...n, read: true, lu: true, lue: true, is_read: true, isRead: true, est_lu: true };
        }),
      );
    } catch (error) {
      console.error("Erreur marquer notification lue:", error);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, lu: true, lue: true, is_read: true, isRead: true, est_lu: true })),
      );
    } catch (error) {
      console.error("Erreur tout marquer comme lu:", error);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#fff",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 17H9m8-6V9a5 5 0 10-10 0v2c0 3-1 4-2 5h14c-1-1-2-2-2-5Z"
            stroke="#378ADD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 19a2 2 0 004 0"
            stroke="#378ADD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {unreadCount > 0 ? (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 999,
              background: "#E24B4A",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              lineHeight: 1,
            }}
          >
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 48,
            width: 360,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            boxShadow: "0 14px 40px rgba(0,0,0,0.14)",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 12px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              background: "#f9fafb",
            }}
          >
            <div style={{ fontWeight: 800, color: "#111827" }}>Notifications</div>
            <button
              type="button"
              onClick={markAllRead}
              style={{
                border: "none",
                background: "transparent",
                color: "#378ADD",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Tout marquer comme lu
            </button>
          </div>

          <div style={{ maxHeight: 360, overflow: "auto" }}>
            {loading ? (
              <div style={{ padding: 12, color: "#6b7280" }}>Chargement…</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 12, color: "#6b7280" }}>Aucune notification.</div>
            ) : (
              notifications.map((n) => {
                const id = getNotificationId(n);
                const read = isNotificationRead(n);
                const title = n?.titre ?? n?.title ?? n?.type ?? "Notification";
                const message = n?.message ?? n?.contenu ?? n?.content ?? "";
                const createdAt = n?.created_at ?? n?.createdAt ?? n?.date ?? n?.timestamp;
                const initials = getInitials(n?.auteur ?? n?.from_name ?? n?.from ?? n?.user ?? title);

                return (
                  <button
                    key={id ?? `${title}-${String(createdAt)}`}
                    type="button"
                    onClick={() => markRead(n)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: read ? "#fff" : "rgba(55,138,221,0.06)",
                      cursor: "pointer",
                      padding: 12,
                      display: "grid",
                      gridTemplateColumns: "36px 1fr 10px",
                      gap: 10,
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        background: "#378ADD",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                      aria-hidden="true"
                    >
                      {initials}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, color: "#111827", marginBottom: 2 }}>{title}</div>
                      {message ? <div style={{ color: "#6b7280", fontSize: 13 }}>{message}</div> : null}
                      <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 6 }}>{formatDateTime(createdAt)}</div>
                    </div>

                    {!read ? (
                      <span
                        aria-label="Non lue"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: "#E24B4A",
                          marginTop: 6,
                          justifySelf: "end",
                        }}
                      />
                    ) : (
                      <span />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;

