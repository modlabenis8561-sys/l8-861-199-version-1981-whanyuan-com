(() => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let active = 0;

    const show = (index) => {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle("is-active", current === active);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => show(index));
    });

    if (prev) {
      prev.addEventListener("click", () => show(active - 1));
    }

    if (next) {
      next.addEventListener("click", () => show(active + 1));
    }

    show(0);
    if (slides.length > 1) {
      setInterval(() => show(active + 1), 5600);
    }
  }

  const forms = Array.from(document.querySelectorAll("[data-filter-form]"));
  forms.forEach((form) => {
    const scopeSelector = form.getAttribute("data-scope") || "[data-filter-scope]";
    const scope = document.querySelector(scopeSelector);
    if (!scope) {
      return;
    }
    const cards = Array.from(scope.querySelectorAll("[data-filter-card]"));
    const input = form.querySelector("[data-filter-text]");
    const genre = form.querySelector("[data-filter-genre]");
    const year = form.querySelector("[data-filter-year]");
    const empty = document.querySelector(form.getAttribute("data-empty") || "[data-empty-state]");

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : "";
      const genreValue = genre ? genre.value : "";
      const yearValue = year ? year.value : "";
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.getAttribute("data-text") || "").toLowerCase();
        const cardGenre = card.getAttribute("data-genre") || "";
        const cardYear = card.getAttribute("data-year") || "";
        const matchesText = !query || text.includes(query);
        const matchesGenre = !genreValue || cardGenre.includes(genreValue);
        const matchesYear = !yearValue || cardYear === yearValue;
        const matches = matchesText && matchesGenre && matchesYear;
        card.classList.toggle("hidden-card", !matches);
        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    [input, genre, year].forEach((element) => {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    apply();
  });
})();
