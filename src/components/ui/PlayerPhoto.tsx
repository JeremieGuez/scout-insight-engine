import { useState } from "react";
import { buildPhotoUrl } from "@/lib/photos";

/**
 * Affiche la photo d'un joueur si elle existe dans /public/players/
 * → Exemple attendu : /public/players/Adrien_Rabiot.jpg
 * → Sinon, fallback vers /public/players/default.jpg
 */
export default function PlayerPhoto({ name, size = 32 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);

  // URL vers la photo (toujours en .jpg)
  const url = buildPhotoUrl(name, "jpg");

  // Si erreur, fallback vers l'image par défaut
  const finalUrl = err ? "/players/default.jpg" : url;

  return (
    <img
      src={finalUrl}
      alt={`${name} photo`}
      width={size}
      height={size}
      className="rounded object-cover"
      onError={() => setErr(true)} // si la photo est introuvable → passe sur default.jpg
      loading="lazy"
      style={{ width: size, height: size }}
    />
  );
}
