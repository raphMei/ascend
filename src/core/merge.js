/** Fusion profonde (objets simples uniquement, les tableaux sont remplacés). Identique à `setDoc(..., {merge:true})`. */
export function merge(a, b) {
  const out = Object.assign({}, a);
  Object.keys(b).forEach((k) => {
    out[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? merge(a && a[k] && typeof a[k] === 'object' ? a[k] : {}, b[k]) : b[k];
  });
  return out;
}
