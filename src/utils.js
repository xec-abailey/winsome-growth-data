// Utility helpers
export function num(x) {
  const n = typeof x === "string" ? parseFloat(x) : x;
  return Number.isFinite(n) ? n : null;
}

export function normalizeRecord(r) {
  if (!r || typeof r !== "object") return {};
  const out = { ...r };
  // migrate legacy column names
  if (out["Name"] && !out.name) out.name = out["Name"];
  if (out["Weight (lbs)"] != null && out.weight_lbs == null)
    out.weight_lbs = num(out["Weight (lbs)"]);
  if (out["Age (Normalized Weeks)"] != null && out.age_weeks == null)
    out.age_weeks = num(out["Age (Normalized Weeks)"]);
  if (out["Height (in)"] != null && out.height_in == null)
    out.height_in = num(out["Height (in)"]);
  // coerce numbers
  out.weight_lbs = num(out.weight_lbs);
  out.age_weeks = num(out.age_weeks);
  out.height_in = num(out.height_in);
  // normalize sex
  if (out.sex != null) {
    const s = String(out.sex).trim().toUpperCase();
    if (s.startsWith("F")) out.sex = "F";
    else if (s.startsWith("M")) out.sex = "M";
    else out.sex = s || null;
  } else {
    out.sex = null;
  }
  return out;
}
