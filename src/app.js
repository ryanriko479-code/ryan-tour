// ==========================================================
// app.js — KERNEL. Route dispatch + ALL delegated event wiring.
// This is the only module that touches the DOM directly outside of
// the initial index.html shell. Pages/components stay pure; this
// file owns transient UI state, listens on #app, and re-renders.
// ==========================================================

import { currentRoute, onRouteChange, navigate } from './router.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderAdminShell } from './components/admin/admin-shell.js';

import { renderHome } from './pages/home.js';
import { renderPackagesList, renderPackageDetail } from './pages/packages.js';
import { renderParksList, renderParkDetail } from './pages/parks.js';
import { renderAccommodations } from './pages/accommodations.js';
import { renderBooking, refreshPrebuiltSummary, refreshCustomSummary } from './pages/booking.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderMyBookings } from './pages/my-bookings.js';
import { renderAdminOverview } from './pages/dashboard/admin-overview.js';
import { renderAdminBookings } from './pages/dashboard/admin-bookings.js';
import { renderAdminPackages } from './pages/dashboard/admin-packages.js';
import { renderAdminAccommodations } from './pages/dashboard/admin-accommodations.js';
import { renderAdminSettings } from './pages/dashboard/admin-settings.js';

import {
  getUser, isLoggedIn, isGuest, isAdmin,
  login, loginWithSession, loginAsDemoGuest, register, logout,
} from './utilities/auth.js';
import { $, $all, toast } from './utilities/helpers.js';
import { waLink } from './utilities/channelLinks.js';
import { calcCustomPricePerPerson, validatePrebuiltBooking, validateCustomBooking } from './utilities/booking.js';
import { fetchPackages, fetchParks, fetchAddons, createBooking, updateBookingStatus, login as apiLogin, ApiError } from './services/dataLoader.js';

/* ---------------- TRANSIENT UI STATE (not persisted) ---------------- */

const ui = {
  packageFilter: 'all',
  accFilter: 'all',
  adminBookingFilter: 'all',
  bookingMode: 'prebuilt',
  selectedPrebuiltId: null,
  builder: { parks: [], days: 3, accommodationTier: 'mid', transport: 'jeep', addOns: [] },
};

/* ---------------- ROUTE GUARD ---------------- */

function guardedRoute(route) {
  if (route.startsWith('my-bookings') && !isGuest()) return 'login';
  if (route.startsWith('admin') && !isAdmin()) return 'login';
  return route;
}

/* ---------------- MAIN RENDER ---------------- */

async function render() {
  let route = guardedRoute(currentRoute());
  if (route !== currentRoute()) {
    navigate(route);
    return; // hashchange will re-trigger render()
  }

  const parts = route.split('/');
  const top = parts[0];
  const app = $('#app');

  app.innerHTML = renderHeader(route, getUser()) + `<main><div class="section wrap"><div class="empty-state">Loading…</div></div></main>` + renderFooter();

  let body = '';
  if (top === 'home' || top === '') body = await renderHome();
  else if (top === 'packages' && !parts[1]) body = await renderPackagesList(ui.packageFilter);
  else if (top === 'package-detail') body = await renderPackageDetail(parts[1]);
  else if (top === 'parks' && !parts[1]) body = await renderParksList();
  else if (top === 'park-detail') body = await renderParkDetail(parts[1]);
  else if (top === 'accommodations') body = await renderAccommodations(ui.accFilter);
  else if (top === 'booking') {
    if (parts[1]) { ui.bookingMode = 'prebuilt'; ui.selectedPrebuiltId = parts[1]; }
    body = await renderBooking(ui.bookingMode, { selectedPackageId: ui.selectedPrebuiltId, builder: ui.builder });
  } else if (top === 'login') body = renderLogin();
  else if (top === 'register') body = renderRegister();
  else if (top === 'my-bookings') body = await renderMyBookings(getUser());
  else if (top === 'admin') body = await renderAdminBody(parts[1] || 'overview');
  else body = await renderHome();

  app.innerHTML = renderHeader(route, getUser()) + `<main>${body}</main>` + renderFooter();
  wireEvents();
  await hydrateBookingSummaries();
}

async function renderAdminBody(sub) {
  let content;
  if (sub === 'bookings') content = await renderAdminBookings(ui.adminBookingFilter);
  else if (sub === 'packages') content = await renderAdminPackages();
  else if (sub === 'accommodations') content = await renderAdminAccommodations();
  else if (sub === 'settings') content = await renderAdminSettings();
  else content = await renderAdminOverview();
  return renderAdminShell(sub, content);
}

