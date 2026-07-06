/**
 * Dynamically loads a script from a URL and returns a Promise.
 * Resolves immediately if the script is already loaded.
 */
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error(`Failed to load: ${src}`)));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Loads scripts sequentially — each waits for the previous to finish.
 */
export async function loadScriptsInOrder(sources) {
  for (const src of sources) {
    await loadScript(src);
  }
}