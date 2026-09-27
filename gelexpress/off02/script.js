const checkoutUrls = {
  essencial: "https://pay.hotmart.com/H107776419T?off=f6r8ti5i&checkoutMode=10",
  pro: "https://pay.hotmart.com/H107776419T?off=j4vtryhy&checkoutMode=10",
  "pro-discount": "https://pay.hotmart.com/H107776419T?off=asmp9nue&checkoutMode=10",
  "essencial-direto": "https://pay.hotmart.com/H107776419T?off=f6r8ti5i&checkoutMode=10",
};

const essentialUpgradeModal = document.querySelector("#essential-upgrade-modal");
const essentialUpgradeClose = essentialUpgradeModal?.querySelector(".upgrade-modal-close");
let lastUpgradeTrigger = null;

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
