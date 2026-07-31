/*! coi-serviceworker v0.1.7 | MIT License | https://github.com/gzuidhof/coi-serviceworker */
if (typeof window === "undefined") {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
    self.addEventListener("fetch", event => {
        if (event.request.mode === "navigate") {
            event.respondWith(
                fetch(event.request).then(response => {
                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                    newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders
                    });
                })
            );
        }
    });
} else {
    (() => {
        if (window.crossOriginIsolated !== false) return;
        navigator.serviceWorker.register(window.document.currentScript.src).then(registration => {
            registration.addEventListener("updatefound", () => location.reload());
            if (registration.active) location.reload();
        });
    })();
}
