export const range = (start, stop, step) =>
    Array.from(
        { length: Math.ceil((stop - start) / step) },
        (_, i) => start + i * step,
);

export const months = [
    'Jan', 
    'Feb', 
    'Mar', 
    'Apr', 
    'May',
    'Jun', 
    'Jul', 
    'Aug', 
    'Sep', 
    'Oct', 
    'Nov', 
    'Dec'
];

export const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

export const getDayName = (dateStr) => {
    if (dateStr) return days[new Date(dateStr).getDay()];
    return days[new Date().getDay()];
}

export const getMonthName = (dateObj) => {
    if (dateObj) return months[dateObj.getMonth()];
    return months[new Date().getMonth()];
}

export const getDateString = (dateObj) => {
    if (dateObj) return dateObj.toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
}