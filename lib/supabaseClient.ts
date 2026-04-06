import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://srjhrhiesienkofisvnv.supabase.co';
const supabaseKey = 'sb_publishable_0xRvUYAVKWEficLT5kHhxg_DQE3ZkhK';

export const supabase = createClient(supabaseUrl, supabaseKey);
