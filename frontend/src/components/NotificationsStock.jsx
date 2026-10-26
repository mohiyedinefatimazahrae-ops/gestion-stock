
import { useCallback, useEffect, useState } from "react";
import {
    getNotificationsStock,
    marquerNotificationLue,
    marquerToutesLues,
} from "../api/notificationsStockApi";

export default function NotificationsStock({ onOpenProduct }) {
    const [ouvert, setOuvert] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [nonLues, setNonLues] = useState(0);
    const [erreur, setErreur] = useState("");
    const [chargement, setChargement] = useState(false);

    const chargerNotifications = useCallback(async () => {
        try {
            const data = await getNotificationsStock();

            setNotifications(data.notifications ?? []);
            setNonLues(Number(data.non_lues ?? 0));
            setErreur("");
        } catch (error) {
            setErreur("Impossible de charger les notifications.");
        }
    }, []);

    useEffect(() => {
        chargerNotifications();

        const interval = setInterval(() => {
            chargerNotifications();
        }, 15000);

        return () => clearInterval(interval);
    }, [chargerNotifications]);

    async function lireNotification(notification) {
        try {
            setChargement(true);

            if (!notification.lu) {
                await marquerNotificationLue(notification.id);
            }

            setOuvert(false);

            if (notification.produit_id) {
                onOpenProduct(notification.produit_id);
            }

            await chargerNotifications();
        } catch (error) {
            setErreur("Impossible de traiter cette notification.");
        } finally {
            setChargement(false);
        }
    }

    async function toutLire() {
        try {
            setChargement(true);
            await marquerToutesLues();
            await chargerNotifications();
        } catch (error) {
            setErreur("Impossible de marquer les notifications comme lues.");
        } finally {
            setChargement(false);
        }
    }

    function formaterDate(date) {
        if (!date) return "";

        return new Date(date).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div className="notifications-container">
            <button
                type="button"
                className="notifications-bell"
                onClick={() => setOuvert((valeur) => !valeur)}
                aria-label={`Notifications, ${nonLues} non lues`}
                aria-expanded={ouvert}
            >
                <span className="notifications-bell-icon">🔔</span>

                {nonLues > 0 && (
                    <span className="notifications-count">
                        {nonLues > 99 ? "99+" : nonLues}
                    </span>
                )}
            </button>

            {ouvert && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <div>
                            <h3>Notifications</h3>
                            <p>
                                {nonLues} notification(s) non lue(s)
                            </p>
                        </div>

                        {nonLues > 0 && (
                            <button
                                type="button"
                                className="notifications-read-all"
                                onClick={toutLire}
                                disabled={chargement}
                            >
                                Tout lire
                            </button>
                        )}
                    </div>

                    {erreur && (
                        <p className="notifications-error">{erreur}</p>
                    )}

                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <p className="notifications-empty">
                                Aucune notification pour le moment.
                            </p>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    type="button"
                                    key={notification.id}
                                    className={`notification-item ${
                                        !notification.lu
                                            ? "notification-unread"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        lireNotification(notification)
                                    }
                                    disabled={chargement}
                                >
                                    <span className="notification-icon">
                                        📦
                                    </span>

                                    <span className="notification-content">
                                        <strong>
                                            {notification.produit?.nom_prd ??
                                                notification.message}
                                        </strong>

                                        <span>
                                            Stock actuel :{" "}
                                            {notification.qte_stock}
                                            {" · "}
                                            Minimum : {notification.qte_min}
                                        </span>

                                        <small>
                                            {formaterDate(
                                                notification.created_at
                                            )}
                                        </small>
                                    </span>

                                    {!notification.lu && (
                                        <span
                                            className="notification-unread-dot"
                                            aria-label="Non lue"
                                        />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
