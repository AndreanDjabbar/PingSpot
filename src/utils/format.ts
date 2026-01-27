import { format, Locale } from "date-fns";
import { id } from "date-fns/locale";

type FormatDateOptions = {
    formatStr?: string;
    locale?: Locale;
    withTime?: boolean;
};

export const getFormattedDate = (
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

export const getRelativeTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Baru saja';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} menit yang lalu`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} jam yang lalu`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} hari yang lalu`;
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `${diffInWeeks} minggu yang lalu`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} bulan yang lalu`;
    } catch {
        return 'Tidak diketahui';
    }
};
