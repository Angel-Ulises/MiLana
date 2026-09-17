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

const CALCULATOR_PHOTO_OVERRIDES = {
  finiquito: { pexelsId: '10376251', focal: '58% 50%' }
};

function pexelsUrl(id, width) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

function actualizarFotoCalculadora() {
  const slug = window.location.pathname.split('/').filter(Boolean).at(-1);
  const config = CALCULATOR_PHOTO_OVERRIDES[slug];
  if (!config) return;
  const picture = document.querySelector('.calculator-hero-media picture');
  const img = picture?.querySelector('img');
  if (!picture || !img || img.dataset.heroPexels === config.pexelsId) return;
  picture.querySelectorAll('source').forEach((source) => source.remove());
  img.src = pexelsUrl(config.pexelsId, 1440);
  img.srcset = HERO_WIDTHS.map((width) => `${pexelsUrl(config.pexelsId, width)} ${width}w`).join(', ');
  img.sizes = '(max-width: 1023px) 100vw, min(48vw, 760px)';
  img.style.objectPosition = config.focal;
  img.dataset.heroPexels = config.pexelsId;
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

const REVEAL_SELECTOR = [
  '.section-head',
  '.situation-card',
  '.calculator-card',
  '.path-step',
  '.learn-copy',
  '.article-row',
  '.trust-grid > div',
  '.calculator-hero-copy',
  '.calculator-main > *'
].join(',');

function prepararMovimiento(root = document) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const nodes = [...root.querySelectorAll(REVEAL_SELECTOR)].filter((node) => !node.dataset.mlMotion);
  nodes.forEach((node, index) => {
    node.dataset.mlMotion = 'true';
    node.style.setProperty('--ml-reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
    if (reduce) {
      node.classList.add('ml-premium-in');
      return;
    }
    node.classList.add('ml-premium-reveal');
  });
  return nodes;
}

export default function SiteEnhancements() {
  useEffect(() => {
    let revealObserver;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('ml-premium-in');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }

    const aplicar = () => {
      actualizarHero();
      actualizarFotoCalculadora();
      asegurarCorreo();
      prepararMovimiento().forEach((node) => revealObserver?.observe(node));
    };
    aplicar();
    document.documentElement.classList.add('ml-premium-motion-ready');

    const root = document.getElementById('root');
    if (!root) return () => revealObserver?.disconnect();
    const observer = new MutationObserver(aplicar);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      revealObserver?.disconnect();
    };
  }, []);

  return null;
}
