/**
 * LiveClass.js - Live Classroom Model
 */

const { SEED_LIVE_CLASSES } = require("../../database/migrations/001_initial_moes_seed.js");

class LiveClassModel {
  constructor() {
    this.liveClasses = new Map();
    SEED_LIVE_CLASSES.forEach(l => this.liveClasses.set(l.id, JSON.parse(JSON.stringify(l))));
  }

  findAll(filters = {}) {
    let list = Array.from(this.liveClasses.values());
    if (filters.status) {
      list = list.filter(l => l.status === filters.status);
    }
    if (filters.institute && filters.institute !== "ALL") {
      list = list.filter(l => l.institute === filters.institute);
    }
    // Sort so 'live' is first, then upcoming by start date
    return list.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return new Date(a.scheduledStart) - new Date(b.scheduledStart);
    });
  }

  findById(id) {
    return this.liveClasses.get(id) || null;
  }

  create(data) {
    const id = data.id || "live_" + Date.now().toString(36);
    const newClass = {
      id,
      title: data.title,
      courseId: data.courseId || null,
      courseTitle: data.courseTitle || "Special MoES Live Session",
      trainerId: data.trainerId,
      trainerName: data.trainerName,
      institute: data.institute || "IMD",
      scheduledStart: data.scheduledStart || new Date().toISOString(),
      scheduledEnd: data.scheduledEnd || new Date(Date.now() + 3600000).toISOString(),
      status: data.status || "upcoming",
      streamUrl: data.streamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      attendeesCount: 0,
      liveChat: []
    };
    this.liveClasses.set(id, newClass);
    return newClass;
  }

  updateStatus(id, status) {
    const cls = this.liveClasses.get(id);
    if (!cls) return null;
    cls.status = status;
    this.liveClasses.set(id, cls);
    return cls;
  }

  addChatMessage(id, messageObj) {
    const cls = this.liveClasses.get(id);
    if (!cls) return null;
    cls.liveChat = cls.liveChat || [];
    cls.liveChat.push(messageObj);
    return messageObj;
  }
}

module.exports = new LiveClassModel();
