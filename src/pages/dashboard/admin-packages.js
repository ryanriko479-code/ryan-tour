// ==========================================================
// admin-packages.js — CRUD for pre-built packages
// ==========================================================

import { fetchPackages } from '../../services/dataLoader.js';
import { renderPackagesGrid } from '../../components/admin/forms.js';

export async function renderAdminPackages() {
  const packages = await fetchPackages();
  return renderPackagesGrid(packages);
}
