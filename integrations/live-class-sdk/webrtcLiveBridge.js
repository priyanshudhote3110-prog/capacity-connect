/**
 * webrtcLiveBridge.js
 * Real-Time WebRTC / Live Class SDK Signaling & Attendance Bridge
 * Capacity Connect LMS (Unacademy / Physics Wallah Interactive Live Class Pattern)
 */

class WebRtcLiveBridge {
  constructor() {
    this.activeRooms = new Map(); // roomId -> { classDetails, participants: Map(), chatLog: [], activePoll: null }
  }

  /**
   * Initialize a live classroom room
   */
  createLiveRoom(liveClass) {
    const roomId = liveClass.id;
    if (!this.activeRooms.has(roomId)) {
      this.activeRooms.set(roomId, {
        id: roomId,
        title: liveClass.title,
        trainerId: liveClass.trainerId,
        trainerName: liveClass.trainerName,
        institute: liveClass.institute,
        streamUrl: liveClass.streamUrl,
        status: "live",
        participants: new Map(),
        chatLog: liveClass.liveChat || [],
        handRaises: new Set(),
        activePoll: null,
        startedAt: new Date().toISOString()
      });
    }
    return this.activeRooms.get(roomId);
  }

  /**
   * User joins the live session room
   */
  joinRoom(roomId, user) {
    let room = this.activeRooms.get(roomId);
    if (!room) {
      room = this.createLiveRoom({
        id: roomId,
        title: "Live Interactive Session",
        trainerName: "MoES Faculty",
        institute: "IMD",
        liveChat: []
      });
    }

    const participantInfo = {
      userId: user.id || user.customRoleId || "usr_" + Math.random().toString(36).substring(2, 6),
      name: user.name,
      role: user.role,
      customRoleId: user.customRoleId,
      institute: user.institute,
      joinedAt: new Date().toISOString(),
      handRaised: false
    };

    room.participants.set(participantInfo.userId, participantInfo);

    // Auto system message
    const joinMsg = {
      id: "sys_" + Date.now(),
      senderId: "system",
      senderName: "Classroom Bot",
      role: "system",
      message: `${user.name} (${user.institute}) joined the live class.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    room.chatLog.push(joinMsg);

    return {
      roomId: roomId,
      roomStatus: room.status,
      participantsCount: room.participants.size,
      chatLog: room.chatLog,
      activePoll: room.activePoll
    };
  }

  /**
   * Broadcast a chat message in the live room
   */
  sendChatMessage(roomId, user, messageText) {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      throw new Error("Live room is not currently active");
    }

    const chatMsg = {
      id: "msg_" + Date.now(),
      senderId: user.id || user.customRoleId,
      senderName: user.name,
      role: user.role,
      customRoleId: user.customRoleId,
      message: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.chatLog.push(chatMsg);
    return chatMsg;
  }

  /**
   * Toggle student hand raise
   */
  toggleHandRaise(roomId, userId) {
    const room = this.activeRooms.get(roomId);
    if (!room) return false;

    if (room.handRaises.has(userId)) {
      room.handRaises.delete(userId);
      return false;
    } else {
      room.handRaises.add(userId);
      return true;
    }
  }

  /**
   * Launch a real-time classroom poll (Trainer only)
   */
  createPoll(roomId, question, options = []) {
    const room = this.activeRooms.get(roomId);
    if (!room) throw new Error("Room not found");

    room.activePoll = {
      id: "poll_" + Date.now(),
      question: question,
      options: options.map((opt, idx) => ({ id: idx, text: opt, votes: 0 })),
      totalVotes: 0,
      active: true
    };
    return room.activePoll;
  }

  /**
   * Submit student vote on active poll
   */
  votePoll(roomId, optionIndex) {
    const room = this.activeRooms.get(roomId);
    if (!room || !room.activePoll || !room.activePoll.active) {
      throw new Error("No active poll currently open");
    }

    const opt = room.activePoll.options[optionIndex];
    if (opt) {
      opt.votes += 1;
      room.activePoll.totalVotes += 1;
    }
    return room.activePoll;
  }

  /**
   * Get attendance log of the session
   */
  getAttendanceReport(roomId) {
    const room = this.activeRooms.get(roomId);
    if (!room) return [];
    return Array.from(room.participants.values());
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = new WebRtcLiveBridge();
}
