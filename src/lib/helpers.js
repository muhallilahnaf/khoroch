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
]