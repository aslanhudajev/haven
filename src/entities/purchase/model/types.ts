export type Purchase = {
  id: string;
  family_id: string;
  period_id: string;
  user_id: string;
  amount_cents: number;
  description: string | null;
  /** Storage object path in `receipts` bucket (`familyId/userId/file.ext`), or legacy full URL. */
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
  };
};
