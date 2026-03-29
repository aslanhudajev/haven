-- Private receipts bucket: only the uploader (path segment 2 = auth.uid()) can CRUD their objects.
-- purchases.receipt_url stores the storage object path: family_id/user_id/filename (not a public URL).

UPDATE public.purchases
SET receipt_url = regexp_replace(
  receipt_url,
  '^https?://[^/]+(?:/storage/v1)?/storage/v1/object/(?:public|sign)/receipts/([^?]+).*',
  '\1'
)
WHERE receipt_url IS NOT NULL
  AND receipt_url ~ '^https?://';

UPDATE storage.buckets
SET public = false
WHERE id = 'receipts';

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS receipts_member_upload ON storage.objects;
DROP POLICY IF EXISTS receipts_member_read ON storage.objects;

-- Path within bucket: {family_id}/{user_id}/{filename}; foldername = [family_id, user_id] (excludes file name).
CREATE POLICY receipts_own_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND array_length(storage.foldername(name), 1) >= 2
    AND public.is_family_member((storage.foldername(name))[1]::uuid)
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY receipts_own_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND array_length(storage.foldername(name), 1) >= 2
    AND public.is_family_member((storage.foldername(name))[1]::uuid)
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY receipts_own_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND array_length(storage.foldername(name), 1) >= 2
    AND public.is_family_member((storage.foldername(name))[1]::uuid)
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'receipts'
    AND array_length(storage.foldername(name), 1) >= 2
    AND public.is_family_member((storage.foldername(name))[1]::uuid)
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY receipts_own_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND array_length(storage.foldername(name), 1) >= 2
    AND public.is_family_member((storage.foldername(name))[1]::uuid)
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
