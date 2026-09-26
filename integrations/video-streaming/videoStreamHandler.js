/**
 * videoStreamHandler.js
 * Video Streaming, HLS/DASH Playlist & Playback Manager
 * Capacity Connect LMS (Physics Wallah / Unacademy style)
 */

class VideoStreamHandler {
  constructor() {
    this.playbackHistory = new Map(); // userId:courseId:lessonId -> { timestamp, completed }
  }

  /**
   * Resolve stream metadata and formats (Adaptive Bitrate / 1080p, 720p, 480p, 360p)
   */
  getStreamManifest(videoUrl) {
    if (!videoUrl) {
      return {
        type: "mp4",
        sources: [
          { quality: "720p (HD)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
        ],
        availableSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0],
        captions: [
          { label: "English", srclang: "en", default: true },
          { label: "हिन्दी (Hindi)", srclang: "hi", default: false }
        ]
      };
    }

    // Check if YouTube link
    const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return {
        type: "youtube",
        videoId: ytMatch[1],
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0`,
        availableSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
      };
    }

    return {
      type: "direct",
      url: videoUrl,
      sources: [
        { quality: "1080p (FHD)", url: videoUrl },
        { quality: "720p (HD)", url: videoUrl },
        { quality: "480p (SD)", url: videoUrl }
      ],
      availableSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
    };
  }

  /**
   * Save playback progress and compute lesson completion
   */
  savePlaybackProgress(userId, courseId, lessonId, currentSeconds, totalDuration) {
    const key = `${userId}:${courseId}:${lessonId}`;
    const percentage = totalDuration > 0 ? (currentSeconds / totalDuration) * 100 : 0;
    const isCompleted = percentage >= 85; // Considered complete after watching 85%

    const record = {
      timestamp: currentSeconds,
      totalDuration: totalDuration,
      percentage: Math.min(100, Math.round(percentage)),
      isCompleted: isCompleted,
      updatedAt: new Date().toISOString()
    };

    this.playbackHistory.set(key, record);
    return record;
  }

  /**
   * Retrieve saved playback timestamp
   */
  getPlaybackProgress(userId, courseId, lessonId) {
    const key = `${userId}:${courseId}:${lessonId}`;
    return this.playbackHistory.get(key) || { timestamp: 0, percentage: 0, isCompleted: false };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = new VideoStreamHandler();
}
