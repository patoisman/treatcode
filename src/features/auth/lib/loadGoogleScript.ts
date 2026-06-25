const GSI_SRC = "https://accounts.google.com/gsi/client";

let loaderPromise: Promise<void> | null = null;

/**
 * Loads the Google Identity Services client script exactly once and resolves
 * when `window.google.accounts.id` is available. Rejects if the script fails
 * to load (blocked by an extension, offline, etc.) so callers can fall back to
 * the OAuth redirect flow.
 */
export function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");

    const onLoad = () => {
      if (window.google?.accounts?.id) resolve();
      else reject(new Error("Google Identity Services failed to initialise"));
    };
    const onError = () => {
      loaderPromise = null;
      reject(new Error("Failed to load Google Identity Services"));
    };

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });

    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return loaderPromise;
}
