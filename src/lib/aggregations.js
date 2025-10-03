import { supabase } from "./supabaseClient"

export async function getSumForMonth(monthNumber, year) {
  const { data, error } = await supabase.rpc(
    'get_sum_by_day_type_for_month_year', 
    { target_month: monthNumber, target_year: year }
  );
  // cols: date, type, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};


export async function getSumForYear(year) {
  const { data, error } = await supabase.rpc(
    'get_sum_by_month_type_for_year', 
    { target_year: year }
  );
  // cols: month, type, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};


export async function getSumCategoryForYear(year) {
  const { data, error } = await supabase.rpc(
    'get_sum_by_categories_for_year', 
    { target_year: year }
  );
  // cols: category, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};


export async function getSumCategoryMonthlyForYear(year) {
  const { data, error } = await supabase.rpc(
    'get_sum_by_category_month_for_year', 
    { target_year: year }
  );
  // cols: category, month, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};


export async function getSumCategoryForMonth(monthNumber, year) {
  const { data, error } = await supabase.rpc(
    'get_sum_by_category_for_month_year', 
    { target_month: monthNumber, target_year: year }
  );
  // cols: category, total
  if (error) {
    console.log(error)
    return [];
  }
  return data;
};
