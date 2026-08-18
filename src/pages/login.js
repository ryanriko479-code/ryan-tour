// ==========================================================
// login.js — login page
// ==========================================================

export function renderLogin() {
  return `
  <section class="section wrap" style="max-width:440px; margin:0 auto;">
    <div class="glass" style="padding:34px;">
      <div class="eyebrow">Welcome back</div>
      <h1 class="h2" style="margin-top:8px;">Log in</h1>
      <div class="demo-note">Prototype shortcut — skip the form and jump straight into either dashboard:</div>
      <div style="display:flex; gap:10px; margin-bottom:22px;">
        <button class="btn btn-glass" style="flex:1;" data-quick-login="guest">Demo guest</button>
        <button class="btn btn-glass" style="flex:1;" data-quick-login="admin">Demo admin</button>
      </div>
      <div class="divider"></div>
      <div class="field" style="margin-top:18px;"><label>Email</label><input type="email" id="login-email" placeholder="jane@example.com"></div>
      <div class="field"><label>Password</label><input type="password" id="login-password" placeholder="••••••••"></div>
      <button class="btn btn-gold btn-block" id="login-submit">Log in</button>
      <p class="center-note">No account? <a class="link-underline" href="#/register">Sign up</a></p>
    </div>
  </section>`;
}
