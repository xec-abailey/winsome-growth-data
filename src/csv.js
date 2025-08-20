// CSV utilities
import { normalizeRecord } from './utils.js';

export function detectDelimiter(text) {
  const candidates = [",", "\t", ";", "|"];
  let bestDelim = ",";
  let bestScore = -1;
  for (const d of candidates) {
    const lines = text.split(/\r?\n/).slice(0, 10).filter(Boolean);
    if (!lines.length) continue;
    const counts = lines.map(l => l.split(d).length);
    const variance = counts.reduce((a, c) => a + c, 0) / counts.length;
    if (variance > bestScore) {
      bestScore = variance;
      bestDelim = d;
    }
  }
  return bestDelim;
}

export function parseCSV(text) {
  const delim = detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return [];
  const header = lines[0].split(delim).map(h => h.trim());
  const rows = lines.slice(1);
  const out = [];
  for (const line of rows) {
    const cols = line.split(delim);
    const rec = {};
    header.forEach((h, i) => {
      rec[h] = i < cols.length ? cols[i].trim() : "";
    });
    out.push(rec);
  }
  return out;
}

function headerMapFor(obj) {
  const keys = Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = k;
    return acc;
  }, {});
  const pick = variants => {
    for (const v of variants) {
      const lk = v.toLowerCase();
      if (lk in keys) return keys[lk];
    }
    return null;
  };
  return {
    weight: pick(["weight_lbs", "weight (lbs)", "weight", "wt"]),
    age: pick(["age_weeks", "age (normalized weeks)", "age", "age (weeks)"]),
    height: pick(["height_in", "height (in)", "height", "ht"]),
    sex: pick(["sex", "gender"]),
    name: pick(["name", "Name"])
  };
}

export function normalizeImported(records) {
  const out = [];
  for (const r of records) {
    const map = headerMapFor(r);
    const norm = {
      weight_lbs: map.weight ? r[map.weight] : null,
      age_weeks: map.age ? r[map.age] : null,
      height_in: map.height ? r[map.height] : null,
      sex: map.sex ? r[map.sex] : null,
      name: map.name ? r[map.name] : null
    };
    out.push(normalizeRecord(norm));
  }
  return out;
}

export function toCsv(arr) {
  const headers = ["weight_lbs", "age_weeks", "height_in", "sex", "name"];
  const lines = [headers.join(",")];
  for (const r of arr) {
    const row = headers
      .map(h => {
        let v = r[h];
        if (v === null || v === undefined) return "";
        if (typeof v === "string" && (v.includes(',') || v.includes('"') || v.includes('\n'))) {
          v = '"' + v.replace(/"/g, '""') + '"';
        }
        return v;
      })
      .join(",");
    lines.push(row);
  }
  return lines.join("\n");
}
