import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// These should be stored securely in your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a single supabase client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
