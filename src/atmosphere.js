"use strict";

(() => {
  const root = document.documentElement;
  const entrance = document.querySelector(".site-entrance");
  let entranceTimer;
  let transferTimer;
  let lineTransfer;
  function finishEntrance() {
    delete root.dataset.entrance;
    entrance.hidden = true;
    clearTimeout(entranceTimer);
    clearTimeout(transferTimer);
    lineTransfer?.cancel();
    ["pointerdown", "wheel", "touchstart", "keydown"].forEach(type => window.removeEventListener(type, finishEntrance));
  }
  if (root.dataset.entrance) {
    if (root.dataset.entrance === "first") {
      transferTimer = setTimeout(() => {
        const line = entrance.querySelector(".entrance-line");
        const active = document.querySelector('.project-menu a[aria-current="location"]');
        if (!line.animate || !active) return;
        const from = line.getBoundingClientRect();
        const to = active.getBoundingClientRect();
        const horizontal = matchMedia("(max-width: 900px)").matches;
        // The entrance's construction line becomes the actual project index marker.
        lineTransfer = line.animate([
          { left: from.left + "px", top: from.top + "px", width: from.width + "px", height: "1px", transform: "none", opacity: .8, background: "#ff4d00" },
          { left: (horizontal ? to.left : to.left - 12) + "px", top: (horizontal ? to.bottom - 2 : to.top + 15) + "px", width: (horizontal ? to.width : 2) + "px", height: (horizontal ? 2 : Math.max(2, to.height - 30)) + "px", transform: "none", opacity: 1, background: "#ff4d00" }
        ], { duration: 580, easing: "cubic-bezier(.76,0,.2,1)", fill: "both" });
      }, 1350);
    }
    entranceTimer = setTimeout(finishEntrance, root.dataset.entrance === "first" ? 2000 : 460);
    ["pointerdown", "wheel", "touchstart", "keydown"].forEach(type => window.addEventListener(type, finishEntrance, { passive: true, once: true }));
  } else finishEntrance();
  window.addEventListener("pageshow", event => { if (event.persisted) finishEntrance(); });

  const canvas = document.getElementById("engineering-field");
  const context = canvas.getContext("2d");
  if (!context) return;
  const pointer = { x: -1000, y: -1000, strength: 0, target: 0 };
  let width = 0;
  let height = 0;
  let points = [];
  let dust = [];
  const projectFrames = [...document.querySelectorAll(".object-stage")];
  let lightBoundsDirty = true;
  let driftTime = 0;
  // Cache the soft amber light once; each frame only places small sprites.
  const dustSprite = document.createElement("canvas");
  dustSprite.width = dustSprite.height = 32;
  const dustContext = dustSprite.getContext("2d");
  if (dustContext) {
    const glow = dustContext.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, "rgba(255,211,145,.9)");
    glow.addColorStop(.12, "rgba(249,179,85,.65)");
    glow.addColorStop(.35, "rgba(230,139,47,.17)");
    glow.addColorStop(1, "rgba(230,139,47,0)");
    dustContext.fillStyle = glow;
    dustContext.fillRect(0, 0, 32, 32);
  }
  let frame = 0;
  let lastTime = 0;
  let paused = document.body.classList.contains("motion-paused");
  let dialogOpen = Boolean(document.querySelector("dialog[open]"));
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

  // One viewport-fixed light, matching .ambient-wash in atmosphere.css.
  function backgroundLight(x, y) {
    const mobile = width <= 600;
    const cx = width * (mobile ? .9 : .86);
    const cy = height * (mobile ? .48 : .45);
    const rx = Math.max(1, width * (mobile ? .86 : .48));
    const ry = Math.max(1, height * (mobile ? .5 : .54));
    return Math.max(0, 1 - Math.hypot((x - cx) / rx, (y - cy) / ry));
  }

  function updateFrameLighting() {
    const bounds = projectFrames.map(element => ({ element, rect: element.getBoundingClientRect() }));
    const sourceX = width * (width <= 600 ? .9 : .86);
    const sourceY = height * (width <= 600 ? .48 : .45);
    for (const { element, rect } of bounds) {
      // Project the fixed light into each card's local coordinates as it scrolls.
      element.style.setProperty("--reflection-x", (sourceX - rect.left).toFixed(1) + "px");
      element.style.setProperty("--reflection-y", (sourceY - rect.top).toFixed(1) + "px");
    }
    lightBoundsDirty = false;
  }

  function draw(now = 0) {
    frame = 0;
    const delta = lastTime ? Math.max(0, Math.min(40, now - lastTime)) : 16;
    lastTime = now;
    const ease = 1 - Math.exp(-delta / 110);
    pointer.strength += (pointer.target - pointer.strength) * ease;
    context.clearRect(0, 0, width, height);
    let unsettled = Math.abs(pointer.target - pointer.strength) > .002;
    for (const point of points) {
      const dx = point.homeX - pointer.x;
      const dy = point.homeY - pointer.y;
      const distance = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distance / 220) * pointer.strength;
      const offset = proximity * proximity * 14;
      const targetX = point.homeX + dx / (distance || 1) * offset;
      const targetY = point.homeY + dy / (distance || 1) * offset;
      point.x += (targetX - point.x) * ease;
      point.y += (targetY - point.y) * ease;
      unsettled ||= Math.abs(targetX - point.x) + Math.abs(targetY - point.y) > .04;
      const structureVisibility = 1.15 - backgroundLight(point.x, point.y) * .95;
      context.fillStyle = `rgba(190,163,127,${(.13 + proximity * .38) * structureVisibility})`;
      context.beginPath();
      context.arc(point.x, point.y, proximity > .5 ? 1.4 : .8, 0, Math.PI * 2);
      context.fill();
      if (point.cross) {
        context.strokeStyle = `rgba(172,146,117,${(.06 + proximity * .2) * structureVisibility})`;
        context.lineWidth = .6;
        context.beginPath();
        context.moveTo(point.x - 5, point.y); context.lineTo(point.x + 5, point.y);
        context.moveTo(point.x, point.y - 5); context.lineTo(point.x, point.y + 5);
        context.stroke();
      }
      if (proximity > .08 && point.next !== undefined) {
        const next = points[point.next];
        if (next) {
          const lineVisibility = 1.15 - backgroundLight((point.x + next.x) / 2, (point.y + next.y) / 2) * .95;
          context.strokeStyle = `rgba(242,151,75,${proximity * .11 * lineVisibility})`;
          context.lineWidth = .65;
          context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(next.x, next.y); context.stroke();
        }
      }
    }
    const moving = !paused && !dialogOpen && !document.hidden;
    const seconds = moving ? delta / 1000 : 0;
    driftTime += seconds;
    // Cache frame geometry until the page moves; no layout reads per particle.
    if (lightBoundsDirty) updateFrameLighting();
    if (dustContext) {
      for (const mote of dust) {
        const dx = mote.x - pointer.x;
        const dy = mote.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const influence = Math.pow(Math.max(0, 1 - distance / 150), 2) * pointer.strength;
        // A small sideways current bends the drift, then eases back into the breeze.
        const forceX = (dx - dy * .45) / (distance || 1) * influence * 27.5;
        const forceY = (dy + dx * .45) / (distance || 1) * influence * 27.5;
        const response = 1 - Math.exp(-seconds * 2.2);
        mote.vx += (forceX - mote.vx) * response;
        mote.vy += (forceY - mote.vy) * response;
        mote.x += (3 + Math.sin(driftTime * .22 + mote.phase) * 2 + mote.vx) * seconds;
        mote.y += (-mote.speed + Math.cos(driftTime * .18 + mote.phase) + mote.vy) * seconds;
        if (mote.y < -18) { mote.y = height + 18; mote.x = width * (.3 + Math.random() * .7); }
        if (mote.x > width + 18) mote.x = width * .3 - 18;
        if (mote.x < -18) mote.x = width + 18;
        const edge = Math.min(1, Math.max(0, Math.min(mote.y, height - mote.y) / 70));
        const shimmer = .68 + .32 * Math.sin(driftTime * .4 + mote.phase);
        const illumination = backgroundLight(mote.x, mote.y);
        // The dust and card surfaces catch the same background light.
        const litSize = mote.size * (1 + illumination * .16);
        context.globalAlpha = Math.min(.75, mote.opacity * shimmer * edge * (.45 + illumination * 1.4));
        context.drawImage(dustSprite, mote.x - litSize / 2, mote.y - litSize / 2, litSize, litSize);
      }
      context.globalAlpha = 1;
    }
    if ((unsettled || dust.length) && moving) frame = requestAnimationFrame(draw);
  }
  function wake() {
    if (!frame && !paused && !dialogOpen && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function resize() {
    lightBoundsDirty = true;
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const spacing = Math.max(76, Math.sqrt(width * height / 200));
    points = [];
    dust = Array.from({ length: Math.round((width < 600 ? 16 : 30) * 1.25) }, () => ({
      x: width * (.3 + Math.random() * .7), y: Math.random() * height,
      size: 7 + Math.random() * 9, speed: 3 + Math.random() * 6,
      opacity: .2 + Math.random() * .32, phase: Math.random() * Math.PI * 2,
      vx: 0, vy: 0
    }));
    for (let y = 35, row = 0; y < height; y += spacing, row++) {
      for (let x = 35, col = 0; x < width; x += spacing, col++) {
        points.push({ homeX: x, homeY: y, x, y, cross: (row + col) % 5 === 0, next: x + spacing < width ? points.length + 1 : undefined });
      }
    }
    cancelAnimationFrame(frame);
    lastTime = 0;
    draw();
  }
  window.addEventListener("pointermove", event => {
    if (!fine.matches || paused || dialogOpen || event.pointerType === "touch") return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.target = 1;
    wake();
  }, { passive: true });
  document.addEventListener("pointerleave", () => { pointer.target = 0; wake(); });
  window.addEventListener("blur", () => { pointer.target = 0; wake(); });
  window.addEventListener("resize", resize, { passive: true });
  function refreshLighting() {
    lightBoundsDirty = true;
    // Scrolling still changes the reflected light when autonomous motion is off.
    if (paused && !dialogOpen && !document.hidden) updateFrameLighting();
    else wake();
  }
  window.addEventListener("scroll", refreshLighting, { passive: true });
  projectFrames.forEach(element => element.addEventListener("animationend", event => {
    if (event.target === element) refreshLighting();
  }));
  document.addEventListener("portfolio:motion", event => {
    paused = event.detail.paused;
    if (paused) {
      finishEntrance();
      cancelAnimationFrame(frame); frame = 0;
      pointer.strength = pointer.target = 0;
      points.forEach(point => { point.x = point.homeX; point.y = point.homeY; });
      draw();
    } else { lastTime = 0; wake(); }
  });
  document.addEventListener("portfolio:dialog", event => {
    dialogOpen = event.detail.open;
    if (dialogOpen) { cancelAnimationFrame(frame); frame = 0; }
    else { pointer.target = 0; lastTime = 0; lightBoundsDirty = true; wake(); }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; finishEntrance(); }
    else { lastTime = 0; wake(); }
  });
  resize();
})();
