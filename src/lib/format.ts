export function formatBaht(satang: number) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
    }).format(satang / 100);
}