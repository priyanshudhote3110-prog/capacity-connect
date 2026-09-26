/**
 * CrowdCanvas.js - Animated Peeps Crowd Background on HTML5 Canvas
 * Adapted from Skiper39 & Szenia Zadvornykh (OpenPeeps by Pablo Stanley)
 * Powered by GSAP + HTML5 2D Canvas
 */

class CrowdCanvas {
  constructor(options = {}) {
    this.canvasId = options.canvasId || "hero-crowd-canvas";
    this.src = options.src || "./images/peeps/all-peeps.png";
    this.rows = options.rows || 15;
    this.cols = options.cols || 7;
    this.maxCrowd = options.maxCrowd || 40;
    this.canvas = null;
    this.ctx = null;
    this.img = null;
    this.stage = { width: 0, height: 0 };
    this.allPeeps = [];
    this.availablePeeps = [];
    this.crowd = [];
    this.isInitialized = false;
    this.onResizeBound = this.handleResize.bind(this);
    this.renderBound = this.render.bind(this);
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return;

    if (typeof gsap === "undefined") {
      console.warn("GSAP is required for CrowdCanvas animations.");
      return;
    }

    this.img = document.createElement("img");
    this.img.crossOrigin = "anonymous";

    this.img.onload = () => {
      this.createPeeps();
      this.resize();
      gsap.ticker.add(this.renderBound);
      window.addEventListener("resize", this.onResizeBound);
      this.isInitialized = true;
    };

    this.img.src = this.src;
  }

  // UTILS
  randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  randomIndex(array) {
    return this.randomRange(0, array.length) | 0;
  }

  removeFromArray(array, i) {
    return array.splice(i, 1)[0];
  }

  removeItemFromArray(array, item) {
    return this.removeFromArray(array, array.indexOf(item));
  }

  removeRandomFromArray(array) {
    return this.removeFromArray(array, this.randomIndex(array));
  }

  getRandomFromArray(array) {
    return array[this.randomIndex(array) | 0];
  }

  // FACTORY FUNCTIONS
  createPeep({ image, rect }) {
    const peep = {
      image,
      rect: [],
      width: 0,
      height: 0,
      drawArgs: [],
      x: 0,
      y: 0,
      anchorY: 0,
      scaleX: 1,
      walk: null,
      setRect: (r, scale = 1) => {
        peep.rect = r;
        peep.width = r[2] * scale;
        peep.height = r[3] * scale;
        peep.drawArgs = [peep.image, ...r, 0, 0, peep.width, peep.height];
      },
      render: (ctx) => {
        ctx.save();
        ctx.translate(peep.x, peep.y);
        ctx.scale(peep.scaleX, 1);
        ctx.drawImage(
          peep.image,
          peep.rect[0],
          peep.rect[1],
          peep.rect[2],
          peep.rect[3],
          0,
          0,
          peep.width,
          peep.height
        );
        ctx.restore();
      }
    };

    peep.setRect(rect);
    return peep;
  }

  createPeeps() {
    const { rows, cols } = this;
    const { naturalWidth: width, naturalHeight: height } = this.img;
    const total = rows * cols;
    const rectWidth = width / rows;
    const rectHeight = height / cols;

    this.allPeeps = [];
    for (let i = 0; i < total; i++) {
      this.allPeeps.push(
        this.createPeep({
          image: this.img,
          rect: [
            (i % rows) * rectWidth,
            ((i / rows) | 0) * rectHeight,
            rectWidth,
            rectHeight
          ]
        })
      );
    }
  }

  resetPeep(peep) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const easeFn = gsap.parseEase("power2.in");
    // Walking elevation variation along the ground line
    const offsetY = 40 - 180 * easeFn(Math.random());
    const startY = this.stage.height - peep.height + offsetY;
    let startX, endX;

    if (direction === 1) {
      startX = -peep.width;
      endX = this.stage.width;
      peep.scaleX = 1;
    } else {
      startX = this.stage.width + peep.width;
      endX = 0;
      peep.scaleX = -1;
    }

    peep.x = startX;
    peep.y = startY;
    peep.anchorY = startY;

    return { startX, startY, endX };
  }

  normalWalk(peep, props) {
    const { startX, startY, endX } = props;
    const xDuration = this.randomRange(9, 16);
    const yDuration = 0.25;

    const tl = gsap.timeline();
    tl.timeScale(this.randomRange(0.65, 1.25));
    tl.to(
      peep,
      {
        duration: xDuration,
        x: endX,
        ease: "none"
      },
      0
    );
    tl.to(
      peep,
      {
        duration: yDuration,
        repeat: Math.floor(xDuration / yDuration),
        yoyo: true,
        y: startY - 8
      },
      0
    );

    return tl;
  }

  initCrowd() {
    const count = Math.min(this.availablePeeps.length, this.maxCrowd);
    for (let i = 0; i < count; i++) {
      if (!this.availablePeeps.length) break;
      const peep = this.addPeepToCrowd();
      if (peep && peep.walk) {
        peep.walk.progress(Math.random());
      }
    }
  }

  addPeepToCrowd() {
    if (!this.availablePeeps.length) return null;
    const peep = this.removeRandomFromArray(this.availablePeeps);
    const props = this.resetPeep(peep);

    const walk = this.normalWalk(peep, props).eventCallback("onComplete", () => {
      this.removePeepFromCrowd(peep);
      this.addPeepToCrowd();
    });

    peep.walk = walk;
    this.crowd.push(peep);
    this.crowd.sort((a, b) => a.anchorY - b.anchorY);
    return peep;
  }

  removePeepFromCrowd(peep) {
    this.removeItemFromArray(this.crowd, peep);
    this.availablePeeps.push(peep);
  }

  render() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    this.crowd.forEach((peep) => {
      peep.render(this.ctx);
    });

    this.ctx.restore();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.stage.width = this.canvas.clientWidth || window.innerWidth;
    this.stage.height = this.canvas.clientHeight || 450;

    this.canvas.width = this.stage.width * dpr;
    this.canvas.height = this.stage.height * dpr;

    // Responsive scaling based on hero height (keeps peeps comfortably sized)
    const scale = Math.min(0.65, Math.max(0.35, this.stage.height / 700));
    this.allPeeps.forEach((p) => p.setRect(p.rect, scale));

    // Reset crowd
    this.crowd.forEach((peep) => {
      if (peep.walk) peep.walk.kill();
    });

    this.crowd.length = 0;
    this.availablePeeps = [...this.allPeeps];

    this.initCrowd();
  }

  handleResize() {
    if (this.isInitialized) {
      this.resize();
    }
  }

  destroy() {
    if (typeof gsap !== "undefined" && gsap.ticker) {
      gsap.ticker.remove(this.renderBound);
    }
    window.removeEventListener("resize", this.onResizeBound);
    this.crowd.forEach((peep) => {
      if (peep.walk) peep.walk.kill();
    });
    this.crowd = [];
    this.availablePeeps = [];
    this.isInitialized = false;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CrowdCanvas;
}
