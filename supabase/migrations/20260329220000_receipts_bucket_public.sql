-- Align DB with app: purchases store getPublicUrl() strings; bucket must be public.
-- config.toml may have created `receipts` as private before an INSERT migration ran (ON CONFLICT DO NOTHING).

UPDATE storage.buckets
SET public = true
WHERE id = 'receipts';

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;
