"use strict";

(() => {
  const stage = document.getElementById("specimen-media");
  const firstImage = document.getElementById("specimen-image");
  const film = document.getElementById("specimen-film");
  const caption = document.getElementById("view-label");
  const tabs = document.querySelector(".view-switch");
  const buttons = [...tabs.querySelectorAll("[data-view]")];
  const quiet = () => document.body.classList.contains("motion-paused");
  const views = {
    built: { src: firstImage.getAttribute("src"), alt: firstImage.alt, label: "Completed build / Mark 3" },
    inside: { src: "./assets/images/infinity/mark-3-frame.jpg", alt: "Infinity Table during assembly showing its frame, bottle brackets, mirrors, and wiring", label: "Inside the assembly / Mark 3" },
    cad: { src: "./assets/images/infinity/mark-3-cad.jpg", alt: "Archived Fusion 360 CAD reference image of the Infinity Entertainment Table", label: "CAD reference / Fusion 360" },
    film: { src: film.getAttribute("poster"), label: "In use / original build footage" }
  };
  const secondImage = new Image();
  secondImage.alt = "";
  function wrap(media, hidden) {
    const layer = document.createElement("div");
    layer.className = "viewer-layer";
    layer.hidden = hidden;
    layer.append(media);
    stage.prepend(layer);
    media.hidden = false;
    return layer;
  }
  const imageLayers = [wrap(firstImage, false), wrap(secondImage, true)];
  const filmLayer = wrap(film, true);
  const layers = [...imageLayers, filmLayer];
  let current = imageLayers[0];
  let selected = "built";
  let version = 0;
  let animations = [];
  let ghost = null;
  const loaded = new Map();

  function preload(src) {
    if (!loaded.has(src)) {
      const image = new Image();
      image.src = src;
      let timeout;
      const promise = Promise.race([
        image.decode(),
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Image load timeout")), 10000); })
      ]).finally(() => clearTimeout(timeout)).catch(error => { loaded.delete(src); throw error; });
      loaded.set(src, promise);
    }
    return loaded.get(src);
  }

  function settle() {
    animations.forEach(animation => animation.cancel());
    animations = [];
    ghost?.remove();
    ghost = null;
    layers.forEach(layer => {
      layer.hidden = layer !== current;
      layer.style.opacity = layer === current ? "1" : "0";
      layer.style.removeProperty("z-index");
    });
  }

  function positionIndicator() {
    const button = buttons.find(item => item.dataset.view === selected);
    tabs.style.setProperty("--tab-left", button.offsetLeft + "px");
    tabs.style.setProperty("--tab-width", button.offsetWidth + "px");
    tabs.classList.add("has-indicator");
  }

  function updateCaption(text) {
    const previous = caption.textContent;
    caption.textContent = text;
    if (quiet() || !caption.animate) return;
    ghost = document.createElement("span");
    ghost.className = "caption-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.textContent = previous;
    caption.append(ghost);
    animations.push(ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "both" }));
    // Text fades in with its media; the old caption remains only as a visual layer.
    animations.push(caption.animate([{ opacity: .35, transform: "translateY(3px)" }, { opacity: 1, transform: "none" }], { duration: 400, fill: "both" }));
  }

  async function select(button) {
    const key = button.dataset.view;
    const request = ++version;
    settle();
    buttons.forEach(item => delete item.dataset.loading);
    stage.removeAttribute("aria-busy");
    if (key === selected) return;
    button.dataset.loading = "true";
    stage.setAttribute("aria-busy", "true");
    try { await preload(views[key].src); }
    catch {
      if (request !== version) return;
      delete button.dataset.loading;
      stage.removeAttribute("aria-busy");
      caption.textContent = "Image unavailable. Select a view to try again.";
      return;
    }
    if (request !== version) return;
    const incoming = key === "film" ? filmLayer : imageLayers.find(layer => layer !== current);
    if (key !== "film") {
      const image = incoming.firstElementChild;
      image.src = views[key].src;
      image.alt = views[key].alt;
      // Decode the actual destination as well as the cached preload.
      try { await image.decode(); } catch { /* The successfully preloaded asset remains usable. */ }
      if (request !== version) return;
    }
    const outgoing = current;
    current = incoming;
    selected = key;
    stage.dataset.current = key;
    film.pause();
    buttons.forEach(item => {
      item.setAttribute("aria-pressed", String(item === button));
      delete item.dataset.loading;
    });
    stage.removeAttribute("aria-busy");
    positionIndicator();
    updateCaption(views[key].label);
    incoming.hidden = false;
    incoming.style.opacity = "1";
    incoming.style.zIndex = "1";
    if (!quiet() && incoming.animate) {
      const options = { duration: 620, easing: "cubic-bezier(.22,.61,.36,1)", fill: "both" };
      const enter = incoming.animate([{ opacity: 0 }, { opacity: 1 }], options);
      const leave = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], options);
      animations.push(enter, leave);
      try { await enter.finished; } catch { /* A new selection may replace this transition. */ }
    }
    if (request !== version) return;
    settle();
    if (key === "film" && !quiet() && !document.hidden && !document.querySelector("dialog[open]") && document.getElementById("launch-infinity").classList.contains("is-active")) {
      film.play().catch(() => {});
    }
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => { select(button); });
    const warm = () => { preload(views[button.dataset.view].src).catch(() => {}); };
    button.addEventListener("pointerenter", warm, { once: true });
    button.addEventListener("focus", warm, { once: true });
  });
  if ("ResizeObserver" in window) new ResizeObserver(positionIndicator).observe(tabs);
  else window.addEventListener("resize", positionIndicator);
  document.addEventListener("portfolio:motion", event => { if (event.detail.paused) settle(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) film.pause(); });
  positionIndicator();
})();
