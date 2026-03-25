function joinAgeParts(parts: string[]): string {
    if (parts.length === 0) {
        return 'Recién nacido';
    }

    if (parts.length === 1) {
        return parts[0];
    }

    if (parts.length === 2) {
        return parts.join(' y ');
    }

    return `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;
}

function buildAgeParts(years: number, months: number, days: number): string[] {
    const parts: string[] = [];

    if (years > 0) {
        parts.push(years === 1 ? '1 año' : `${years} años`);
    }

    if (months > 0) {
        parts.push(months === 1 ? '1 mes' : `${months} meses`);
    }

    if (days > 0) {
        parts.push(days === 1 ? '1 día' : `${days} días`);
    }

    return parts;
}

export function formatPetAgeLabel(ageText?: string | null, ageInYears?: number | string | null): string {
    if (typeof ageText === 'string' && ageText.trim() !== '') {
        return ageText.trim();
    }

    if (ageInYears === null || ageInYears === undefined || ageInYears === '') {
        return 'Edad no especificada';
    }

    const numericAge = typeof ageInYears === 'number' ? ageInYears : Number.parseFloat(String(ageInYears).replace(',', '.'));

    if (!Number.isFinite(numericAge) || numericAge < 0) {
        return 'Edad no especificada';
    }

    const totalDays = Math.max(0, Math.round(numericAge * 365));
    const years = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;

    return joinAgeParts(buildAgeParts(years, months, days));
}
