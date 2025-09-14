import { createClient } from '@supabase/supabase-js';
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY
} from '$env/static/public';
import { months } from './helpers';
import { getTransactionsByMonth } from './aggregations';


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
export const loadTransactionsByMonth = async (month) => {
  const monthNumber = months.indexOf(month) + 1;
  const data = await getTransactionsByMonth(monthNumber);
  return data;
};

// load descriptions and categories
export const loadDescriptions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('category_id, description');
  if (!error && data) {
    let descriptions = [];
    let finalData = [];
    data.forEach(row => {
      if (!descriptions.includes(row.description)) {
        descriptions.push(row.description);
        finalData.push({
          category_id: row.category_id,
          description: row.description,
        });
      }
    });
    return finalData;
  }
  if (error) console.log(error);
};