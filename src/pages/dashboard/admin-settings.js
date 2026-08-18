// ==========================================================
// admin-settings.js — settings (park fees, currency, contact info)
// ==========================================================

import { renderSettingsForm } from '../../components/admin/forms.js';

export async function renderAdminSettings() {
  return renderSettingsForm();
}
