-- Add session_id column to trading_history table
ALTER TABLE public.trading_history 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Also add it to trading_open_positions for consistency
ALTER TABLE public.trading_open_positions 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Enable RLS on both tables for multi-user support later
ALTER TABLE public.trading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_open_positions ENABLE ROW LEVEL SECURITY;

-- Create policy for trading_history (allow users to only see their own data)
CREATE POLICY "Users can only view their own trading history"
ON public.trading_history
FOR SELECT
USING (auth.uid()::text = session_id);

CREATE POLICY "Users can only insert their own trading history"
ON public.trading_history
FOR INSERT
WITH CHECK (auth.uid()::text = session_id);

CREATE POLICY "Users can only update their own trading history"
ON public.trading_history
FOR UPDATE
USING (auth.uid()::text = session_id);

-- Create policy for trading_open_positions
CREATE POLICY "Users can only view their own open positions"
ON public.trading_open_positions
FOR SELECT
USING (auth.uid()::text = session_id);

CREATE POLICY "Users can only insert their own open positions"
ON public.trading_open_positions
FOR INSERT
WITH CHECK (auth.uid()::text = session_id);

CREATE POLICY "Users can only update their own open positions"
ON public.trading_open_positions
FOR UPDATE
USING (auth.uid()::text = session_id);

-- For now, disable RLS to maintain compatibility with existing code
-- ALTER TABLE public.trading_history DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.trading_open_positions DISABLE ROW LEVEL SECURITY;