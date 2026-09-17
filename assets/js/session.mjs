export const TIMELINE_VERSION = 6;

export function playbackSession(page, scenarioVersion, storage, locale = 'ko') {
  const key = `root-kernel-monitor-v4:${locale}:${page}:${scenarioVersion}:${TIMELINE_VERSION}`;
  return {
    read() {
      try {
        const saved = JSON.parse(storage().getItem(key));
        if (saved?.scenarioVersion !== scenarioVersion || saved?.timelineVersion !== TIMELINE_VERSION) return null;
        if (!Number.isFinite(saved.position) || !Number.isFinite(saved.frontier) || typeof saved.mobile !== 'boolean') return null;
        if (saved.position < 0 || saved.frontier < saved.position) return null;
        return saved;
      } catch { return null; }
    },
    write(state) {
      try {
        storage().setItem(key, JSON.stringify({...state, scenarioVersion, timelineVersion: TIMELINE_VERSION}));
      } catch { /* Playback does not require browser storage. */ }
    },
    clear() {
      try { storage().removeItem(key); } catch { /* Language switching also works without storage. */ }
    },
  };
}
