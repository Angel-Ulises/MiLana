// La portada generada sigue siendo una página real mientras se descarga App.
// No vaciar #root ni sustituirlo por una pantalla de espera.
export async function startHomeWhenReady({ root, load, mount, reload = () => location.reload() }) {
  const search = (event) => {
    if (event.target.closest?.('.orb-home-search')) {
      const opener = root.ownerDocument.querySelector('[data-orbita-search-open]');
      if (opener) { event.preventDefault(); opener.click(); }
    }
  };
  root.addEventListener('click', search);
  try {
    const page = await load();
    root.removeEventListener('click', search);
    const extraOpen = root.querySelector('.orb-home-extra')?.open;
    // La foto del hero ya está pintada: si la de React aún no carga, se reutiliza la existente
    // (antes el recuadro quedaba vacío unos cuadros al montar). React solo retira nodos raíz de
    // subárboles, nunca esta imagen interna, así que el intercambio es seguro.
    const heroPrevia = root.querySelector('.hero-media picture');
    const active = root.ownerDocument.activeElement;
    const focusSelector = active?.closest?.('.orb-home-extra') ? '.orb-home-extra summary'
      : active?.closest?.('.orb-home-search') ? '.orb-home-search' : null;
    mount(page.default, () => {
      const details = root.querySelector('.orb-home-extra');
      if (details && extraOpen !== undefined) details.open = extraOpen;
      if (focusSelector) root.querySelector(focusSelector)?.focus({ preventScroll: true });
      // Se mueve el <picture> completo: mover solo el <img> a otro <picture> obliga a recargarlo.
      const heroNueva = root.querySelector('.hero-media picture');
      const imgPrevia = heroPrevia?.querySelector('img');
      const imgNueva = heroNueva?.querySelector('img');
      if (heroNueva && imgPrevia && imgNueva && heroNueva !== heroPrevia && imgPrevia.complete && imgPrevia.naturalWidth > 0
        && !imgNueva.complete && imgPrevia.getAttribute('src') === imgNueva.getAttribute('src')) {
        heroNueva.replaceWith(heroPrevia);
      }
    });
    return true;
  } catch {
    // Fallos de red o un chunk antiguo tras un despliegue: no reintentar en
    // bucle ni borrar los enlaces. Recargar obtiene HTML y hashes vigentes.
    if (!root.querySelector('[data-startup-error]')) {
      const document = root.ownerDocument;
      const notice = document.createElement('section');
      notice.className = 'ml-startup-error';
      notice.dataset.startupError = '';
      notice.setAttribute('role', 'alert');
      const text = document.createElement('p');
      text.textContent = 'No pudimos activar todas las herramientas. Puedes seguir usando los enlaces o volver a intentarlo.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Reintentar';
      retry.addEventListener('click', reload);
      notice.append(text, retry);
      root.prepend(notice);
    }
    return false;
  }
}
