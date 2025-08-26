import { Player } from "@/data/players";

/**
 * Gets the image source for a player, with fallback to generated avatar
 */
export function getPlayerImageSrc(player: Player): string {
  // If player has imageUrl from CSV, use it
  if (player.imageUrl && player.imageUrl.trim()) {
    return player.imageUrl;
  }
  
  // Fallback to ui-avatars.com for consistent generated avatars
  const initials = player.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=128&background=0ea5e9&color=white&bold=true`;
}

/**
 * Creates an error handler for image loading failures
 */
export function createImageErrorHandler(player: Player) {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    const fallbackSrc = getPlayerImageSrc({ ...player, imageUrl: undefined });
    
    // Only update if not already the fallback
    if (target.src !== fallbackSrc) {
      target.src = fallbackSrc;
    }
  };
}