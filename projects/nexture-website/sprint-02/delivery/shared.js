document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  const navLink = document.querySelector(`[data-nav="${page}"]`);
  if (navLink) navLink.classList.add('nav__link--active');

  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      menu.style.display = expanded ? 'none' : 'flex';
    });
  }

  const video = document.getElementById('hero-video');
  if (video) {
    video.addEventListener('click', () => {
      video.muted = !video.muted;
      video.volume = 0.6;
    });
  }
});
