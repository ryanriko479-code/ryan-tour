// ==========================================================
// register.js — registration page
// ==========================================================

export function renderRegister() {
  return `
  <section class="section wrap" style="max-width:440px; margin:0 auto;">
    <div class="glass" style="padding:34px;">
      <div class="eyebrow">New here</div>
      <h1 class="h2" style="margin-top:8px;">Create your account</h1>
      <div class="field" style="margin-top:18px;"><label>Full name</label><input type="text" id="reg-name" placeholder="Jane Wanjiru"></div>
      <div class="field"><label>Email</label><input type="email" id="reg-email" placeholder="jane@example.com"></div>
      <div class="field"><label>Password</label><input type="password" id="reg-password" placeholder="••••••••"></div>
      <button class="btn btn-gold btn-block" id="register-submit">Create account</button>
      <p class="center-note">Already registered? <a class="link-underline" href="#/login">Log in</a></p>
    </div>
  </section>`;
}
