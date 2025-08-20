// Table rendering and interactions
import { saveData } from './state.js';

export function renderTable(state) {
  const tbody = document.querySelector('#dataTable tbody');
  tbody.innerHTML = '';
  let rows = [...state.data];

  if (state.sortCol) {
    rows.sort((a, b) => {
      const va = a[state.sortCol];
      const vb = b[state.sortCol];
      if (va == null && vb == null) return 0;
      if (va == null) return state.sortAsc ? 1 : -1;
      if (vb == null) return state.sortAsc ? -1 : 1;
      if (typeof va === 'number' && typeof vb === 'number') return state.sortAsc ? va - vb : vb - va;
      return state.sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }

  rows.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.weight_lbs ?? ''}</td>
      <td>${r.age_weeks ?? ''}</td>
      <td>${r.height_in ?? ''}</td>
      <td>${r.sex ?? ''}</td>
      <td>${r.name ?? ''}</td>
      <td><button data-idx="${idx}" class="deleteBtn text-red-600 text-sm">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = Number(e.currentTarget.getAttribute('data-idx'));
      state.data.splice(i, 1);
      saveData(state.data);
      renderTable(state);
      state.onChange?.();
    });
  });
}

export function attachSorting(state) {
  document.querySelectorAll('#dataTable th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-col');
      if (state.sortCol === col) {
        state.sortAsc = !state.sortAsc;
      } else {
        state.sortCol = col;
        state.sortAsc = true;
      }
      renderTable(state);
    });
  });
}
