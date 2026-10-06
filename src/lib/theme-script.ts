export const storageKey = 'finscribe-theme'
export const darkQuery = '(prefers-color-scheme: dark)'

/** Inline script for <head>; runs before paint so the first frame has the right theme. */
export const themeScript = `
  try {
    var p = localStorage.getItem('${storageKey}');
    var dark = p === 'dark' || ((!p || p === 'system') && matchMedia('${darkQuery}').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  } catch (e) {}
`
