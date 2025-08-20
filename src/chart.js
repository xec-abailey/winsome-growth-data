// Chart rendering
function getColorPalette() {
  // 20 visually distinct colors
  return [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173', '#3182bd', '#31a354', '#756bb1', '#636363', '#e6550d'
  ];
}

const namedColorCache = new Map();
function colorForGroup(label) {
  if (label === 'F') return 'rgba(79, 70, 229, 0.7)';
  if (label === 'M') return 'rgba(220, 38, 38, 0.7)';
  if (label === 'OTHER' || label === 'Unspecified') return 'rgba(107, 114, 128, 0.7)';
  if (namedColorCache.has(label)) return namedColorCache.get(label);
  const palette = getColorPalette();
  const idx = (namedColorCache.size % palette.length);
  const color = palette[idx] + 'b3'; // add ~70% opacity if hex; fallback if not hex handled by css
  namedColorCache.set(label, color);
  return color;
}

export function buildDatasets(filtered, { xKey, yKey, sizeByHeight, colorBy }) {
  const groupKey = colorBy === 'name' ? 'name' : 'sex';
  const groups = new Map();

  let hMin = Infinity, hMax = -Infinity;
  if (sizeByHeight) {
    for (const r of filtered) {
      if (typeof r.height_in === 'number' && isFinite(r.height_in)) {
        hMin = Math.min(hMin, r.height_in);
        hMax = Math.max(hMax, r.height_in);
      }
    }
    if (!isFinite(hMin)) { hMin = 0; hMax = 1; }
  }

  const scaleRadius = h => {
    if (!sizeByHeight || typeof h !== 'number' || !isFinite(h)) return 4;
    if (hMax === hMin) return 6;
    const t = (h - hMin) / (hMax - hMin);
    return 3 + t * 7;
  };

  filtered.forEach((r, idx) => {
    const sx = r[xKey];
    const sy = r[yKey];
    if (typeof sx !== 'number' || !isFinite(sx) || typeof sy !== 'number' || !isFinite(sy)) return;
    let key = (r[groupKey] ?? '').toString().trim();
    if (!key) key = groupKey === 'sex' ? 'OTHER' : 'Unspecified';
    if (groupKey === 'sex') {
      const s = key.toUpperCase();
      key = (s === 'F' || s === 'M') ? s : 'OTHER';
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ x: sx, y: sy, r: scaleRadius(r.height_in), idx, tooltip: r });
  });

  const datasets = [];
  for (const [label, points] of groups.entries()) {
    if (!points.length) continue;
    datasets.push({
      label,
      data: points,
      parsing: false,
      showLine: false,
      pointRadius: ctx => ctx.raw?.r ?? 4,
      pointHoverRadius: ctx => (ctx.raw?.r ?? 4) + 2,
      backgroundColor: colorForGroup(label)
    });
  }
  return datasets;
}

function computeDomain(rows, key) {
  let min = Infinity;
  let max = -Infinity;
  for (const r of rows) {
    const v = r?.[key];
    if (typeof v === 'number' && isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!isFinite(min) || !isFinite(max)) return [0, 1];
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.05);
    return [min - pad, max + pad];
  }
  return [min, max];
}

export function renderChart({ data, xKey, yKey, sizeByHeight, colorBy, chartRef, summaryEl }) {
  const filtered = data;
  if (summaryEl) summaryEl.textContent = filtered.length;
  const datasets = buildDatasets(filtered, { xKey, yKey, sizeByHeight, colorBy });

  const labelMap = {
    weight_lbs: 'Weight (lbs)',
    age_weeks: 'Age (weeks)',
    height_in: 'Height (in)'
  };

  const [minX, maxX] = computeDomain(filtered, xKey);
  const [minY, maxY] = computeDomain(filtered, yKey);

  const cfg = {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            title: ctx => ctx[0]?.raw?.tooltip?.name || 'Entry',
            label: ctx => {
              const r = ctx.raw.tooltip;
              return [
                `Weight: ${r.weight_lbs ?? '—'} lbs`,
                `Age: ${r.age_weeks ?? '—'} weeks`,
                `Height: ${r.height_in ?? '—'} in`,
                `Sex: ${r.sex ?? '—'}`
              ];
            }
          }
        }
      },
      scales: {
        x: { bounds: 'data', min: minX, max: maxX, title: { display: true, text: labelMap[xKey] } },
        y: { bounds: 'data', min: minY, max: maxY, title: { display: true, text: labelMap[yKey] } }
      }
    }
  };

  const ctx = document.getElementById('chart').getContext('2d');
  if (chartRef.current) chartRef.current.destroy();
  chartRef.current = new Chart(ctx, cfg);
}
