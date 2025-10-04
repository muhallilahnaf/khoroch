import { createClient } from '@supabase/supabase-js';
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY
} from '$env/static/public';
import { getSumForMonth } from './aggregations';


export const supabase = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export const fetchSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const getUserId = async () => {
  const { data: user } = await supabase.auth.getUser();
  return user?.user?.id;
};

// load categories
export const loadCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  if (!error && data) return data
  if (error) console.log(error);
};

// load transactions by date
export const loadTransactionsByDate = async (date) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: true });
  if (!error && data) return data;
  if (error) console.log(error);
};

// load transactions by month
export const loadTransactionsByMonth = async (monthNumber, year) => {
  const data = await getSumForMonth(monthNumber, year);
  return data;
};

// load descriptions and categories
export async function getDescriptions() {
  const { data, error } = await supabase.rpc('get_unique_descriptions');
  // cols: descript, cat_id
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};