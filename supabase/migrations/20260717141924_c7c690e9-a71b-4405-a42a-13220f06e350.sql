CREATE POLICY "payment_proofs_insert_anyone" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "payment_proofs_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.is_admin_or_manager(auth.uid()));

CREATE POLICY "payment_proofs_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.is_admin_or_manager(auth.uid()));

CREATE POLICY "payment_proofs_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.is_admin_or_manager(auth.uid()));