document
  .querySelectorAll<HTMLElement>('.animated-accordion')
  .forEach((accordion) => {
    const trigger = accordion.querySelector<HTMLButtonElement>(
      '.accordion-trigger'
    );

    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = accordion.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });