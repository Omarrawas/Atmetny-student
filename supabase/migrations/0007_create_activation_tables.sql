
-- Create the activation_codes table
CREATE TABLE public.activation_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  encoded_value text NOT NULL,
  name text NOT NULL,
  type text NOT NULL, -- E.g., "general_monthly", "choose_single_subject_yearly", "trial_weekly"
  subject_id uuid NULL, -- For codes pre-linked to a specific subject (references subjects.id)
  subject_name text NULL, -- Denormalized name of the pre-linked subject
  is_active boolean NULL DEFAULT TRUE,
  is_used boolean NULL DEFAULT FALSE,
  used_by_user_id uuid NULL, -- References auth.users(id)
  used_for_subject_id text NULL, -- Stores the NAME of the subject if 'type' is 'choose_single_subject_*' (references subjects.name)
  valid_from timestamp with time zone NOT NULL,
  valid_until timestamp with time zone NOT NULL,
  used_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activation_codes_pkey PRIMARY KEY (id),
  CONSTRAINT activation_codes_encoded_value_key UNIQUE (encoded_value),
  CONSTRAINT activation_codes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id) ON DELETE SET NULL,
  CONSTRAINT activation_codes_used_by_user_id_fkey FOREIGN KEY (used_by_user_id) REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT activation_codes_used_for_subject_id_fkey FOREIGN KEY (used_for_subject_id) REFERENCES public.subjects (name) ON DELETE SET NULL -- Note: FK to subjects.name
);

-- Add comment for clarity on 'type' field
COMMENT ON COLUMN public.activation_codes.type IS 'Type of activation code, e.g., "general_monthly", "choose_single_subject_yearly", "trial_weekly", "specific_subject_chemistry_yearly"';
COMMENT ON COLUMN public.activation_codes.subject_id IS 'For codes pre-linked to a specific subject (references subjects.id)';
COMMENT ON COLUMN public.activation_codes.used_for_subject_id IS 'Stores the NAME of the subject if ''type'' is ''choose_single_subject_*'' (references subjects.name)';


-- Indexes for activation_codes
CREATE INDEX IF NOT EXISTS idx_activation_codes_encoded_value ON public.activation_codes USING btree (encoded_value);
CREATE INDEX IF NOT EXISTS idx_activation_codes_is_active_is_used ON public.activation_codes USING btree (is_active, is_used);
CREATE INDEX IF NOT EXISTS idx_activation_codes_subject_id ON public.activation_codes USING btree (subject_id);
CREATE INDEX IF NOT EXISTS idx_activation_codes_used_by_user_id ON public.activation_codes USING btree (used_by_user_id);


-- Trigger for activation_codes updated_at
CREATE TRIGGER set_activation_codes_updated_at
BEFORE UPDATE ON public.activation_codes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create the activation_logs table
CREATE TABLE public.activation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code_id uuid NOT NULL,
  subject_id uuid NULL, -- UUID of the subject this activation applies to (if any)
  email text NULL,
  code_type text NULL,
  plan_name text NULL,
  activated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activation_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activation_logs_code_id_fkey FOREIGN KEY (code_id) REFERENCES public.activation_codes (id) ON DELETE RESTRICT,
  CONSTRAINT activation_logs_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id) ON DELETE SET NULL,
  CONSTRAINT activation_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE RESTRICT
);

-- Indexes for activation_logs
CREATE INDEX IF NOT EXISTS idx_activation_logs_user_id ON public.activation_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_activation_logs_code_id ON public.activation_logs USING btree (code_id);
CREATE INDEX IF NOT EXISTS idx_activation_logs_subject_id ON public.activation_logs USING btree (subject_id);

-- Note: activation_logs typically don't have an updated_at trigger as they are append-only.
-- If updates are expected, a trigger similar to other tables can be added.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.activation_codes TO service_role;
GRANT SELECT, INSERT ON TABLE public.activation_logs TO service_role;

GRANT SELECT ON TABLE public.activation_codes TO authenticated; -- Be very careful with this. Prefer specific function access.
GRANT SELECT ON TABLE public.activation_logs TO authenticated; -- Students might see their own logs.

