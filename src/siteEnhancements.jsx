import { useEffect } from 'react';

const MILANA_EMAIL = 'contacto.milanaaqui@gmail.com';
const HERO_PEXELS_ID = '7129713';
const HERO_WIDTHS = [480, 768, 1024, 1440, 1920, 2400];

function heroUrl(width) {
  return `https://images.pexels.com/photos/${HERO_PEXELS_ID}/pexels-photo-${HERO_PEXELS_ID}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

function actualizarHero() {
  const picture = document.querySelector('.hero-media picture');
  const img = picture?.querySelector('img');
  if (!picture || !img || img.dataset.heroMilana === HERO_PEXELS_ID) return;

  picture.querySelectorAll('source').forEach((source) => source.remove());
  img.src = heroUrl(1440);
  img.srcset = HERO_WIDTHS.map((width) => `${heroUrl(width)} ${width}w`).join(', ');
  img.sizes = '(max-width: 1023px) 100vw, (max-width: 1599px) 64vw, 980px';
  img.style.objectPosition = '68% 46%';
  img.dataset.heroMilana = HERO_PEXELS_ID;
}

function asegurarCorreo() {
  const bloque = document.querySelector('.site-footer .footer-inner > div');
  if (!bloque || bloque.querySelector('[data-milana-contacto]')) return;

  const p = document.createElement('p');
  p.dataset.milanaContacto = 'true';
  p.append('Contacto: ');
  const a = document.createElement('a');
  a.href = `mailto:${MILANA_EMAIL}`;
  a.textContent = MILANA_EMAIL;
  a.style.textDecoration = 'underline';
  p.append(a);
  bloque.append(p);
}

export default function SiteEnhancements() {
  useEffect(() => {
    const aplicar = () => {
      actualizarHero();
      asegurarCorreo();
    };
    aplicar();
    const root = document.getElementById('root');
    if (!root) return undefined;
    const observer = new MutationObserver(aplicar);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
