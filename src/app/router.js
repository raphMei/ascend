/* Routage par hash : #/home, #/today/AAAA-MM-JJ, #/domains, #/dom/<domaine>/<sous-page>, #/settings. */
export const route = () => {
  const h = (location.hash || '#/home').slice(2).split('/');
  return { tab: h[0] || 'home', a: h[1] ? decodeURIComponent(h[1]) : null, b: h[2] ? decodeURIComponent(h[2]) : null };
};
export const go = (path) => { location.hash = '#/' + path; };
