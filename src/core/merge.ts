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

/** Patch qui annule `patch` sur `prev` : pour chaque champ touché, la valeur d'avant (undefined si le champ n'existait pas).
    Sert au retour arrière d'une écriture optimiste refusée. */
export function inverse(prev: object | undefined, patch: Obj): Obj {
  const p = (prev ?? {}) as Obj;
  const out: Obj = {};
  for (const k of Object.keys(patch)) {
    const pv = patch[k];
    out[k] = isObj(pv) ? inverse(isObj(p[k]) ? (p[k] as Obj) : undefined, pv) : p[k];
  }
  return out;
}
