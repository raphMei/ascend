/** Fusion profonde (objets simples uniquement, les tableaux sont remplacés). Équivalent de `setDoc(..., { merge: true })`.
    Ne modifie jamais ses arguments. */
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

export function merge<T extends object>(a: T | undefined, b: Obj): T {
  const out: Obj = Object.assign({}, a as Obj | undefined);
  for (const k of Object.keys(b)) {
    const bv = b[k];
    out[k] = isObj(bv) ? merge(isObj(out[k]) ? (out[k] as Obj) : {}, bv) : bv;
  }
  return out as T;
}
