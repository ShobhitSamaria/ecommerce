// Currency utility - change CURRENCY_SYMBOL to change currency across the app
export const CURRENCY_SYMBOL = "£";
export const CURRENCY_LOCALE = "en-GB";

export const formatPrice = (amount) => {
    if (amount == null || isNaN(amount)) return `${CURRENCY_SYMBOL}0.00`;
    return `${CURRENCY_SYMBOL}${amount.toLocaleString(CURRENCY_LOCALE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const formatPriceSimple = (amount) => {
    if (amount == null || isNaN(amount)) return `${CURRENCY_SYMBOL}0`;
    return `${CURRENCY_SYMBOL}${amount.toLocaleString(CURRENCY_LOCALE)}`;
};
