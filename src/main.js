import { loadData, saveData } from './state.js';
import { renderChart } from './chart.js';
import { renderTable, attachSorting } from './table.js';
import { parseCSV, normalizeImported, toCsv } from './csv.js';
import { normalizeRecord } from './utils.js';

const xAxisSel = document.getElementById('xAxis');
const yAxisSel = document.getElementById('yAxis');
const sexFilter = document.getElementById('sexFilter');
const addForm = document.getElementById('addForm');
const summaryCount = document.getElementById('summaryCount');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
// New controls
const colorBySel = document.getElementById('colorBy');
const nameFilterSel = document.getElementById('nameFilter');

const chartRef = { current: null };

function updateNameOptions(state) {
  if (!nameFilterSel) return;
  const prev = nameFilterSel.value;
  const names = Array.from(
    new Set(state.data.map(r => (r.name || '').toString().trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
  nameFilterSel.innerHTML = ['<option value="ALL">All</option>', ...names.map(n => `<option value="${n}">${n}</option>`)].join('');
  if (names.includes(prev)) nameFilterSel.value = prev; else nameFilterSel.value = 'ALL';
}

function getFiltered(data) {
  let out = data;
  const f = sexFilter.value;
  if (f === 'ALL') {
    // no-op
  } else if (f === 'OTHER') {
    out = out.filter(r => !r.sex || (r.sex.toUpperCase() !== 'F' && r.sex.toUpperCase() !== 'M'));
  } else {
    out = out.filter(r => (r.sex || '').toUpperCase() === f);
  }
  const nameVal = nameFilterSel?.value;
  if (nameVal && nameVal !== 'ALL') {
    out = out.filter(r => (r.name || '').toString().trim() === nameVal);
  }
  return out;
}

function rerender(state) {
  const filtered = getFiltered(state.data);
  summaryCount.textContent = filtered.length;
  renderChart({
    data: filtered,
    fullData: state.data,
    xKey: xAxisSel.value,
    yKey: yAxisSel.value,
    sizeByHeight: false, // Always set to false
    colorBy: colorBySel?.value || 'sex',
    chartRef,
    summaryEl: summaryCount
  });
}

async function init() {
  const state = {
    data: await loadData(),
    sortCol: null,
    sortAsc: true,
    onChange: () => rerender(state)
  };

  updateNameOptions(state);
  attachSorting(state);
  renderTable(state);
  rerender(state);

  [xAxisSel, yAxisSel, sexFilter, colorBySel, nameFilterSel].filter(Boolean)
    .forEach(el => el.addEventListener('change', () => rerender(state)));

  addForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData(addForm);
    const rec = normalizeRecord({
      weight_lbs: form.get('weight_lbs'),
      age_weeks: form.get('age_weeks'),
      height_in: form.get('height_in'),
      sex: form.get('sex'),
      name: form.get('name')
    });
    state.data = [...state.data, rec];
    saveData(state.data);
    addForm.reset();
    updateNameOptions(state);
    renderTable(state);
    rerender(state);
  });

  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCSV(text);
    if (!parsed.length) {
      alert('No rows found in CSV.');
      return;
    }
    const normalized = normalizeImported(parsed);
    const append = confirm('Import complete. Click OK to APPEND, or Cancel to REPLACE your current data.');
    state.data = append ? state.data.concat(normalized) : normalized;
    saveData(state.data);
    updateNameOptions(state);
    renderTable(state);
    rerender(state);
    importFile.value = '';
  });

  exportCsvBtn.addEventListener('click', () => {
    const csv = toCsv(state.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dog_metrics.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

init();
