import { loadData, saveData, resetToOriginal } from './state.js';
import { renderChart } from './chart.js';
import { renderTable, attachSorting } from './table.js';
import { parseCSV, normalizeImported, toCsv } from './csv.js';
import { normalizeRecord } from './utils.js';

const xAxisSel = document.getElementById('xAxis');
const yAxisSel = document.getElementById('yAxis');
const sexFilter = document.getElementById('sexFilter');
const sizeByHeight = document.getElementById('sizeByHeight');
const addForm = document.getElementById('addForm');
const summaryCount = document.getElementById('summaryCount');
const resetBtn = document.getElementById('resetBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

const chartRef = { current: null };

function getFiltered(data) {
  const f = sexFilter.value;
  if (f === 'ALL') return data;
  if (f === 'OTHER') return data.filter(r => !r.sex || (r.sex.toUpperCase() !== 'F' && r.sex.toUpperCase() !== 'M'));
  return data.filter(r => (r.sex || '').toUpperCase() === f);
}

function rerender(state) {
  const filtered = getFiltered(state.data);
  summaryCount.textContent = filtered.length;
  renderChart({
    data: filtered,
    xKey: xAxisSel.value,
    yKey: yAxisSel.value,
    sizeByHeight: sizeByHeight.checked,
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

  attachSorting(state);
  renderTable(state);
  rerender(state);

  [xAxisSel, yAxisSel, sexFilter, sizeByHeight].forEach(el => el.addEventListener('change', () => rerender(state)));

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
    renderTable(state);
    rerender(state);
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset to original data from the spreadsheet? This will clear your local edits.')) return;
    state.data = resetToOriginal();
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
