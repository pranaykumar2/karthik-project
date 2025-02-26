export function formatDateTime(date: Date): string {
    return date.toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '');
}