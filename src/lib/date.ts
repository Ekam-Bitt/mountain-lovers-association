export function formatDate(dateStr: string, locale: string = 'en'): string {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            // If parsing fails, return original string (legacy support)
            return dateStr;
        }
        return new Intl.DateTimeFormat(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    } catch {
        return dateStr;
    }
}
