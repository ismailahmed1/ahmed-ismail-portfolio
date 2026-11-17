/* ---------- Day / night ---------- */

const root = document.documentElement;
const toggle = document.getElementById('theme-toggle');

function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to day' : 'Switch to night');
    if (persist) {
        try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked */ }
    }
}

setTheme(root.getAttribute('data-theme') || 'light', false);

toggle.addEventListener('click', () => {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
});

/* ---------- Hotbar: highlight the section in view, number keys jump ---------- */

const slots = [...document.querySelectorAll('.hotbar a')];
const sections = slots.map((a) => document.querySelector(a.getAttribute('href')));

function syncHotbar() {
    let current = -1;
    sections.forEach((section, i) => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = i;
    });
    /* At the very bottom the last section may never reach the line */
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = sections.length - 1;
    }
    slots.forEach((a, i) => {
        a.classList.toggle('active', i === current);
        if (i === current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
    });
}

let queued = false;
window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
        syncHotbar();
        queued = false;
    });
}, { passive: true });
syncHotbar();

document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    const n = Number(e.key);
    if (n >= 1 && n <= slots.length) slots[n - 1].click();
});

/* ---------- Copy email ---------- */

const toastEl = document.getElementById('toast');
const emailLink = document.getElementById('email-link');
let toastTimer;

function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

emailLink.addEventListener('click', (e) => {
    if (!navigator.clipboard) return;
    e.preventDefault();
    navigator.clipboard
        .writeText(emailLink.dataset.email)
        .then(() => toast(`Copied ${emailLink.dataset.email}`))
        .catch(() => { window.location.href = emailLink.href; });
});
