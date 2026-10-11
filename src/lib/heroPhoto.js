// Foto del hero de Inicio (Pexels 7129713, ver assets-master/FUENTES.json). Una sola fuente para React,
// el prerender y la precarga: antes se pintaba una foto local y luego un script la cambiaba por esta.
export const HERO_PEXELS_ID = '7129713';
export const HERO_WIDTHS = [480, 768, 1024, 1440, 1920, 2400];
export const HERO_SIZES = '(max-width: 1023px) 100vw, (max-width: 1599px) 64vw, 980px';
export const HERO_FOCAL = '68% 46%';
export const heroUrl = (width) => `https://images.pexels.com/photos/${HERO_PEXELS_ID}/pexels-photo-${HERO_PEXELS_ID}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
export const heroSrcSet = () => HERO_WIDTHS.map((width) => `${heroUrl(width)} ${width}w`).join(', ');
