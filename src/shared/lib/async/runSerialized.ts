/**
 * Run async work for `key` strictly one at a time (FIFO). Overlapping callers
 * wait for the previous task to finish — avoids duplicate side effects (e.g.
 * period rotation) under React Strict Mode double-mount or parallel effects.
 */
import { periodLog } from '@shared/lib/debug';

const tails = new Map<string, Promise<unknown>>();

let serialCounter = 0;

export function runSerialized<T>(key: string, task: () => Promise<T>): Promise<T> {
  const prev = tails.get(key) ?? Promise.resolve();
  const job = ++serialCounter;
  const out = prev.then(async () => {
    periodLog('serialized.start', { key, job });
    try {
      return await task();
    } finally {
      periodLog('serialized.end', { key, job });
    }
  });
  tails.set(
    key,
    out.then(
      () => undefined,
      () => undefined,
    ),
  );
  return out;
}
