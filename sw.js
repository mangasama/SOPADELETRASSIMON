// Service Worker - Sopa de Letras Electoral (IEE Sonora)
// Cachea el juego para que funcione sin conexión, pero usa "red primero"
// para el HTML/JS/manifest para que las actualizaciones se vean de inmediato
// (los assets pesados sí quedan en caché-primero para que carguen rápido offline).

const CACHE_NAME = "sopa-electoral-v2"; // <-- subir este número cada vez que se actualice el juego

const CORE_FILES = [
  "./",
  "./index.html",
  "./data.js",
  "./game.js",
  "./manifest.json"
];

const ASSETS_TO_CACHE = [
  "assets/acierto1.webm",
  "assets/acierto2.webm",
  "assets/acierto3.webm",
  "assets/acierto4.webm",
  "assets/acierto5.webm",
  "assets/acierto6.webm",
  "assets/acierto7.webm",
  "assets/bg1.jpg",
  "assets/bg2.jpg",
  "assets/bg3.jpg",
  "assets/bg4.jpg",
  "assets/bg5.jpg",
  "assets/bg6.jpg",
  "assets/bg7.jpg",
  "assets/bg8.jpg",
  "assets/bg9.jpg",
  "assets/bonus1.webm",
  "assets/bonus2.webm",
  "assets/bonus3.webm",
  "assets/bonus4.webm",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon_ayuntamiento.png",
  "assets/icon_boleta.png",
  "assets/icon_campaña.png",
  "assets/icon_ciudadania.png",
  "assets/icon_coalicion.png",
  "assets/icon_congreso.png",
  "assets/icon_constitucion.png",
  "assets/icon_credencial.png",
  "assets/icon_debate.png",
  "assets/icon_diputacion.png",
  "assets/icon_encuesta.png",
  "assets/icon_escrutinio.png",
  "assets/icon_general.png",
  "assets/icon_ieesonora.png",
  "assets/icon_independiente.png",
  "assets/icon_ine.png",
  "assets/icon_listanominal.png",
  "assets/icon_mayoria.png",
  "assets/icon_padron.png",
  "assets/icon_partido.png",
  "assets/icon_presidencia.png",
  "assets/icon_propaganda.png",
  "assets/icon_reeleccion.png",
  "assets/icon_repproporcional.png",
  "assets/icon_representacion.png",
  "assets/icon_senado.png",
  "assets/icon_sufragio.png",
  "assets/icon_tribunal.png",
  "assets/icon_urna.png",
  "assets/icon_voto.png",
  "assets/idle.webm",
  "assets/inicio.png",
  "assets/logo.png",
  "assets/music1.mp3",
  "assets/music2.mp3",
  "assets/music3.mp3",
  "assets/music4.mp3",
  "assets/story_final.webm",
  "assets/story_intro.webm",
  "assets/story_mid.webm"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll falla si UN solo archivo da error; los agregamos uno por uno
      // para que un fallo puntual no tumbe toda la instalación.
      const all = [...CORE_FILES, ...ASSETS_TO_CACHE];
      return Promise.all(
        all.map((url) =>
          cache.add(url).catch((err) => console.warn("No se pudo cachear:", url, err))
        )
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isCoreFile(url){
  return CORE_FILES.some((f) => url.endsWith(f.replace("./", "")) || url.endsWith("/"));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = event.request.url;

  // HTML/JS/manifest: red primero (así las actualizaciones se ven de inmediato).
  // Si no hay internet, cae al caché como respaldo.
  if (event.request.mode === "navigate" || isCoreFile(url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets pesados (fondos, videos, música, íconos): caché primero, para que
  // carguen rápido y funcionen offline sin tener que volver a descargarlos.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
