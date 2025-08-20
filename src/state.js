// State management and data loading
import { normalizeRecord } from './utils.js';

const LS_KEY = 'dog_metrics_data_v2';
let originalData = [];

export async function loadData() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeRecord);
    } catch {}
  }
  try {
    const res = await fetch('data/original_data.json');
    const data = await res.json();
    originalData = Array.isArray(data) ? data.map(normalizeRecord) : [];
  } catch {
    originalData = [];
  }
  return [...originalData];
}

export function saveData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function resetToOriginal() {
  localStorage.removeItem(LS_KEY);
  return [...originalData];
}
