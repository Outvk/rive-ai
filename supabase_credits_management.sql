`-- Ensure the 'credits' column exists in the 'profiles' table.
-- Default value of 50 for new users.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits integer DEFAULT 50;

-- Ensure 'transactions' table exists for record keeping.
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL DEFAULT 0,
    label text NOT NULL DEFAULT 'Transaction',
    type text NOT NULL DEFAULT 'credit', -- 'credit' or 'debit'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- In case the table already existed and is missing columns
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount integer NOT NULL DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT 'Transaction';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'credit';

-- Drop any existing type checks to ensure 'credit' and 'debit' are allowed
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'transactions' AND policyname = 'Users can view own transactions'
    ) THEN
        CREATE POLICY "Users can view own transactions"
        ON public.transactions FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- RPC: add_credits_admin (Used by server tools like Webhooks)
-- Bypasses auth checks inside the function because it's meant for server-side trusted calls.
DROP FUNCTION IF EXISTS public.add_credits_admin(uuid, integer, text);
CREATE OR REPLACE FUNCTION public.add_credits_admin(
    target_user_id uuid,
    add_amount integer,
    reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the user's profile credits.
    UPDATE public.profiles
    SET credits = COALESCE(credits, 0) + add_amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_user_id;

    -- Log the transaction into the history table.
    INSERT INTO public.transactions (user_id, amount, label, type)
    VALUES (target_user_id, add_amount, reason, 'credit');
END;
$$;

-- RPC: add_credits (Used by server actions within a user session)
-- Can use auth.uid() if needed, but the admin version is more flexible for webhooks.
DROP FUNCTION IF EXISTS public.add_credits(integer, text);
CREATE OR REPLACE FUNCTION public.add_credits(
    add_amount integer,
    reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the authenticated user's profile credits.
    UPDATE public.profiles
    SET credits = COALESCE(credits, 0) + add_amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = auth.uid();

    -- Log the transaction.
    INSERT INTO public.transactions (user_id, amount, label, type)
    VALUES (auth.uid(), add_amount, reason, 'credit');
END;
$$;

-- RPC: deduct_credits
-- Safely checks if user has enough credits before deducting.
DROP FUNCTION IF EXISTS public.deduct_credits(integer, text);
CREATE OR REPLACE FUNCTION public.deduct_credits(
    charge_amount integer,
    tool_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits integer;
BEGIN
    -- Get current credits.
    SELECT credits INTO current_credits
    FROM public.profiles
    WHERE id = auth.uid();

    -- Check if enough credits.
    IF current_credits IS NULL OR current_credits < charge_amount THEN
        RETURN FALSE;
    END IF;

    -- Deduct credits.
    UPDATE public.profiles
    SET credits = credits - charge_amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = auth.uid();

    -- Log the debit transaction.
    INSERT INTO public.transactions (user_id, amount, label, type)
    VALUES (auth.uid(), -charge_amount, tool_name, 'debit');

    RETURN TRUE;
END;
$$;
`