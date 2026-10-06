const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// La ventana de espera del runtime empieza después de la carga real, no al
// recibir Page.navigate (que puede responder antes de que llegue el HTML).
export async function navigateAndWait(send, sessionId, url, {
  waitMs, until, waitForLoad, now = Date.now, pause = sleep, loadTimeoutMs = 10000,
}) {
  await send('Page.enable', {}, sessionId);
  const loaded = waitForLoad();
  const navigation = await send('Page.navigate', { url }, sessionId);
  if (navigation.errorText) throw new Error(`Chrome navigation failed: ${navigation.errorText}`);
  let loadTimer;
  try {
    await Promise.race([
      loaded,
      new Promise((_, reject) => {
        loadTimer = setTimeout(() => reject(new Error(`Chrome page load timeout after ${loadTimeoutMs}ms: ${url}`)), loadTimeoutMs);
      }),
    ]);
  } finally { clearTimeout(loadTimer); }
  const deadline = now() + waitMs;
  do {
    if (until) {
      const probe = await send('Runtime.evaluate', { expression: until, returnByValue: true }, sessionId);
      if (probe.exceptionDetails) throw new Error(`Chrome condition failed: ${probe.exceptionDetails.text}`);
      if (probe.result.value) return;
    }
    const remaining = deadline - now();
    if (remaining <= 0) break;
    await pause(Math.min(50, remaining));
  } while (true);
  if (until) throw new Error(`Chrome condition not met within ${waitMs}ms after page load: ${until} (${url})`);
}
