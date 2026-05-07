export const formatDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) formatted = digits.substring(0, 2) + '/' + digits.substring(2);
    if (digits.length > 4) formatted = formatted.substring(0, 5) + '/' + digits.substring(4, 8);
    return formatted.substring(0, 10);
};

export const calculateAge = (birthDate: string | undefined): string => {
    if (!birthDate) return '---';
    const parts = birthDate.split('/');
    if (parts.length !== 3) return '---';
    const [d, m, y] = parts;
    const birth = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (isNaN(birth.getTime())) return '---';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age.toString() + ' AÑOS';
};
