import { useEffect } from 'react';

const SELECTOR = [
  '.finance-route-list > a',
  '.finance-form-card',
  '.finance-result-card',
  '.finance-next-box',
  '.finance-checklist',
  '.finance-source',
  '.finance-housing-steps > a',
  '.profession-metric',
  '.profession-source',
  '.profession-distribution > div',
  '.profession-money-inner',
  '.profession-related-grid > a',
  '.economy-card',
  '.economy-source-list article',
  '.economy-step',
  '.economy-source',
  '.economy-related-grid > a',
].join(',');

export default function RouteMotion() {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const nodos = [...document.querySelectorAll(SELECTOR)];
    nodos.forEach((nodo, index) => {
      nodo.style.setProperty('--route-delay', `${Math.min(index % 5, 4) * 45}ms`);
      nodo.classList.add('route-reveal');
    });
    if (reduce || !('IntersectionObserver' in window)) {
      nodos.forEach((nodo) => nodo.classList.add('route-in'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('route-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    nodos.forEach((nodo) => observer.observe(nodo));
    return () => observer.disconnect();
  }, []);
  return null;
}
