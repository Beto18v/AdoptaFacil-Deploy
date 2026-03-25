import { backendJson } from '@/lib/http';
import { showToast, useToastMessage } from '@/lib/toast';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

export interface ImportedDonationDraft {
    donor_name: string;
    donor_email?: string;
    amount: number;
    created_at: string;
    description?: string;
}

interface RawRowData {
    [key: string]: unknown;
}

interface ColumnMapping {
    donor_name: string | null;
    donor_email: string | null;
    amount: string | null;
    created_at: string | null;
    description: string | null;
}

interface ExcelImportComponentProps {
    onImportSuccess: (importedDonations: ImportedDonationDraft[]) => void;
}

const ALIASES = {
    donor_name: ['donor_name', 'nombre_donante', 'donante', 'nombre', 'full_name'],
    donor_email: ['donor_email', 'correo_donante', 'email_donante', 'correo', 'email'],
    amount: ['amount', 'monto', 'valor', 'importe', 'total'],
    created_at: ['created_at', 'fecha', 'date', 'fecha_donacion'],
    description: ['description', 'descripcion', 'detalle', 'concepto', 'observacion'],
} as const;

const normalizeColumn = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_');

const findColumn = (headers: string[], aliases: readonly string[]) =>
    headers.find((header) => aliases.includes(normalizeColumn(header))) ?? null;

const formatDate = (year: number, month: number, day: number) =>
    `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

const normalizeDonation = (item: ImportedDonationDraft): ImportedDonationDraft => ({
    donor_name: item.donor_name.trim() || 'Donante importado',
    donor_email: item.donor_email?.trim() || undefined,
    amount: Number(item.amount),
    created_at: item.created_at,
    description: item.description?.trim() || undefined,
});

const parseAmount = (value: unknown, rowNumber: number): number => {
    if (typeof value === 'number') {
        if (Number.isFinite(value) && value > 0) {
            return Number(value.toFixed(2));
        }

        throw new Error(`Monto invalido en la fila ${rowNumber}.`);
    }

    const raw = String(value ?? '').trim();
    const cleaned = raw.replace(/[^\d,.-]/g, '');
    let normalized = cleaned;

    if (cleaned.includes(',') && cleaned.includes('.')) {
        normalized = cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned.replace(/,/g, '');
    } else if (cleaned.includes(',')) {
        normalized = cleaned.replace(/\./g, '').replace(',', '.');
    }

    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`Monto invalido en la fila ${rowNumber}: ${raw}`);
    }

    return Number(amount.toFixed(2));
};

const parseDate = (value: unknown, rowNumber: number): string => {
    if (typeof value === 'number') {
        const parsed = XLSX.SSF.parse_date_code(value);

        if (!parsed) {
            throw new Error(`Fecha invalida en la fila ${rowNumber}.`);
        }

        return formatDate(parsed.y, parsed.m, parsed.d);
    }

    const raw = String(value ?? '').trim();

    if (!raw) {
        throw new Error(`Fecha vacia en la fila ${rowNumber}.`);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    const latinDate = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (latinDate) {
        return formatDate(Number(latinDate[3]), Number(latinDate[2]), Number(latinDate[1]));
    }

    const parsed = new Date(raw);

    if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Fecha invalida en la fila ${rowNumber}: ${raw}`);
    }

    return formatDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate());
};

