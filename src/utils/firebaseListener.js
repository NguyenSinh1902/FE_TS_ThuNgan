/**
 * Firebase Realtime Database Listener — MatchTeaCashier
 * Polling REST API 3s (SSE không hoạt động trên React Native Android New Architecture)
 * Firebase URL: https://matchatea01-7cf29-default-rtdb.asia-southeast1.firebasedatabase.app/
 */

const FIREBASE_DB_URL = 'https://matchatea01-7cf29-default-rtdb.asia-southeast1.firebasedatabase.app';
const POLL_INTERVAL_MS = 3000;

/**
 * Lắng nghe thay đổi trên một node Firebase bằng polling.
 * @param {string} path   - 'tables' hoặc 'orders'
 * @param {function} onData - callback(parsedData) mỗi khi dữ liệu thay đổi
 * @returns {{ stop: function }}
 */
export function listenToFirebase(path, onData) {
  let stopped = false;
  let lastDataStr = null;
  let timeoutId = null;

  const poll = async () => {
    if (stopped) return;
    try {
      const url = `${FIREBASE_DB_URL}/${path}.json`;
      const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
      if (response.ok) {
        const text = await response.text();
        if (text !== lastDataStr) {
          lastDataStr = text;
          try {
            const data = JSON.parse(text);
            if (data !== null && data !== undefined) onData(data);
          } catch (e) {
            console.log(`[Firebase] JSON parse error on ${path}:`, e?.message);
          }
        }
      }
    } catch (err) {
      if (!stopped) console.log(`[Firebase] Fetch error on ${path}:`, err?.message);
    }
    if (!stopped) timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
  };

  poll();
  return { stop: () => { stopped = true; if (timeoutId) clearTimeout(timeoutId); } };
}
