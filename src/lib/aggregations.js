import { supabase } from "./supabaseClient"

export async function getTransactionsByMonth(monthNumber) {
  const { data, error } = await supabase.rpc('get_transaction_by_month', { target_month: monthNumber });
  if (error) {
    console.error(error)
    return [];
  }
  return data;
}
