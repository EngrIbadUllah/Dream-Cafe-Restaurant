ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'easypaisa';
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'jazzcash';
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_screenshot_url text,
  ADD COLUMN IF NOT EXISTS payment_transaction_id text;