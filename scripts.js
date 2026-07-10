
function filterExp(type) {
  const allItems = Array.from(document.querySelectorAll('#experience .tl-item'));
  const visible = [];
  allItems.forEach(item => {
    item.classList.remove('tl-last-visible');
    const isFun = item.dataset.expType === 'fun';
    if (!isFun) {
      item.style.display = type === 'fun' ? 'none' : '';
    } else {
      item.classList.toggle('exp-visible', type === 'fun');
    }
    if (isFun === (type === 'fun')) visible.push(item);
  });
  if (visible.length) visible[visible.length - 1].classList.add('tl-last-visible');
}
document.addEventListener('DOMContentLoaded', () => filterExp('professional'));
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
  // Scroll progress bar + back-to-top
  // (nav "active" state is now set server-side per page in _includes/nav.html)
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

  // Contact form (submits via Web3Forms so the email address is never exposed client-side)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const status  = document.getElementById('contact-form-status');
      const btn     = document.getElementById('contact-submit-btn');
      const btnHtml = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = 'Sending…';
      status.textContent = '';
      status.classList.remove('success', 'error');

      fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
      })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (ok) {
            status.classList.add('success');
            status.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
            contactForm.reset();
          } else {
            status.classList.add('error');
            status.textContent = data.message || 'Something went wrong. Please try again.';
          }
        })
        .catch(() => {
          status.classList.add('error');
          status.textContent = 'Something went wrong. Please try again, or reach out on Instagram.';
        })
        .finally(() => {
          btn.disabled = false;
          btn.innerHTML = btnHtml;
        });
    });
  }