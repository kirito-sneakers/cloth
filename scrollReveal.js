// scrollReveal.js

export function revealOnScroll() {
  const containers = document.querySelectorAll('.cards-container');
  if (!containers.length) return;

  containers.forEach(container => {
    const cards = container.querySelectorAll('.card');
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach(card => observer.observe(card));
  });
}
