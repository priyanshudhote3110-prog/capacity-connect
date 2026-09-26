/**
 * liveClassController.js - Live Classroom & Streaming Session Controller
 */

const LiveClassModel = require("../models/LiveClass.js");

class LiveClassController {
  async getAllLiveClasses(req, res) {
    try {
      const { status, institute } = req.query;
      const list = LiveClassModel.findAll({ status, institute });
      return res.status(200).json({
        success: true,
        count: list.length,
        liveClasses: list
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getLiveClassById(req, res) {
    try {
      const { id } = req.params;
      const liveClass = LiveClassModel.findById(id);
      if (!liveClass) {
        return res.status(404).json({ success: false, error: "Live session not found" });
      }
      return res.status(200).json({
        success: true,
        liveClass
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async createLiveClass(req, res) {
    try {
      const data = req.body;
      if (!data.title) {
        return res.status(400).json({ success: false, error: "Session title is required" });
      }

      if (req.user) {
        data.trainerId = req.user.id;
        data.trainerName = req.user.name;
        data.institute = data.institute || req.user.institute;
      }

      const newSession = LiveClassModel.create(data);
      return res.status(201).json({
        success: true,
        message: "Live class scheduled successfully",
        liveClass: newSession
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'live', 'ended', 'upcoming'
      if (!status) {
        return res.status(400).json({ success: false, error: "Status is required" });
      }

      const updated = LiveClassModel.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Live session not found" });
      }

      return res.status(200).json({
        success: true,
        message: `Session status updated to ${status}`,
        liveClass: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async postChatMessage(req, res) {
    try {
      const { id } = req.params;
      const { message, senderName, role } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: "Message cannot be empty" });
      }

      const messageObj = {
        id: "msg_" + Date.now().toString(36),
        senderId: req.user ? req.user.id : "usr_guest",
        senderName: req.user ? `${req.user.name} (${req.user.institute})` : (senderName || "Learner"),
        role: req.user ? req.user.role : (role || "employee"),
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const added = LiveClassModel.addChatMessage(id, messageObj);
      if (!added) {
        return res.status(404).json({ success: false, error: "Live session not found" });
      }

      return res.status(200).json({
        success: true,
        message: messageObj
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new LiveClassController();