/* ---------------- EVENT WIRING (delegated on #app) ---------------- */

function wireEvents() {
  const app = $('#app');

  app.onclick = async (e) => {
    // Generic navigation
    const navEl = e.target.closest('[data-nav]');
    if (navEl) {
      e.preventDefault();
      const r = navEl.getAttribute('data-nav');
      const id = navEl.getAttribute('data-id');
      const prefill = navEl.getAttribute('data-prefill-package');
      if (r === 'package-detail') navigate('package-detail/' + id);
      else if (r === 'park-detail') navigate('park-detail/' + id);
      else if (r === 'booking' && prefill) navigate('booking/' + prefill);
      else navigate(r);
      return;
    }

    // Filters
    const filterPkg = e.target.closest('[data-filter-package]');
    if (filterPkg) { ui.packageFilter = filterPkg.getAttribute('data-filter-package'); render(); return; }

    const filterAcc = e.target.closest('[data-filter-acc]');
    if (filterAcc) { ui.accFilter = filterAcc.getAttribute('data-filter-acc'); render(); return; }

    const filterAdminBooking = e.target.closest('[data-filter-admin-booking]');
    if (filterAdminBooking) { ui.adminBookingFilter = filterAdminBooking.getAttribute('data-filter-admin-booking'); render(); return; }

    // Booking mode toggle
    const bmode = e.target.closest('[data-booking-mode]');
    if (bmode) { ui.bookingMode = bmode.getAttribute('data-booking-mode'); render(); return; }

    // Auth: guest demo shortcut (no admin equivalent — admin is real login only)
    const quickLogin = e.target.closest('[data-quick-login]');
    if (quickLogin) {
      const user = loginAsDemoGuest();
      toast(`Logged in as ${user.name} (guest)`);
      navigate('my-bookings');
      return;
    }

    if (e.target.id === 'login-submit') {
      const email = $('#login-email').value.trim();
      const password = $('#login-password').value;
      if (!email) { toast('Enter your email to continue', 'err'); return; }

      // Password present → this is an admin login attempt, verified
      // server-side against the Worker's hashed admin list. No password
      // → treat as the existing guest pseudo-login (name derived from
      // the email, no server round-trip).
      if (password) {
        try {
          const { user, token } = await apiLogin(email, password);
          loginWithSession(user, token);
          toast(`Logged in as ${user.name} (admin)`);
          navigate('admin');
        } catch (err) {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            toast('Incorrect email or password', 'err');
          } else {
            toast('Login failed — check your connection and try again', 'err');
          }
        }
        return;
      }

      const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      login({ name, email, role: 'guest' });
      toast('Logged in successfully');
      navigate('my-bookings');
      return;
    }

    if (e.target.id === 'register-submit') {
      const name = $('#reg-name').value.trim();
      const email = $('#reg-email').value.trim();
      if (!name || !email) { toast('Fill in your name and email', 'err'); return; }
      register({ name, email });
      toast('Account created — welcome!');
      navigate('my-bookings');
      return;
    }

    if (e.target.getAttribute('data-action') === 'logout') {
      logout();
      toast('Logged out');
      navigate('home');
      return;
    }

    // Pre-built booking submit
    if (e.target.id === 'pb-submit') {
      const packages = await fetchPackages();
      const p = packages.find((pkg) => pkg.id === $('#pb-package').value);
      const name = $('#pb-name').value.trim();
      const email = $('#pb-email').value.trim();
      const group = parseInt($('#pb-group').value || 1, 10);
      const date = $('#pb-date').value;

      const errors = validatePrebuiltBooking({ name, email, date, group });
      if (errors.length) { toast(errors[0], 'err'); return; }

      const total = p.price * group;
      const booking = await createBooking({
        mode: 'prebuilt', packageId: p.id, guestName: name, guestEmail: email,
        groupSize: group, startDate: date, totalPrice: total,
      });
      toast('Booking request submitted — redirecting to WhatsApp');
      setTimeout(() => {
        window.open(waLink(`Hi! I'd like to book "${p.name}" for ${group} guests starting ${date}. Booking ref ${booking.id}. Total est. $${total.toLocaleString()}.`), '_blank');
      }, 500);
      if (!isLoggedIn()) login({ name, email, role: 'guest' });
      navigate('my-bookings');
      return;
    }

    // Custom booking submit
    if (e.target.id === 'cb-submit') {
      const b = ui.builder;
      const name = $('#cb-name').value.trim();
      const email = $('#cb-email').value.trim();
      const group = parseInt($('#cb-group').value || 1, 10);
      const date = $('#cb-date').value;

      const errors = validateCustomBooking({ name, email, date, group, parks: b.parks });
      if (errors.length) { toast(errors[0], 'err'); return; }

      const addons = await fetchAddons();
      const perPerson = calcCustomPricePerPerson(b, addons);
      const booking = await createBooking({
        mode: 'custom', guestName: name, guestEmail: email, groupSize: group, startDate: date,
        customDetails: { parks: [...b.parks], days: b.days, accommodationTier: b.accommodationTier, transport: b.transport, addOns: [...b.addOns] },
        totalPrice: perPerson * group,
      });
      toast('Custom booking submitted — redirecting to WhatsApp');
      const parks = await fetchParks();
      const parkNames = b.parks.map((id) => parks.find((p) => p.id === id)?.name || id).join(', ');
      setTimeout(() => {
        window.open(waLink(`Hi! I'd like a custom safari: ${parkNames}, ${b.days} days, ${b.accommodationTier} stay, ${b.transport}. Booking ref ${booking.id}.`), '_blank');
      }, 500);
      if (!isLoggedIn()) login({ name, email, role: 'guest' });
      navigate('my-bookings');
      return;
    }

    // Admin CRUD stubs
    if (['admin-new-package', 'admin-edit-package'].includes(e.target.getAttribute('data-action'))) {
      toast('Package editor is a prototype stub — hook up to real CRUD later');
      return;
    }
    if (['admin-new-acc', 'admin-edit-acc'].includes(e.target.getAttribute('data-action'))) {
      toast('Accommodation editor is a prototype stub — hook up to real CRUD later');
      return;
    }
    if (e.target.getAttribute('data-action') === 'admin-save-settings') {
      toast('Settings saved');
      return;
    }

    // Modal close
    if (e.target.closest('[data-action="close-modal"]') || e.target.getAttribute('data-action') === 'close-modal-backdrop') {
      $('#modal-root').innerHTML = '';
      return;
    }
  };

  app.onchange = async (e) => {
    if (e.target.id === 'pb-package' || e.target.id === 'pb-group') {
      const packageId = $('#pb-package').value;
      const group = parseInt($('#pb-group').value || 1, 10);
      const box = $('#pb-summary');
      if (box) box.innerHTML = await refreshPrebuiltSummary(packageId, group);
      return;
    }

    if (e.target.matches('[data-custom-park]')) {
      const id = e.target.getAttribute('data-custom-park');
      if (e.target.checked) ui.builder.parks.push(id);
      else ui.builder.parks = ui.builder.parks.filter((p) => p !== id);
      render();
      return;
    }

    if (e.target.matches('[data-custom-addon]')) {
      const id = e.target.getAttribute('data-custom-addon');
      if (e.target.checked) ui.builder.addOns.push(id);
      else ui.builder.addOns = ui.builder.addOns.filter((a) => a !== id);
      e.target.closest('.checkbox-card')?.classList.toggle('checked', e.target.checked);
      const box = $('#cb-summary');
      if (box) box.innerHTML = await refreshCustomSummary(ui.builder);
      return;
    }

    if (e.target.id === 'cb-days') { ui.builder.days = parseInt(e.target.value || 1, 10); await refreshCb(); return; }
    if (e.target.id === 'cb-tier') { ui.builder.accommodationTier = e.target.value; await refreshCb(); return; }
    if (e.target.id === 'cb-transport') { ui.builder.transport = e.target.value; await refreshCb(); return; }

    if (e.target.matches('[data-admin-status]')) {
      const id = e.target.getAttribute('data-admin-status');
      await updateBookingStatus(id, e.target.value);
      toast(`Booking ${id} marked ${e.target.value}`);
      render();
    }
  };

  async function refreshCb() {
    const box = $('#cb-summary');
    if (box) box.innerHTML = await refreshCustomSummary(ui.builder);
  }
}

/* ---------------- POST-RENDER HOOKS (async summaries on first paint) ---------------- */

async function hydrateBookingSummaries() {
  const route = currentRoute();
  if (!route.startsWith('booking')) return;
  if (ui.bookingMode === 'prebuilt') {
    const packages = await fetchPackages();
    const id = ui.selectedPrebuiltId || packages[0].id;
    const group = parseInt($('#pb-group')?.value || 2, 10);
    const box = $('#pb-summary');
    if (box) box.innerHTML = await refreshPrebuiltSummary(id, group);
  } else {
    const box = $('#cb-summary');
    if (box) box.innerHTML = await refreshCustomSummary(ui.builder);
  }
}

/* ---------------- BOOT ---------------- */

onRouteChange(() => { render(); window.scrollTo(0, 0); });
render();