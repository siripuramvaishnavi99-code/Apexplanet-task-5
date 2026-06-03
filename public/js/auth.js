/* ================================================
   ApexStore — auth.js  (Login / Register pages)
   ================================================ */
'use strict';

/* ── Password strength indicator ─────────────── */
function checkPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
function renderStrength(pw, el) {
  if (!el) return;
  const s = checkPasswordStrength(pw);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#059669'];
  el.innerHTML = pw ? `<span style="color:${colors[s]};font-weight:600">${labels[s]}</span>` : '';
}

/* ── Password toggle ──────────────────────────── */
function initPasswordToggles() {
  document.querySelectorAll('.toggle-pw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-toggle').querySelector('input');
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.textContent = isText ? '👁' : '🙈';
      btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
    });
  });
}

/* ── Register Form ────────────────────────────── */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;
  const pwInput = document.getElementById('reg-password');
  const strengthEl = document.getElementById('password-strength');
  if (pwInput) {
    pwInput.addEventListener('input', () => renderStrength(pwInput.value, strengthEl));
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearFormErrors(form);
    const btn = form.querySelector('[type=submit]');
    const name = form.querySelector('#reg-name').value.trim();
    const email = form.querySelector('#reg-email').value.trim();
    const password = pwInput.value;
    const confirm = form.querySelector('#reg-confirm').value;

    let valid = true;
    if (name.length < 2) { showFieldError('reg-name', 'Name must be at least 2 characters'); valid = false; }
    if (!email.includes('@')) { showFieldError('reg-email', 'Please enter a valid email'); valid = false; }
    if (password.length < 6) { showFieldError('reg-password', 'Password must be at least 6 characters'); valid = false; }
    if (!/[A-Z]/.test(password)) { showFieldError('reg-password', 'Password must contain an uppercase letter'); valid = false; }
    if (!/[0-9]/.test(password)) { showFieldError('reg-password', 'Password must contain a number'); valid = false; }
    if (password !== confirm) { showFieldError('reg-confirm', 'Passwords do not match'); valid = false; }
    if (!valid) return;

    btn.disabled = true; btn.textContent = 'Creating account…';
    try {
      await api('POST', '/auth/register', { name, email, password });
      Toast.success('Account created! Redirecting…');
      setTimeout(() => location.href = '/dashboard', 1500);
    } catch (err) {
      showAlert(form, err.message, 'danger');
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  });
}

/* ── Login Form ───────────────────────────────── */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearFormErrors(form);
    const btn = form.querySelector('[type=submit]');
    const email = form.querySelector('#login-email').value.trim();
    const password = form.querySelector('#login-password').value;

    let valid = true;
    if (!email) { showFieldError('login-email', 'Email is required'); valid = false; }
    if (!password) { showFieldError('login-password', 'Password is required'); valid = false; }
    if (!valid) return;

    btn.disabled = true; btn.textContent = 'Logging in…';
    try {
      const { user } = await api('POST', '/auth/login', { email, password });
      Toast.success(`Welcome back, ${user.name}!`);
      setTimeout(() => location.href = user.role === 'admin' ? '/admin' : '/dashboard', 1200);
    } catch (err) {
      showAlert(form, err.message, 'danger');
      btn.disabled = false; btn.textContent = 'Log In';
    }
  });
}

/* ── Form helpers ─────────────────────────────── */
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('is-invalid');
  let err = el.nextElementSibling;
  if (!err || !err.classList.contains('form-error')) {
    err = document.createElement('p');
    err.className = 'form-error';
    el.insertAdjacentElement('afterend', err);
  }
  err.textContent = msg;
}
function clearFormErrors(form) {
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('.form-error').forEach(el => el.remove());
  form.querySelectorAll('.alert').forEach(el => el.remove());
}
function showAlert(form, msg, type) {
  const existing = form.querySelector('.alert');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.setAttribute('role', 'alert');
  div.textContent = msg;
  form.prepend(div);
}

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initRegisterForm();
  initLoginForm();
});
