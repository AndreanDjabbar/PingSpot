import { format, Locale } from "date-fns";
import { id } from "date-fns/locale";

type FormatDateOptions = {
    formatStr?: string;
    locale?: Locale;
    withTime?: boolean;
};

export const formattedDate = (
    value: string | number,
    options: FormatDateOptions = {}
): string => {
    if (!value) return "";

    const {
        formatStr,
        locale = id,
        withTime = false,
    } = options;

    const defaultFormat = withTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd";
    const fmt = formatStr || defaultFormat;

    let date: Date;

    if (typeof value === "number") {
        date = value < 1e12 ? new Date(value * 1000) : new Date(value);
    } else {
        date = new Date(value);
    }

    if (isNaN(date.getTime())) return "";

    return format(date, fmt, { locale });
};
