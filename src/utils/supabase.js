import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czsbkfbtjlrbugmggzpn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c2JrZmJ0amxyYnVnbWdnenBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTY4MzEsImV4cCI6MjA4ODE5MjgzMX0.bAl9rSpvN2eAGSUhyBYg4aKvgnwPwrLP8fDiUkQ1grM';

export const db = createClient(SUPABASE_URL, SUPABASE_KEY);