export function ExcelImportComponent({ onImportSuccess }: ExcelImportComponentProps) {
    const [showImport, setShowImport] = useState(false);
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
    const [columns, setColumns] = useState<string[]>([]);
    const [rawData, setRawData] = useState<RawRowData[]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({
        donor_name: null,
        donor_email: null,
        amount: null,
        created_at: null,
        description: null,
    });
    const [previewData, setPreviewData] = useState<ImportedDonationDraft[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useToastMessage(error, 'error');

    const resetImport = () => {
        setShowImport(false);
        setStep('upload');
        setColumns([]);
        setRawData([]);
        setMapping({
            donor_name: null,
            donor_email: null,
            amount: null,
            created_at: null,
            description: null,
        });
        setPreviewData([]);
        setError(null);
        setIsLoading(false);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target?.result, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];

                if (rows.length < 2) {
                    setError('El archivo debe incluir encabezados y al menos una fila con datos.');
                    return;
                }

                const headers = (rows[0] as string[]).map((header) => String(header || '').trim()).filter(Boolean);

                if (headers.length === 0) {
                    setError('No se encontraron encabezados validos en la primera fila.');
                    return;
                }

                const parsedRows = rows.slice(1).map((row) => {
                    const currentRow: RawRowData = {};

                    headers.forEach((header, index) => {
                        currentRow[header] = row[index];
                    });

                    return currentRow;
                });

                setColumns(headers);
                setRawData(parsedRows);
                setMapping({
                    donor_name: findColumn(headers, ALIASES.donor_name),
                    donor_email: findColumn(headers, ALIASES.donor_email),
                    amount: findColumn(headers, ALIASES.amount),
                    created_at: findColumn(headers, ALIASES.created_at),
                    description: findColumn(headers, ALIASES.description),
                });
                setStep('mapping');
                setError(null);
            } catch {
                setError('No fue posible leer el archivo. Verifica que sea un Excel o CSV valido.');
            }
        };

        reader.readAsBinaryString(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
    });

    const handleMappingComplete = () => {
        if (!mapping.amount || !mapping.created_at) {
            setError('Debes seleccionar monto y fecha para continuar.');
            return;
        }

        try {
            const amountColumn = mapping.amount;
            const dateColumn = mapping.created_at;

            if (!amountColumn || !dateColumn) {
                setError('Debes seleccionar monto y fecha para continuar.');
                return;
            }

            const mappedRows = rawData
                .map((row, index) =>
                    normalizeDonation({
                        donor_name: String(mapping.donor_name ? row[mapping.donor_name] || '' : '').trim() || 'Donante importado',
                        donor_email: String(mapping.donor_email ? row[mapping.donor_email] || '' : '').trim() || undefined,
                        amount: parseAmount(row[amountColumn], index + 2),
                        created_at: parseDate(row[dateColumn], index + 2),
                        description: String(mapping.description ? row[mapping.description] || '' : '').trim() || undefined,
                    }),
                )
                .filter((item) => item.amount > 0);

            if (mappedRows.length === 0) {
                setError('No se encontraron filas validas para importar.');
                return;
            }

            setPreviewData(mappedRows);
            setStep('preview');
            setError(null);
        } catch (currentError) {
            setError(currentError instanceof Error ? currentError.message : 'No fue posible procesar el archivo.');
        }
    };

    const handleEdit = (index: number, field: keyof ImportedDonationDraft, value: string | number) => {
        setPreviewData((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, [field]: value } : item)));
    };

    const handleImport = async () => {
        if (previewData.length === 0) {
            setError('No hay datos para importar.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const payload = previewData.map(normalizeDonation);

        try {
            const { response, data } = await backendJson<{ error?: string; message?: string }>(route('donaciones.import'), {
                method: 'POST',
                json: { donations: payload },
            });

            if (!response.ok) {
                throw new Error(data?.error || 'No fue posible importar las donaciones.');
            }

            onImportSuccess(payload);
            showToast(data?.message || `Se importaron ${payload.length} donaciones.`, 'success');
            resetImport();
        } catch (currentError) {
            setError(currentError instanceof Error ? currentError.message : 'No fue posible importar las donaciones.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!showImport) {
        return (
            <button
                type="button"
                onClick={() => setShowImport(true)}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:from-blue-600 hover:to-blue-800"
            >
                Importar donaciones
            </button>
        );
    }

    const modalContent = (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center">
                <div className="my-4 w-full max-w-4xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl dark:bg-gray-800/95">
                    <div className="max-h-[calc(100vh-5rem)] overflow-y-auto p-6 sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                            Importar donaciones
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Sube el archivo, revisa el mapeo y agrega las donaciones sin recargar la vista.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={resetImport}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20"
                        aria-label="Cerrar"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {step === 'upload' && (
                    <div className="space-y-6">
                        <div
                            {...getRootProps()}
                            className={`rounded-3xl border-2 border-dashed px-6 py-8 text-center transition md:px-8 md:py-10 ${
                                isDragActive
                                    ? 'border-blue-500 bg-blue-50 shadow-lg dark:bg-blue-900/20'
                                    : 'border-gray-300 bg-white/70 hover:border-blue-400 hover:bg-blue-50/40 dark:border-gray-600 dark:bg-gray-900/20 dark:hover:bg-blue-900/10'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-green-600 text-white shadow-lg">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 11v7m0 0l-3-3m3 3l3-3"
                                    />
                                </svg>
                            </div>
                            <p className="text-xl font-semibold text-gray-800 dark:text-white">
                                {isDragActive ? 'Suelta el archivo aqui' : 'Selecciona o arrastra un archivo Excel o CSV'}
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Formatos admitidos: .xlsx, .xls, .csv</p>
                            <p className="mt-4 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                                Un archivo por importacion
                            </p>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 p-5 text-sm text-gray-700 shadow-sm dark:border-blue-900/40 dark:from-blue-900/20 dark:to-indigo-900/10 dark:text-gray-300">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-300">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 8h10M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                        </svg>
                                    </div>
                                    <p className="font-semibold text-blue-700 dark:text-blue-300">Campos recomendados</p>
                                </div>
                                <div className="mt-4 space-y-2 leading-relaxed">
                                    <p>Requeridos: monto y fecha.</p>
                                    <p>Opcionales: nombre del donante y descripcion.</p>
                                    <p>Si falta el nombre, el sistema usara "Donante importado".</p>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50/90 to-emerald-50/70 p-5 text-sm text-gray-700 shadow-sm dark:border-green-900/40 dark:from-green-900/20 dark:to-emerald-900/10 dark:text-gray-300">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/15 text-green-600 dark:text-green-300">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="font-semibold text-green-700 dark:text-green-300">Antes de subir</p>
                                </div>
                                <div className="mt-4 space-y-2 leading-relaxed">
                                    <p>Usa la primera fila como encabezado.</p>
                                    <p>La fecha debe venir como fecha Excel, YYYY-MM-DD o DD/MM/YYYY.</p>
                                    <p>El monto puede venir con formato de moneda.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'mapping' && (
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-gray-200/70 bg-gray-50/80 p-4 text-sm text-gray-700 dark:border-gray-700/60 dark:bg-gray-900/20 dark:text-gray-300">
                            Revisa las columnas sugeridas. Monto y fecha son obligatorias; las demas pueden quedar sin mapear.
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                            {[
                                { key: 'donor_name', label: 'Nombre donante', required: false },
                                { key: 'donor_email', label: 'Correo donante', required: false },
                                { key: 'amount', label: 'Monto', required: true },
                                { key: 'created_at', label: 'Fecha', required: true },
                                { key: 'description', label: 'Descripcion', required: false },
                            ].map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {field.label}
                                        {field.required && <span className="ml-1 text-red-500">*</span>}
                                    </label>
                                    <select
                                        value={mapping[field.key as keyof ColumnMapping] || ''}
                                        onChange={(event) =>
                                            setMapping((current) => ({
                                                ...current,
                                                [field.key]: event.target.value || null,
                                            }))
                                        }
                                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">{field.required ? 'Seleccionar columna' : 'Sin mapear'}</option>
                                        {columns.map((column) => (
                                            <option key={column} value={column}>
                                                {column}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-gray-200/60 shadow-lg dark:border-gray-700/60">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/90 dark:bg-gray-800/60">
                                        <tr>
                                            {columns.map((column) => (
                                                <th key={column} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                                                    {column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rawData.slice(0, 3).map((row, index) => (
                                            <tr key={index} className="border-t border-gray-200/60 dark:border-gray-700/60">
                                                {columns.map((column) => (
                                                    <td key={column} className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                        {String(row[column] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setStep('upload')} className="rounded-2xl bg-gray-200 px-6 py-3 font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                Volver
                            </button>
                            <button
                                type="button"
                                onClick={handleMappingComplete}
                                className="rounded-2xl bg-gradient-to-r from-blue-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {step === 'preview' && (
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-green-100 bg-green-50/70 p-4 text-sm text-gray-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-gray-300">
                            Edita las filas si hace falta. Al importar se agregan a la tabla y quedan en estado completada.
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-gray-200/60 shadow-xl dark:border-gray-700/60">
                            <div className="max-h-[420px] overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-white/95 dark:bg-gray-800/95">
                                        <tr>
                                            <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-200">Nombre</th>
                                            <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-200">Correo</th>
                                            <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-200">Monto</th>
                                            <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-200">Fecha</th>
                                            <th className="px-4 py-4 text-left font-semibold text-gray-700 dark:text-gray-200">Descripcion</th>
                                            <th className="px-4 py-4 text-center font-semibold text-gray-700 dark:text-gray-200">Accion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((item, index) => (
                                            <tr key={`${item.created_at}-${index}`} className="border-t border-gray-200/60 dark:border-gray-700/60">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={item.donor_name}
                                                        onChange={(event) => handleEdit(index, 'donor_name', event.target.value)}
                                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="email"
                                                        value={item.donor_email || ''}
                                                        onChange={(event) => handleEdit(index, 'donor_email', event.target.value)}
                                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder="Opcional"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={item.amount}
                                                        onChange={(event) => handleEdit(index, 'amount', Number(event.target.value) || 0)}
                                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="date"
                                                        value={item.created_at}
                                                        onChange={(event) => handleEdit(index, 'created_at', event.target.value)}
                                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <textarea
                                                        value={item.description || ''}
                                                        onChange={(event) => handleEdit(index, 'description', event.target.value)}
                                                        className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        rows={2}
                                                        placeholder="Opcional"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewData((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                                                        className="rounded-full p-2 text-red-500 transition hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                                                        aria-label="Eliminar fila"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setStep('mapping')} className="rounded-2xl bg-gray-200 px-6 py-3 font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                Volver
                            </button>
                            <button
                                type="button"
                                onClick={handleImport}
                                disabled={isLoading || previewData.length === 0}
                                className="rounded-2xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading ? 'Importando...' : `Importar ${previewData.length} donaciones`}
                            </button>
                        </div>
                    </div>
                )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(modalContent, document.body);
}
