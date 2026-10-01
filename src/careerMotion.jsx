import { useEffect } from 'react';

const SELECTOR = [
  '.career-route',
  '.career-stat-grid article',
  '.career-rank-row',
  '.career-explain article',
  '.career-state-focus',
  '.career-state-table',
  '.career-source',
  '.career-next-grid a',
].join(',');

export default function CareerMotion() {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const nodos = [...document.querySelectorAll(SELECTOR)];

    nodos.forEach((nodo, index) => {
      nodo.style.setProperty('--career-delay', `${Math.min(index % 5, 4) * 45}ms`);
      nodo.classList.add('career-reveal');
    });

    if (reduce || !('IntersectionObserver' in window)) {
      nodos.forEach((nodo) => nodo.classList.add('career-in'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('career-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

    nodos.forEach((nodo) => observer.observe(nodo));
    return () => observer.disconnect();
  }, []);

  return null;
}
