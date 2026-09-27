const checkoutUrls = {
  essencial: "https://pay.hotmart.com/H107776419T?off=f6r8ti5i&checkoutMode=10",
  pro: "https://pay.hotmart.com/H107776419T?off=j4vtryhy&checkoutMode=10",
  "pro-discount": "https://pay.hotmart.com/H107776419T?off=asmp9nue&checkoutMode=10",
  "essencial-direto": "https://pay.hotmart.com/H107776419T?off=f6r8ti5i&checkoutMode=10",
};

const essentialUpgradeModal = document.querySelector("#essential-upgrade-modal");
const essentialUpgradeClose = essentialUpgradeModal?.querySelector(".upgrade-modal-close");
let lastUpgradeTrigger = null;

const heroVsl = document.querySelector(".hero-vsl");
const heroVslSlot = document.querySelector(".hero-vsl-slot");
const heroVslVideo = document.querySelector("#hero-vsl-video");

if (heroVsl && heroVslSlot && heroVslVideo) {
  const gate = heroVsl.querySelector(".hero-vsl-gate");
  const overlay = heroVsl.querySelector(".hero-vsl-overlay");
  const controls = heroVsl.querySelector(".hero-vsl-controls");
  const progress = heroVsl.querySelector(".hero-vsl-progress");
  const speedButton = heroVsl.querySelector('[data-vsl-action="speed"]');
  const speeds = [1, 1.2, 1.5];
  let heroVslStarted = false;
  let ignoreHeroVslClickUntil = 0;

  const syncHeroVsl = () => {
    const playing = !heroVslVideo.paused && !heroVslVideo.loop;
    heroVsl.dataset.state = heroVslVideo.ended
      ? "ended"
      : playing
        ? "playing"
        : heroVslVideo.loop
          ? "ready"
          : "paused";
    gate.hidden = !heroVslVideo.loop;
    overlay.hidden = heroVslVideo.loop || playing || heroVslVideo.ended;
    controls.hidden = !playing;
  };

  const startHeroVsl = (restart = false, audible = true) => {
    if (restart) heroVslVideo.currentTime = 0;
    heroVslStarted = true;
    heroVslVideo.loop = false;
    heroVslVideo.defaultMuted = !audible;
    heroVslVideo.muted = !audible;
    if (audible) heroVslVideo.removeAttribute("muted");
    else heroVslVideo.setAttribute("muted", "");
    gate.hidden = true;
    overlay.hidden = true;
    controls.hidden = false;
    heroVsl.dataset.state = "playing";
    void heroVslVideo.play().catch(() => {
      controls.hidden = true;
      overlay.hidden = false;
    });
  };

  const enableHeroVslSound = () => {
    if (!heroVslStarted || !heroVslVideo.muted) return;
    heroVslVideo.defaultMuted = false;
    heroVslVideo.muted = false;
    heroVslVideo.removeAttribute("muted");
    void heroVslVideo.play().catch(() => {
      heroVslVideo.muted = true;
      heroVslVideo.setAttribute("muted", "");
    });
  };

  const startHeroVslOnFirstGesture = (audible = true) => {
    if (heroVslStarted) return;
    // Evita que o clique sintético gerado depois de um toque reinicie o vídeo.
    ignoreHeroVslClickUntil = performance.now() + 700;
    startHeroVsl(true, audible);
  };

  gate.addEventListener("click", () => startHeroVsl(true));
  heroVsl.addEventListener("click", (event) => {
    if (performance.now() < ignoreHeroVslClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  heroVsl.querySelector('[data-vsl-action="resume"]').addEventListener("click", () => startHeroVsl(false));
  heroVsl.querySelector('[data-vsl-action="restart"]').addEventListener("click", () => startHeroVsl(true));
  speedButton.addEventListener("click", () => {
    const currentIndex = speeds.findIndex(
      (speed) => Math.abs(speed - heroVslVideo.playbackRate) < 0.01,
    );
    const nextIndex = (currentIndex + 1) % speeds.length;
    heroVslVideo.playbackRate = speeds[nextIndex];
    speedButton.textContent = `${heroVslVideo.playbackRate.toFixed(1)}x`;
  });

  heroVslVideo.addEventListener("play", syncHeroVsl);
  heroVslVideo.addEventListener("pause", syncHeroVsl);
  heroVslVideo.addEventListener("ended", () => {
    progress.querySelector("i").style.width = "100%";
    progress.setAttribute("aria-valuenow", "100");
    syncHeroVsl();
  });
  heroVslVideo.addEventListener("timeupdate", () => {
    if (heroVslVideo.loop || !Number.isFinite(heroVslVideo.duration) || !heroVslVideo.duration) return;
    const percent = Math.min(100, Math.round((heroVslVideo.currentTime / heroVslVideo.duration) * 100));
    progress.querySelector("i").style.width = `${percent}%`;
    progress.setAttribute("aria-valuenow", String(percent));
  });
  heroVslVideo.addEventListener("click", () => {
    if (!heroVslVideo.loop && heroVslVideo.muted) {
      enableHeroVslSound();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button === 0) startHeroVslOnFirstGesture();
  }, { capture: true, passive: true });
  document.addEventListener("pointerup", (event) => {
    if (event.pointerType === "pen" && event.isPrimary) startHeroVslOnFirstGesture();
  }, { capture: true, passive: true });
  document.addEventListener("touchstart", (event) => {
    // Começa mesmo quando o toque se transforma num arrasto para rolar a página.
    if (event.touches.length) startHeroVslOnFirstGesture(false);
  }, { capture: true, passive: true });
  document.addEventListener("touchend", (event) => {
    // Ao soltar o dedo, tenta ativar o som dentro do gesto autorizado pelo navegador.
    if (event.changedTouches.length) enableHeroVslSound();
  }, { capture: true, passive: true });
  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-vsl-action="speed"], [data-vsl-action="restart"]')) return;
    // Também cobre cliques disparados pelo teclado e navegadores sem Pointer Events.
    if (!heroVslStarted) startHeroVsl(true);
    else if (heroVslVideo.muted) enableHeroVslSound();
  });

  if ("IntersectionObserver" in window) {
    const heroVslObserver = new IntersectionObserver(() => {
      heroVsl.classList.toggle(
        "is-floating",
        heroVslSlot.getBoundingClientRect().bottom < 0 && !heroVslVideo.loop && !heroVslVideo.ended,
      );
    });
    heroVslObserver.observe(heroVslSlot);
  }

  heroVslVideo.loop = true;
  heroVslVideo.defaultMuted = true;
  heroVslVideo.muted = true;
  heroVslVideo.setAttribute("muted", "");
  heroVslVideo.setAttribute("playsinline", "");
  void heroVslVideo.play().catch(() => {});
  syncHeroVsl();
}

