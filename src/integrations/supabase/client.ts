// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bkspdpyhjxdgfzvskgtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrc3BkcHloanhkZ2Z6dnNrZ3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTk1NzIsImV4cCI6MjA1ODQ3NTU3Mn0.4xzYjmstGW05ARI4Tu6NASSeu3p54WAs7NyYjvkoVWk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);