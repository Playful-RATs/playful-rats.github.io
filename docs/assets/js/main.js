const filters = document.querySelectorAll("[data-filter]");
const resultVideos = document.querySelectorAll(".result-video");

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const selected = filter.dataset.filter;

    filters.forEach((item) => item.classList.toggle("active", item === filter));
    resultVideos.forEach((video) => {
      video.hidden = selected !== "all" && video.dataset.kind !== selected;
    });
  });
});

const contents = document.querySelector(".contents");
const contentsStart = document.querySelector(".prose .lead");

if (contents && contentsStart) {
  const contentsLinks = Array.from(contents.querySelectorAll('a[href^="#"]'));
  const contentsTargets = contentsLinks
    .map((link) => ({ link, target: document.querySelector(link.getAttribute("href")) }))
    .filter(({ target }) => target);
  let contentsFrame;

  const updateContents = () => {
    contentsFrame = undefined;

    const viewportMarker = window.scrollY + window.innerHeight * 0.4;
    const startScroll = contentsStart.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55;
    const endScroll = Math.max(startScroll + 1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, (window.scrollY - startScroll) / (endScroll - startScroll)));

    contents.classList.toggle("is-visible", window.scrollY >= startScroll);
    contents.style.setProperty("--scroll-progress", progress);

    let activeTarget = contentsTargets[0];
    contentsTargets.forEach((item) => {
      const targetTop = item.target.getBoundingClientRect().top + window.scrollY;
      if (targetTop <= viewportMarker) activeTarget = item;
    });

    contentsTargets.forEach((item) => {
      if (item === activeTarget) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    });
  };

  const requestContentsUpdate = () => {
    if (contentsFrame) return;
    contentsFrame = window.requestAnimationFrame(updateContents);
  };

  window.addEventListener("scroll", requestContentsUpdate, { passive: true });
  window.addEventListener("resize", requestContentsUpdate);
  updateContents();
}

const teamDiagram = document.querySelector(".team-diagram");
const teamCycle = document.querySelector(".team-cycle");
const teamPrimaryHighlight = document.querySelector(".team-highlight-primary");
const teamSecondaryHighlight = document.querySelector(".team-highlight-secondary");
const teamCards = Array.from(document.querySelectorAll("[data-team-step]"));

if (teamDiagram && teamCycle && teamPrimaryHighlight && teamSecondaryHighlight && teamCards.length) {
  const teamSteps = [
    {
      name: "proposal",
      primary: { left: "0.4%", top: "52%", width: "19.3%", height: "36.8%" },
      secondary: { left: "28.2%", top: "0.4%", width: "13.9%", height: "28.5%" },
    },
    {
      name: "planning",
      primary: { left: "20.6%", top: "52%", width: "12.8%", height: "36.8%" },
    },
    {
      name: "execution",
      primary: { left: "34.2%", top: "52%", width: "31.8%", height: "36.8%" },
    },
    {
      name: "verification",
      primary: { left: "67.2%", top: "50.5%", width: "31.5%", height: "44.2%" },
    },
    {
      name: "memory",
      primary: { left: "65.8%", top: "0.8%", width: "26.2%", height: "23.5%" },
    },
  ];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let teamStepIndex = 0;
  let teamTimer;

  const positionHighlight = (highlight, box) => {
    highlight.classList.toggle("is-hidden", !box);
    if (!box) return;
    Object.entries(box).forEach(([property, value]) => {
      highlight.style[property] = value;
    });
  };

  const showTeamStep = (index) => {
    const step = teamSteps[index];
    positionHighlight(teamPrimaryHighlight, step.primary);
    positionHighlight(teamSecondaryHighlight, step.secondary);
    teamCards.forEach((card) => card.classList.toggle("is-active", card.dataset.teamStep === step.name));
  };

  const stopTeamAnimation = () => {
    window.clearTimeout(teamTimer);
    teamTimer = undefined;
  };

  const animateTeamIteration = () => {
    teamCycle.classList.remove("is-iterating");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => teamCycle.classList.add("is-iterating"));
    });
  };

  const scheduleTeamStep = () => {
    teamTimer = window.setTimeout(() => {
      const nextStepIndex = (teamStepIndex + 1) % teamSteps.length;

      if (nextStepIndex === 0) {
        animateTeamIteration();
        teamTimer = window.setTimeout(() => {
          teamStepIndex = nextStepIndex;
          showTeamStep(teamStepIndex);
          teamCycle.classList.remove("is-iterating");
          scheduleTeamStep();
        }, 900);
        return;
      }

      teamStepIndex = nextStepIndex;
      showTeamStep(teamStepIndex);
      scheduleTeamStep();
    }, 2400);
  };

  const startTeamAnimation = () => {
    teamDiagram.classList.add("is-active");
    showTeamStep(teamStepIndex);
    stopTeamAnimation();
    if (reduceMotion) return;
    scheduleTeamStep();
  };

  const teamObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startTeamAnimation();
    else {
      teamDiagram.classList.remove("is-active");
      teamCycle.classList.remove("is-iterating");
      stopTeamAnimation();
    }
  }, { threshold: 0.35 });

  showTeamStep(teamStepIndex);
  teamObserver.observe(teamDiagram);
}
