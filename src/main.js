"use strict";

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const motionButton = document.querySelector(".motion-toggle");
  const motionLabel = document.getElementById("motion-label");
  let motionPaused = reducedMotion.matches;

  // Keep each project directly addressable, with normal browser Back behavior.
  const dialogs = [...document.querySelectorAll(".project-dialog")];
  const openers = new Map();
  let activeDialog = null;
  let syncingHistory = false;
  let openingTransition = null;
  const projectFromHash = () => dialogs.find(dialog => `#${dialog.id}` === location.hash);

  function syncProject() {
    const target = projectFromHash();
    syncingHistory = true;
    if (activeDialog && activeDialog !== target) activeDialog.close();
    if (target && !target.open) {
      document.querySelectorAll("video").forEach(video => video.pause());
      target.showModal();
      target.scrollTo({ top: 0, behavior: "instant" });
      activeDialog = target;
      document.dispatchEvent(new CustomEvent("portfolio:dialog", { detail: { open: true } }));
      if (!openingTransition && !motionPaused && target.animate) {
        target.animate([{ opacity: 0, transform: "translateY(16px) scale(.985)" },
          { opacity: 1, transform: "translateY(0) scale(1)" }],
        { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
      }
    }
    if (!target) {
      activeDialog = null;
      document.dispatchEvent(new CustomEvent("portfolio:dialog", { detail: { open: false } }));
    }
    syncingHistory = false;

  }

  async function openProject(button) {
    if (openingTransition) return;
    const id = `project-${button.dataset.project}`;
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    const source = button.closest(".launch-panel")?.querySelector(".hero-object") || button;
    const destination = dialog.querySelector(".intent-media") || dialog.querySelector(".hero-media") || dialog.querySelector(".compact-detail");
    openers.set(id, button);
    history.pushState({ portfolioProject: id, returnHash: location.hash }, "", `#${id}`);

    if (motionPaused || !document.startViewTransition || !destination) {
      syncProject();
      return;
    }

    // Only the clicked media surface is shared. Native dialog behavior stays intact.
    // Load the destination eagerly so its new snapshot does not capture a blank image.
    const image = destination.querySelector("img");
    if (image) image.loading = "eager";
    source.style.viewTransitionName = "project-media";
    try {
      openingTransition = document.startViewTransition(async () => {
        source.style.removeProperty("view-transition-name");
        if (location.hash !== `#${id}`) return;
        syncProject();
        destination.style.viewTransitionName = "project-media";
        if (image) {
          // Bound slow image loading; opening the project must never depend on it.
          let timeout;
          await Promise.race([
            image.decode().catch(() => {}),
            new Promise(resolve => { timeout = setTimeout(resolve, 180); })
          ]);
          clearTimeout(timeout);
        }
      });
      await openingTransition.finished;
    } catch {
      // Unsupported snapshots or interrupted transitions still open normal content.
      if (location.hash === `#${id}` && !dialog.open) syncProject();
    } finally {
      source.style.removeProperty("view-transition-name");
      destination.style.removeProperty("view-transition-name");
      openingTransition = null;
    }
  }

  document.querySelectorAll("[data-project]").forEach(button => {
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", `project-${button.dataset.project}`);
    button.addEventListener("click", () => {
      openProject(button);
    });
  });

  function dismissProject(dialog) {
    if (!dialog.open) return;
    openingTransition?.skipTransition();
    if (history.state?.portfolioProject === dialog.id) history.back();
    else {
      history.replaceState(null, "", `${location.pathname}${location.search}#projects`);
      syncProject();
    }
  }

  dialogs.forEach(dialog => {
    dialog.querySelector(".close-dialog").addEventListener("click", () => dismissProject(dialog));
    dialog.addEventListener("cancel", event => {
      event.preventDefault();
      dismissProject(dialog);
    });
    let startedOnBackdrop = false;
    dialog.addEventListener("pointerdown", event => { startedOnBackdrop = event.target === dialog; });
    dialog.addEventListener("click", event => {
      if (event.target === dialog && startedOnBackdrop) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dismissProject(dialog);
      }
      startedOnBackdrop = false;
    });
    dialog.addEventListener("close", () => {
      dialog.querySelectorAll("video").forEach(video => video.pause());
      if (activeDialog === dialog) activeDialog = null;
      if (!syncingHistory && location.hash === `#${dialog.id}`) {
        history.replaceState(null, "", `${location.pathname}${location.search}#projects`);
      }
      openers.get(dialog.id)?.focus({ preventScroll: true });

    });
  });
  window.addEventListener("popstate", syncProject);
  window.addEventListener("hashchange", syncProject);

  const specimenFilm = document.getElementById("specimen-film");

  // Native page scrolling remains in control; the index follows the current chapter.
  const panels = [...document.querySelectorAll(".launch-panel")];
  const menu = document.querySelector(".project-menu");
  const menuLinks = [...menu.querySelectorAll("a")];
  let currentPanel = panels[0];
  function activatePanel(panel) {
    if (!panel || panel === currentPanel) return;
    currentPanel?.classList.remove("is-active");
    if (panel.id !== "launch-infinity") specimenFilm.pause();
    panel.classList.add("is-active");
    currentPanel = panel;
    menuLinks.forEach(link => {
      if (link.hash === "#" + panel.id) {
        link.setAttribute("aria-current", "location");
        // Only move the horizontal index. Never pull the page away from the reader.
        if (menu.scrollWidth > menu.clientWidth) {
          const left = link.offsetLeft - menu.offsetLeft;
          menu.scrollTo({ left: Math.max(0, left - 16), behavior: motionPaused ? "instant" : "smooth" });
        }
      } else link.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    const chapterObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) {
        visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        activatePanel(visible[0].target);
      }
    }, { rootMargin: "-28% 0px -48% 0px", threshold: 0 });
    panels.forEach(panel => chapterObserver.observe(panel));
  }
  menuLinks.forEach(link => link.addEventListener("click", () => {
    activatePanel(document.getElementById(link.hash.slice(1)));
  }));

  // A quiet surface reflection follows the pointer; there is no permanent render loop.
  document.querySelectorAll(".hero-object").forEach(surface => {
    surface.addEventListener("pointermove", event => {
      if (motionPaused || !finePointer.matches || activeDialog) return;
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty("--light-x", ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + "%");
      surface.style.setProperty("--light-y", ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + "%");
      surface.classList.add("material-active");
    });
    surface.addEventListener("pointerleave", () => surface.classList.remove("material-active"));
  });

  function applyMotionPreference() {
    document.body.classList.toggle("motion-paused", motionPaused);
    document.documentElement.classList.toggle("motion-paused", motionPaused);
    motionButton.setAttribute("aria-pressed", String(motionPaused));
    motionButton.setAttribute("aria-label", motionPaused ? "Enable visual effects" : "Pause visual effects");
    motionLabel.textContent = motionPaused ? "Motion off" : "Motion on";
    document.dispatchEvent(new CustomEvent("portfolio:motion", { detail: { paused: motionPaused } }));
    if (motionPaused) {
      openingTransition?.skipTransition();
      document.querySelectorAll(".material-active").forEach(element => element.classList.remove("material-active"));
      document.getAnimations().forEach(animation => { try { animation.finish(); } catch {} });
    }
  }
  try {
    const stored = localStorage.getItem("jl-portfolio-motion");
    if (stored === "paused") motionPaused = true;
    if (stored === "on" && !reducedMotion.matches) motionPaused = false;
  } catch { /* Local storage can be unavailable in private browsing. */ }
  motionButton.addEventListener("click", () => {
    motionPaused = !motionPaused;
    applyMotionPreference();
    try { localStorage.setItem("jl-portfolio-motion", motionPaused ? "paused" : "on"); } catch {}
  });
  reducedMotion.addEventListener("change", event => {
    motionPaused = event.matches;
    applyMotionPreference();
  });
  document.querySelectorAll("[data-build-details]").forEach(button => {
    const dialog = button.closest("dialog");
    const detail = dialog.querySelector(".project-layout, .compact-detail");
    detail.tabIndex = -1;
    button.addEventListener("click", () => {
      detail.focus({ preventScroll: true });
      dialog.scrollTo({ top: detail.getBoundingClientRect().top - dialog.getBoundingClientRect().top + dialog.scrollTop - 80, behavior: motionPaused ? "instant" : "smooth" });
    });
  });
  applyMotionPreference();
  syncProject();
})();
