
CREATE POLICY "Media: authenticated read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media');

CREATE POLICY "Media: authenticated upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Media: admins update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')))
  WITH CHECK (bucket_id = 'media' AND (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "Media: admins delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin')));
