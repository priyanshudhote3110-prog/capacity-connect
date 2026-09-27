/**
 * notificationController.js - Central Notification Dispatch & Audit Logger
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 */

const db = require("../database.js");
const notificationService = require("../services/notificationService.js");

class NotificationController {
  /**
   * POST /api/admin/notifications/send
   */
  async dispatchNotification(req, res) {
    try {
      const {
        targetType = "all",           // "all", "institute", "selected", "competency_deficit"
        targetInstitute = "ALL",
        selectedEmployeeIds = [],
        channels = { email: true, whatsapp: true },
        category = "BROADCAST",
        subject,
        message,
        actionUrl = "https://capacityconnect.gov.in/#courses"
      } = req.body;

      if (!subject || !message) {
        return res.status(400).json({
          success: false,
          error: "Notification subject and message body are mandatory."
        });
      }

      const allEmployees = db.data.employees || [];
      let recipients = [];

      // 1. Resolve Target Recipients
      if (targetType === "selected" && Array.isArray(selectedEmployeeIds) && selectedEmployeeIds.length > 0) {
        recipients = allEmployees.filter(e => selectedEmployeeIds.includes(e.id));
      } else if (targetType === "institute" && targetInstitute && targetInstitute !== "ALL") {
        recipients = allEmployees.filter(e => e.institute === targetInstitute);
      } else {
        // "all" or "competency_deficit"
        recipients = [...allEmployees];
      }

      if (recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No active employees found matching the target criteria."
        });
      }

      if (!db.data.notification_logs) db.data.notification_logs = [];

      const metrics = {
        targetedEmployees: recipients.length,
        emailsAttempted: 0,
        emailsDelivered: 0,
        emailsOptedOut: 0,
        whatsAppAttempted: 0,
        whatsAppDelivered: 0,
        whatsAppOptedOut: 0,
        failed: 0,
        samplePreviews: []
      };

      const batchId = `bch_${Date.now().toString(36)}`;

      // 2. Dispatch Pipeline (Checking Toggles for each employee)
      for (const emp of recipients) {
        // --- EMAIL CHANNEL ---
        if (channels.email) {
          if (emp.email_notify) {
            metrics.emailsAttempted++;
            try {
              const mailRes = await notificationService.sendEmail({
                to: emp.email,
                recipientName: emp.name,
                subject,
                message,
                actionUrl,
                category
              });

              if (mailRes.success) {
                metrics.emailsDelivered++;
                db.data.notification_logs.unshift({
                  id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  batchId,
                  employeeId: emp.id,
                  employeeName: emp.name,
                  institute: emp.institute,
                  channel: "EMAIL",
                  category,
                  recipientAddress: emp.email,
                  subject,
                  status: "DELIVERED",
                  providerMessageId: mailRes.messageId,
                  sentAt: new Date().toISOString()
                });
              } else {
                metrics.failed++;
                db.data.notification_logs.unshift({
                  id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  batchId,
                  employeeId: emp.id,
                  employeeName: emp.name,
                  institute: emp.institute,
                  channel: "EMAIL",
                  category,
                  recipientAddress: emp.email,
                  subject,
                  status: "FAILED",
                  errorReason: mailRes.error,
                  sentAt: new Date().toISOString()
                });
              }
            } catch (mErr) {
              metrics.failed++;
            }
          } else {
            // Email Opted-Out
            metrics.emailsOptedOut++;
            db.data.notification_logs.unshift({
              id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              batchId,
              employeeId: emp.id,
              employeeName: emp.name,
              institute: emp.institute,
              channel: "EMAIL",
              category,
              recipientAddress: emp.email,
              subject,
              status: "OPTED_OUT",
              sentAt: new Date().toISOString()
            });
          }
        }

        // --- WHATSAPP CHANNEL ---
        if (channels.whatsapp) {
          if (emp.whatsapp_notify) {
            metrics.whatsAppAttempted++;
            try {
              const waRes = await notificationService.sendWhatsApp({
                to: emp.phone,
                recipientName: emp.name,
                subject,
                message,
                actionUrl,
                category
              });

              if (waRes.success) {
                metrics.whatsAppDelivered++;
                if (metrics.samplePreviews.length < 2 && waRes.messagePreview) {
                  metrics.samplePreviews.push({
                    recipient: emp.name,
                    phone: emp.phone,
                    preview: waRes.messagePreview
                  });
                }
                db.data.notification_logs.unshift({
                  id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  batchId,
                  employeeId: emp.id,
                  employeeName: emp.name,
                  institute: emp.institute,
                  channel: "WHATSAPP",
                  category,
                  recipientAddress: emp.phone,
                  subject,
                  status: "DELIVERED",
                  providerMessageId: waRes.messageId,
                  isSandbox: Boolean(waRes.isSandbox),
                  sentAt: new Date().toISOString()
                });
              } else {
                metrics.failed++;
                db.data.notification_logs.unshift({
                  id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  batchId,
                  employeeId: emp.id,
                  employeeName: emp.name,
                  institute: emp.institute,
                  channel: "WHATSAPP",
                  category,
                  recipientAddress: emp.phone,
                  subject,
                  status: "FAILED",
                  errorReason: waRes.error,
                  sentAt: new Date().toISOString()
                });
              }
            } catch (wErr) {
              metrics.failed++;
            }
          } else {
            // WhatsApp Opted-Out
            metrics.whatsAppOptedOut++;
            db.data.notification_logs.unshift({
              id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              batchId,
              employeeId: emp.id,
              employeeName: emp.name,
              institute: emp.institute,
              channel: "WHATSAPP",
              category,
              recipientAddress: emp.phone,
              subject,
              status: "OPTED_OUT",
              sentAt: new Date().toISOString()
            });
          }
        }
      }

      // Save persistent database state
      db.save();

      return res.status(200).json({
        success: true,
        batchId,
        message: `Notification batch '${batchId}' dispatched successfully.`,
        metrics,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("[NotificationController Error]:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/admin/notifications/logs
   */
  async getLogs(req, res) {
    try {
      const logs = db.data.notification_logs || [];
      const channel = req.query.channel;
      const category = req.query.category;
      const limit = parseInt(req.query.limit, 10) || 50;

      let filtered = [...logs];
      if (channel && channel !== "ALL") {
        filtered = filtered.filter(l => l.channel === channel);
      }
      if (category && category !== "ALL") {
        filtered = filtered.filter(l => l.category === category);
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        total: logs.length,
        logs: filtered.slice(0, limit)
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new NotificationController();
