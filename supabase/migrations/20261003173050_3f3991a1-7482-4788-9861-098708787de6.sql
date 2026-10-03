ALTER TABLE public.dogs DROP COLUMN owner_phone;
ALTER TABLE public.dogs ADD COLUMN region text NOT NULL DEFAULT 'ATTICA',
  ADD COLUMN purebred boolean NOT NULL DEFAULT true,
  ADD COLUMN status text NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL','REPORTED_LOST'));
ALTER TABLE public.dogs ADD CONSTRAINT dogs_region_chk CHECK (region IN ('ATTICA','THESSALONIKI','HERAKLION','ACHAEA','LARISSA','CHANIA','RHODES','OTHER_GREECE'));
ALTER TABLE public.dogs ADD CONSTRAINT dogs_owner_name_len CHECK (char_length(owner_name) <= 50);

DROP FUNCTION IF EXISTS public.scan_match();

CREATE TABLE public.finder_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  finder_email text NOT NULL CHECK (char_length(finder_email) <= 254),
  location_mode text NOT NULL CHECK (location_mode IN ('text','link','pin')),
  location text NOT NULL CHECK (char_length(location) <= 500),
  message text CHECK (char_length(message) <= 1000),
  second_photo text,
  shelter_name text CHECK (char_length(shelter_name) <= 200),
  match_score numeric NOT NULL,
  stars int NOT NULL CHECK (stars BETWEEN 0 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days'
);
GRANT SELECT, DELETE ON public.finder_reports TO authenticated;
GRANT ALL ON public.finder_reports TO service_role;
ALTER TABLE public.finder_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read reports on their dogs" ON public.finder_reports FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid()));
CREATE POLICY "Owners delete reports on their dogs" ON public.finder_reports FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid()));

CREATE FUNCTION public.scan_match(_region text)
RETURNS TABLE(dog_id uuid, name text, breed text, avatar text, photo_url text, medical_alerts text, fingerprint_id text, purebred boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.id, d.name, d.breed, d.avatar, d.photo_url, d.medical_alerts, d.fingerprint_id, d.purebred
  FROM public.dogs d WHERE d.scannable AND d.region = _region ORDER BY random() LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.scan_match(text) TO anon, authenticated;

CREATE FUNCTION public.submit_finder_report(_dog_id uuid, _email text, _mode text, _location text, _message text, _second_photo text, _shelter text, _score numeric)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _pure boolean; _stars int := 0;
BEGIN
  SELECT purebred INTO _pure FROM public.dogs WHERE id = _dog_id AND scannable;
  IF NOT FOUND THEN RAISE EXCEPTION 'dog not found'; END IF;
  IF _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'invalid email'; END IF;
  IF coalesce(trim(_location),'') = '' THEN RAISE EXCEPTION 'location required'; END IF;
  IF _second_photo IS NOT NULL AND length(_second_photo) > 400000 THEN RAISE EXCEPTION 'photo too large'; END IF;
  IF coalesce(trim(_shelter),'') <> '' THEN _stars := 5;
  ELSE
    _stars := 1;
    IF _second_photo IS NOT NULL THEN _stars := _stars + 2; END IF;
    IF (_pure AND _score >= 90) OR (NOT _pure AND _score >= 80) THEN _stars := _stars + 2; END IF;
  END IF;
  INSERT INTO public.finder_reports(dog_id, finder_email, location_mode, location, message, second_photo, shelter_name, match_score, stars)
  VALUES (_dog_id, _email, _mode, _location, nullif(trim(_message),''), _second_photo, nullif(trim(_shelter),''), _score, least(_stars,5));
  RETURN least(_stars,5);
END $$;
GRANT EXECUTE ON FUNCTION public.submit_finder_report(uuid,text,text,text,text,text,text,numeric) TO anon, authenticated;

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('purge-finder-reports', '0 * * * *', $$DELETE FROM public.finder_reports WHERE expires_at <= now()$$);