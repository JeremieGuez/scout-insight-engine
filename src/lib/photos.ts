// Photo helper: retourne le chemin /players/Prénom_Nom.jpg, sinon fallback.
export function photoFor(fullName: string): string {
  if (!fullName) return "/players/default.jpg";
  const parts = fullName
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p.normalize("NFD").replace(/[\u0300-\u036f]/g, "")); // retire accents
  if (parts.length === 1) return `/players/${parts[0]}.jpg`;
  const first = parts[0];
  const last = parts.slice(1).join("_");
  return `/players/${first}_${last}.jpg`;
}
export { photoFor as buildPhotoUrl };