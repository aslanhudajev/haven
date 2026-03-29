import { useEffect, useState } from 'react';
import { getReceiptSignedUrl } from './receiptStorage';

/** Resolves a private receipt path (or legacy URL) to a short-lived signed URL. Fails silently for non-owners (RLS). */
export function useReceiptSignedUrl(receiptUrlOrPath: string | null | undefined): string | null {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!receiptUrlOrPath) {
      setUri(null);
      return;
    }
    void getReceiptSignedUrl(receiptUrlOrPath).then((u) => {
      if (!cancelled) setUri(u);
    });
    return () => {
      cancelled = true;
    };
  }, [receiptUrlOrPath]);

  return uri;
}
