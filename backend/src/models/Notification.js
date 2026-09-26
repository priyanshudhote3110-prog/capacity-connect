/**
 * Notification.js - User Notification Model
 */

const { SEED_NOTIFICATIONS } = require("../../database/migrations/001_initial_moes_seed.js");

class NotificationModel {
  constructor() {
    this.notifications = new Map();
    SEED_NOTIFICATIONS.forEach(n => this.notifications.set(n.id, JSON.parse(JSON.stringify(n))));
  }

  findByUserId(userId) {
    let list = Array.from(this.notifications.values());
    if (userId) {
      list = list.filter(n => n.userId === userId || n.userId === "all");
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  markAsRead(notificationId) {
    const notif = this.notifications.get(notificationId);
    if (!notif) return null;
    notif.isRead = true;
    this.notifications.set(notificationId, notif);
    return notif;
  }

  create(data) {
    const id = "notif_" + Date.now().toString(36);
    const newNotif = {
      id,
      userId: data.userId || "all",
      title: data.title,
      message: data.message,
      type: data.type || "system_alert",
      linkUrl: data.linkUrl || "#",
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.set(id, newNotif);
    return newNotif;
  }
}

module.exports = new NotificationModel();
