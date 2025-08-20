// Chart rendering
export function buildDatasets(filtered, { xKey, yKey, sizeByHeight }) {
  const groups = {
    F: { label: 'Female (F)', points: [] },
    M: { label: 'Male (M)', points: [] },
    OTHER: { label: 'Other/Unspecified', points: [] }
  };

  let hMin = Infinity,
    hMax = -Infinity;
  if (sizeByHeight) {
    filtered.forEach(r => {
      if (typeof r.height_in === 'number' && !isNaN(r.height_in)) {
        hMin = Math.min(hMin, r.height_in);
        hMax = Math.max(hMax, r.height_in);
      }
    });
    if (!isFinite(hMin)) {
      hMin = 0;
      hMax = 1;
    }
  }

  const scaleRadius = h => {
    if (!sizeByHeight || typeof h !== 'number' || isNaN(h)) return 4;
    if (hMax === hMin) return 6;
    const t = (h - hMin) / (hMax - hMin);
    return 3 + t * 7;
  };

  filtered.forEach((r, idx) => {
    const sx = r[xKey];
    const sy = r[yKey];
    if (typeof sx !== 'number' || isNaN(sx) || typeof sy !== 'number' || isNaN(sy)) return;
    const sex = (r.sex || 'OTHER').toUpperCase();
    const key = sex === 'F' || sex === 'M' ? sex : 'OTHER';
    groups[key].points.push({ x: sx, y: sy, r: scaleRadius(r.height_in), idx, tooltip: r });
  });

  const ds = [];
  const colorMap = {
    F: 'rgba(79, 70, 229, 0.7)',
    M: 'rgba(220, 38, 38, 0.7)',
    OTHER: 'rgba(107, 114, 128, 0.7)'
  };
  for (const key of ['F', 'M', 'OTHER']) {
    const g = groups[key];
    if (g.points.length === 0) continue;
    ds.push({
      label: g.label,
      data: g.points,
      parsing: false,
      showLine: false,
      pointRadius: ctx => ctx.raw?.r ?? 4,
      pointHoverRadius: ctx => (ctx.raw?.r ?? 4) + 2,
      backgroundColor: colorMap[key]
    });
  }
  return ds;
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

export function renderChart({ data, xKey, yKey, sizeByHeight, chartRef, summaryEl }) {
  const filtered = data;
  if (summaryEl) summaryEl.textContent = filtered.length;
  const datasets = buildDatasets(filtered, { xKey, yKey, sizeByHeight });

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
