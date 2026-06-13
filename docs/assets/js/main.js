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
