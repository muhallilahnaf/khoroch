import { supabase } from "./supabaseClient"

export async function getTransactionsByMonth(monthNumber) {
  const { data, error } = await supabase.rpc('get_transactions_by_month', { target_month: monthNumber });
  // cols: date, type, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
}
