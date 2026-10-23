import { LOCALITIES } from './master.mjs';
const ARCH = {
  dense_apartment: { hh: 4600, petBase: 0.058 },
  mid_apartment:   { hh: 3300, petBase: 0.050 },
  mixed_res:       { hh: 2250, petBase: 0.042 },
  township:        { hh: 1450, petBase: 0.034 },
  industrial:      { hh: 700,  petBase: 0.020 },
  commercial:      { hh: 1100, petBase: 0.030 }
};
const byArch = {};
for (const L of LOCALITIES) {
  const A = ARCH[L.arch];
  const hh = Math.round(L.area * A.hh);
  const rate = Math.min(0.115, Math.max(0.018, A.petBase + 0.0045 * (L.rsqft - 6000)));
  byArch[L.arch] = byArch[L.arch] || { hh: 0, pet: 0, n: 0 };
  byArch[L.arch].hh += hh; byArch[L.arch].pet += Math.round(hh * rate); byArch[L.arch].n++;
}
let TH = 0, TP = 0;
for (const [k, v] of Object.entries(byArch)) { console.log(k, v.n, 'hh=' + v.hh, 'pet=' + v.pet, 'rate=' + (v.pet / v.hh * 100).toFixed(1) + '%'); TH += v.hh; TP += v.pet; }
console.log('TOTAL hh', TH, 'pet', TP, 'rate', (TP / TH * 100).toFixed(2) + '%');
console.log('area', LOCALITIES.reduce((s, L) => s + L.area, 0).toFixed(2));
for (const L of LOCALITIES.slice(0, 6).concat(LOCALITIES.slice(28, 34))) {
  const A = ARCH[L.arch];
  const hh = Math.round(L.area * A.hh);
  const rate = Math.min(0.115, Math.max(0.018, A.petBase + 0.0045 * (L.rsqft - 6000)));
  console.log(L.id, L.arch, 'rsqft=' + L.rsqft, 'area=' + L.area, 'hh=' + hh, 'rate=' + rate, 'pet=' + Math.round(hh * rate));
}
