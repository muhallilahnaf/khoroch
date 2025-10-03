import { supabase } from "./supabaseClient"

export async function getTransactionsByMonth(monthNumber) {
  const { data, error } = await supabase.rpc('get_transactions_by_month', { target_month: monthNumber });
  // cols: date, type, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};

export async function getTransactionsByCategories() {
  const { data, error } = await supabase.rpc('get_transactions_by_categories');
  // cols: category_name, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};

export async function getTransactionsByYear(year) {
  const { data, error } = await supabase.rpc('get_transactions_by_year', { target_year: year });
  // cols: month, type, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};

export async function getTransactionsByCategoryByMonth() {
  const { data, error } = await supabase.rpc('get_transactions_by_category_by_month', { target_year: year });
  // cols: category_name, month, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};