function checkoutUrlWithTracking(url) {
  const checkoutUrl = new URL(url);
  const currentParams = new URLSearchParams(window.location.search);
  const allowedTrackingParam = /^(utm_[a-z0-9_]+|fbclid|src|sck)$/i;

  currentParams.forEach((value, key) => {
    if (allowedTrackingParam.test(key) && !checkoutUrl.searchParams.has(key)) {
      checkoutUrl.searchParams.set(key, value);
    }
  });

  return checkoutUrl.toString();
}

function closeEssentialUpgrade() {
  if (!essentialUpgradeModal?.open) return;
  essentialUpgradeModal.close();
  document.body.classList.remove("modal-open");
  lastUpgradeTrigger?.focus();
}

essentialUpgradeClose?.addEventListener("click", closeEssentialUpgrade);

essentialUpgradeModal?.addEventListener("click", (event) => {
  if (event.target === essentialUpgradeModal) closeEssentialUpgrade();
});

essentialUpgradeModal?.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
});

const toast = document.querySelector(".toast");
let toastTimer;

function showToast(message) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.setAttribute("aria-hidden", "false");
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }, 4200);
}

document.querySelectorAll(".checkout-link").forEach((link) => {
  const plan = link.dataset.plan;
  const configuredUrl = checkoutUrls[plan];
  if (configuredUrl) link.href = checkoutUrlWithTracking(configuredUrl);

  link.addEventListener("click", (event) => {
    const url = checkoutUrls[plan];

    if (!url) {
      event.preventDefault();
      showToast("O link deste checkout ainda precisa de ser configurado no ficheiro script.js.");
      return;
    }

    if (plan === "essencial" && essentialUpgradeModal) {
      event.preventDefault();
      lastUpgradeTrigger = link;
      essentialUpgradeModal.showModal();
      document.body.classList.add("modal-open");
      return;
    }

    link.href = checkoutUrlWithTracking(url);
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const mobileCta = document.querySelector(".mobile-cta");
const hero = document.querySelector(".hero");

if (mobileCta && hero && "IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      mobileCta.style.transform = entry.isIntersecting ? "translateY(140%)" : "translateY(0)";
      mobileCta.style.opacity = entry.isIntersecting ? "0" : "1";
      mobileCta.style.pointerEvents = entry.isIntersecting ? "none" : "auto";
    },
    { threshold: 0.08 },
  );

  heroObserver.observe(hero);
}

const testimonialsCarousel = document.querySelector(".testimonials-carousel");
const testimonialsTrack = document.querySelector(".testimonials-track");

if (testimonialsCarousel && testimonialsTrack) {
  const originalCards = Array.from(testimonialsTrack.children);
  const createClone = (card) => {
    const clone = card.cloneNode(true);
    clone.classList.add("visible");
    clone.setAttribute("aria-hidden", "true");
    return clone;
  };

  const before = document.createDocumentFragment();
  const after = document.createDocumentFragment();
  originalCards.forEach((card) => {
    before.appendChild(createClone(card));
    after.appendChild(createClone(card));
  });
  testimonialsTrack.prepend(before);
  testimonialsTrack.append(after);

  let loopWidth = 0;
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let previousTime = performance.now();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const measureCarousel = () => {
    loopWidth = testimonialsTrack.scrollWidth / 3;
    testimonialsCarousel.scrollLeft = loopWidth;
  };

  const stopDragging = (event) => {
    if (!isDragging) return;
    isDragging = false;
    testimonialsCarousel.classList.remove("dragging");
    if (event?.pointerId !== undefined && testimonialsCarousel.hasPointerCapture(event.pointerId)) {
      testimonialsCarousel.releasePointerCapture(event.pointerId);
    }
  };

  testimonialsCarousel.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startScrollLeft = testimonialsCarousel.scrollLeft;
    testimonialsCarousel.classList.add("dragging");
    testimonialsCarousel.setPointerCapture(event.pointerId);
  });

  testimonialsCarousel.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    testimonialsCarousel.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  testimonialsCarousel.addEventListener("pointerup", stopDragging);
  testimonialsCarousel.addEventListener("pointercancel", stopDragging);
  testimonialsCarousel.addEventListener("lostpointercapture", stopDragging);
  testimonialsCarousel.addEventListener("dragstart", (event) => event.preventDefault());

  const animateTestimonials = (time) => {
    const elapsed = Math.min(time - previousTime, 40);
    previousTime = time;

    if (!isDragging && !reduceMotion && !document.hidden) {
      testimonialsCarousel.scrollLeft += elapsed * 0.06;
    }

    if (loopWidth > 0) {
      if (testimonialsCarousel.scrollLeft >= loopWidth * 2) {
        testimonialsCarousel.scrollLeft -= loopWidth;
      } else if (testimonialsCarousel.scrollLeft <= 0) {
        testimonialsCarousel.scrollLeft += loopWidth;
      }
    }

    window.requestAnimationFrame(animateTestimonials);
  };

  window.addEventListener("load", measureCarousel, { once: true });
  window.addEventListener("resize", measureCarousel);
  measureCarousel();
  window.requestAnimationFrame(animateTestimonials);
}
