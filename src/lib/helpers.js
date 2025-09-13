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

export const getDayName = (dateStr) => days[new Date(dateStr).getDay()];

export const getDateString = (dateObj) => dateObj.toISOString().split('T')[0];