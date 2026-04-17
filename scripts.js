
function filterExp(type) {
  const allItems = document.querySelectorAll('#experience .tl-item');
  const proExtra = document.getElementById('experience-extra');
  const proToggle = document.getElementById('exp-toggle-btn');
  const funExtra  = document.getElementById('fun-extra');
  const funToggle = document.getElementById('fun-toggle-btn');

  if (type === 'fun') {
    allItems.forEach(item => {
      if (!item.dataset.expType || item.dataset.expType === 'professional') {
        item.style.display = 'none';
      } else {
        item.classList.add('exp-visible');
      }
    });
    if (proExtra) proExtra.classList.remove('open');
    if (proToggle) proToggle.style.display = 'none';
    if (funExtra && funToggle) {
      const count = funExtra.querySelectorAll('.tl-item[data-exp-type="fun"]').length;
      funExtra.classList.remove('open');
      funToggle.classList.remove('open');
      funToggle.setAttribute('aria-expanded', 'false');
      funToggle.querySelector('.toggle-label').textContent = `Show ${count} more`;
      funToggle.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  } else {
    allItems.forEach(item => {
      if (!item.dataset.expType || item.dataset.expType === 'professional') {
        item.style.display = '';
      } else {
        item.classList.remove('exp-visible');
      }
    });
    if (proExtra && proToggle) {
      const count = proExtra.querySelectorAll('.tl-item').length;
      proExtra.classList.remove('open');
      proToggle.classList.remove('open');
      proToggle.setAttribute('aria-expanded', 'false');
      proToggle.querySelector('.toggle-label').textContent = `Show ${count} more`;
      proToggle.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (funExtra) funExtra.classList.remove('open');
    if (funToggle) funToggle.style.display = 'none';
  }
}
  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Abstract toggles
function toggleSection(extraId, btnId) {
  const extra = document.getElementById(extraId);
  const btn   = document.getElementById(btnId);
  const count = extra.querySelectorAll('li').length;
  const isOpen = extra.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
  btn.setAttribute('aria-expanded', isOpen);
  btn.querySelector('.toggle-label').textContent = isOpen
    ? 'Show less'
    : 'Show ' + count + ' more';
}

// Set initial button labels on page load
document.addEventListener('DOMContentLoaded', () => {
  [['experience-extra','exp-toggle-btn'], ['awards-extra','awards-toggle-btn']].forEach(([extraId, btnId]) => {
    const extra = document.getElementById(extraId);
    const btn   = document.getElementById(btnId);
    if (extra && btn) {
      const count = extra.querySelectorAll('li').length;
      btn.querySelector('.toggle-label').textContent = 'Show ' + count + ' more';
    }
  });
});
function openResearchModal(data) {
  document.getElementById('researchModalTitle').textContent = data.title;
  document.getElementById('researchModalAuthors').textContent = data.authors;
  document.getElementById('researchModalText').textContent = data.abstract;
  var tagsEl = document.getElementById('researchModalTags');
  tagsEl.innerHTML = data.tags.map(function(t){ return '<span class="paper-tag">' + t + '</span>'; }).join('');
  document.getElementById('researchModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeResearchModal() {
  document.getElementById('researchModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function handleResearchModalClick(e) {
  if (e.target === document.getElementById('researchModalOverlay')) closeResearchModal();
}
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeResearchModal(); });
function toggleAbstract(btn) {
  const box = btn.parentElement.nextElementSibling;
  const open = box.classList.toggle('open');
  const label = btn.dataset.label || 'Abstract';
  btn.textContent = open ? '\u2212 ' + label : '+ ' + label;}
  // Active nav highlighting on scroll
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');
  // Scroll progress bar + back-to-top
  const progressBar = document.getElementById('scroll-progress');
  const backToTop   = document.getElementById('back-to-top');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  window.addEventListener('scroll', () => {
    // Update progress bar
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    // Show/hide back-to-top after 400px
    if (backToTop) backToTop.classList.toggle('visible', scrolled > 400);
    // Active nav
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
    navAs.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + cur) a.classList.add('active');
    });
  }, { passive: true });
  // Dark mode toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon   = document.getElementById('theme-icon');

  // Remember preference across page loads
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  });