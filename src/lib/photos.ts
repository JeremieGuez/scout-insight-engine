// src/lib/photos.ts
export function buildPhotoUrl(playerName: string, ext: string = "jpg") {
  const normalized = playerName
    .normalize("NFD").replace(/\p{Diacritic}/gu, "") // enlève accents
    .replace(/[’'`]/g, "")                          // enlève apostrophes
    .replace(/\./g, "")                             // enlève points
    .replace(/\s+/g, "_")                           // espaces → underscore
    .replace(/_-_|__+/g, "_")                       // nettoie doubles
    .trim();

  return `/players/${normalized}.${ext}`;
}
