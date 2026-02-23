import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

interface DonationData {
    amount: number;
    created_at: string;
    description?: string;
}

interface RawRowData {
    [key: string]: unknown;
}

interface ColumnMapping {
    amount: string | null;
    created_at: string | null;
    description: string | null;
}

interface ExcelImportComponentProps {
    onImportSuccess: () => void;
}

export function ExcelImportComponent({ onImportSuccess }: ExcelImportComponentProps) {
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
    const [rawData, setRawData] = useState<RawRowData[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
        amount: null,
        created_at: null,
        description: null,
    });
    const [previewData, setPreviewData] = useState<DonationData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showImport, setShowImport] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) {
                    setError('El archivo debe tener al menos una fila de datos además del encabezado');
                    return;
                }

                const headers = jsonData[0] as string[];
                const rows = (jsonData.slice(1) as unknown[][]).map((row) => {
                    const obj: RawRowData = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });

                setColumns(headers);
                setRawData(rows);
                setStep('mapping');
                setError(null);
            } catch {
                setError('Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.');
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
        if (!columnMapping.amount || !columnMapping.created_at) {
            setError('Debes mapear al menos las columnas de Monto y Fecha');
            return;
        }

        try {
            const mappedData: DonationData[] = rawData
                .map((row, index) => {
                    const amount = parseFloat(String(row[columnMapping.amount!] || '0'));
                    if (isNaN(amount) || amount <= 0) {
                        throw new Error(`Monto inválido en la fila ${index + 2}: ${row[columnMapping.amount!]}`);
                    }

                    const date = row[columnMapping.created_at!];
                    let dateString: string;

                    if (typeof date === 'number') {
                        // Fecha de Excel (número serial) - formatear directamente para evitar problemas de zona horaria
                        const excelDate = XLSX.SSF.parse_date_code(date);
                        dateString = `${excelDate.y.toString().padStart(4, '0')}-${excelDate.m.toString().padStart(2, '0')}-${excelDate.d.toString().padStart(2, '0')}`;
                    } else if (typeof date === 'string') {
                        // Para fechas string, intentar parsear y formatear como YYYY-MM-DD
                        const parsed = new Date(date);
                        if (isNaN(parsed.getTime())) {
                            throw new Error(`Fecha inválida en la fila ${index + 2}: ${date}`);
                        }
                        // Usar UTC para evitar cambios de día por zona horaria
                        const year = parsed.getUTCFullYear();
                        const month = (parsed.getUTCMonth() + 1).toString().padStart(2, '0');
                        const day = parsed.getUTCDate().toString().padStart(2, '0');
                        dateString = `${year}-${month}-${day}`;
                    } else {
                        throw new Error(`Fecha inválida en la fila ${index + 2}: ${date}`);
                    }

                    return {
                        amount,
                        created_at: dateString,
                        description: columnMapping.description ? String(row[columnMapping.description] || '').trim() : undefined,
                    };
                })
                .filter((item) => item.amount > 0);

            setPreviewData(mappedData);
            setStep('preview');
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar los datos');
        }
    };

    const handleEditPreviewData = (index: number, field: keyof DonationData, value: string | number) => {
        setPreviewData((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    const handleRemoveRow = (index: number) => {
        setPreviewData((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImport = async () => {
        if (previewData.length === 0) {
            setError('No hay datos para importar');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/donaciones/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
                body: JSON.stringify({ donations: previewData }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al importar donaciones');
            }

            onImportSuccess();
            resetImport();
            setShowImport(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al importar donaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const resetImport = () => {
        setStep('upload');
        setRawData([]);
        setColumns([]);
        setColumnMapping({ amount: null, created_at: null, description: null });
        setPreviewData([]);
        setError(null);
        setIsLoading(false);
    };

    if (!showImport) {
        return (
            <button
                onClick={() => setShowImport(true)}
                className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-blue-800"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <span className="relative flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                    </svg>
                    Importar desde Excel
                </span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative mx-4 my-8 max-h-[calc(100vh-4rem)] w-full max-w-4xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                {/* Elementos decorativos */}
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-green-500/15 to-transparent blur-lg"></div>

                <div className="relative max-h-[calc(100vh-4rem)] overflow-y-auto p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                                Importar Donaciones desde Excel
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Carga masivamente tus registros de donaciones</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowImport(false);
                                resetImport();
                            }}
                            className="group rounded-full p-2 text-gray-500 transition-all duration-200 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                            <svg className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-lg dark:border-red-800/50 dark:from-red-900/20 dark:to-red-800/20">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-500 dark:text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                                <div>
                                    <h4 className="font-bold text-red-700 dark:text-red-300">Error en la importación</h4>
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div
                                {...getRootProps()}
                                className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                                    isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <div className="mb-4 text-6xl">📄</div>
                                {isDragActive ? (
                                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400">Suelta el archivo aquí...</p>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Selecciona o arrastra un archivo Excel</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Formatos soportados: .xlsx, .xls, .csv</p>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-green-50/30 p-6 dark:from-blue-900/20 dark:to-green-900/20">
                                <p className="mb-3 font-bold text-gray-700 dark:text-gray-300">📋 Formato esperado:</p>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span>
                                            <strong>Monto:</strong> Valor numérico (requerido)
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">•</span>
                                        <span>
                                            <strong>Fecha:</strong> Fecha de la donación (requerido)
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-500">•</span>
                                        <span>
                                            <strong>Descripción:</strong> Descripción de la donación (opcional)
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 'mapping' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                                    Mapear Columnas
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    Relaciona las columnas de tu archivo con los campos requeridos
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="relative space-y-3">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        💰 Monto <span className="text-red-500">*</span>
                                    </label>
                                    <div className="group relative">
                                        <select
                                            value={columnMapping.amount || ''}
                                            onChange={(e) => setColumnMapping((prev) => ({ ...prev, amount: e.target.value || null }))}
                                            className="w-full appearance-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-3 pr-12 text-gray-800 shadow-lg transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:hover:border-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                                            style={{ backgroundImage: 'none' }}
                                        >
                                            <option value="" className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                -- Seleccionar columna --
                                            </option>
                                            {columns.map((col) => (
                                                <option
                                                    key={col}
                                                    value={col}
                                                    className="bg-white py-2 text-gray-800 dark:bg-gray-700 dark:text-white"
                                                >
                                                    {col}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 p-1 shadow-lg">
                                                <svg
                                                    className="h-4 w-4 text-white transition-transform duration-200 group-focus-within:rotate-180"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative space-y-3">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        📅 Fecha <span className="text-red-500">*</span>
                                    </label>
                                    <div className="group relative">
                                        <select
                                            value={columnMapping.created_at || ''}
                                            onChange={(e) => setColumnMapping((prev) => ({ ...prev, created_at: e.target.value || null }))}
                                            className="w-full appearance-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-3 pr-12 text-gray-800 shadow-lg transition-all duration-200 hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:hover:border-green-500 dark:focus:border-green-400 dark:focus:ring-green-800/30"
                                            style={{ backgroundImage: 'none' }}
                                        >
                                            <option value="" className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                -- Seleccionar columna --
                                            </option>
                                            {columns.map((col) => (
                                                <option
                                                    key={col}
                                                    value={col}
                                                    className="bg-white py-2 text-gray-800 dark:bg-gray-700 dark:text-white"
                                                >
                                                    {col}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-700 p-1 shadow-lg">
                                                <svg
                                                    className="h-4 w-4 text-white transition-transform duration-200 group-focus-within:rotate-180"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative space-y-3">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">📝 Descripción (opcional)</label>
                                    <div className="group relative">
                                        <select
                                            value={columnMapping.description || ''}
                                            onChange={(e) => setColumnMapping((prev) => ({ ...prev, description: e.target.value || null }))}
                                            className="w-full appearance-none rounded-xl border-2 border-gray-300 bg-gradient-to-r from-white to-gray-50 p-3 pr-12 text-gray-800 shadow-lg transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-white dark:hover:border-purple-500 dark:focus:border-purple-400 dark:focus:ring-purple-800/30"
                                            style={{ backgroundImage: 'none' }}
                                        >
                                            <option value="" className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                -- Sin mapear --
                                            </option>
                                            {columns.map((col) => (
                                                <option
                                                    key={col}
                                                    value={col}
                                                    className="bg-white py-2 text-gray-800 dark:bg-gray-700 dark:text-white"
                                                >
                                                    {col}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 p-1 shadow-lg">
                                                <svg
                                                    className="h-4 w-4 text-white transition-transform duration-200 group-focus-within:rotate-180"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="mb-4 text-lg font-bold text-gray-700 dark:text-gray-300">👀 Vista previa (primeras 3 filas):</h4>
                                <div className="overflow-hidden rounded-2xl border-2 border-gray-200/50 shadow-lg dark:border-gray-700/50">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-600/80">
                                                <tr>
                                                    {columns.map((col) => (
                                                        <th key={col} className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-200">
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rawData.slice(0, 3).map((row, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-t border-gray-200/30 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-green-50/30 dark:border-gray-700/30 dark:hover:from-blue-900/20 dark:hover:to-green-900/20"
                                                    >
                                                        {columns.map((col) => (
                                                            <td key={col} className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                                {String(row[col] || '')}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:justify-end">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-400 to-gray-600 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 dark:from-gray-600 dark:to-gray-800"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative">← Volver</span>
                                </button>
                                <button
                                    onClick={handleMappingComplete}
                                    className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-green-600 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative">Continuar →</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent dark:from-green-400 dark:to-blue-400">
                                    Vista Previa y Edición
                                </h3>
                                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 text-sm font-bold text-gray-700 dark:from-green-900/50 dark:to-blue-900/50 dark:text-gray-300">
                                    📊 {previewData.length} donaciones para importar
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-3xl border-2 border-gray-200/50 shadow-2xl dark:border-gray-700/50">
                                <div className="max-h-[400px] overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gradient-to-r from-gray-50/95 to-gray-100/95 backdrop-blur-sm dark:from-gray-700/95 dark:to-gray-600/95">
                                            <tr>
                                                <th className="px-4 py-4 text-left font-bold text-gray-700 dark:text-gray-200">💰 Monto</th>
                                                <th className="px-4 py-4 text-left font-bold text-gray-700 dark:text-gray-200">📅 Fecha</th>
                                                <th className="px-4 py-4 text-left font-bold text-gray-700 dark:text-gray-200">📝 Descripción</th>
                                                <th className="px-4 py-4 text-center font-bold text-gray-700 dark:text-gray-200">🗑️</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-t border-gray-200/30 transition-all hover:bg-gradient-to-r hover:from-green-50/30 hover:to-blue-50/30 dark:border-gray-700/30 dark:hover:from-green-900/20 dark:hover:to-blue-900/20"
                                                >
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={item.amount}
                                                            onChange={(e) => handleEditPreviewData(index, 'amount', parseFloat(e.target.value) || 0)}
                                                            className="w-full rounded-xl border-2 border-gray-300 p-2 text-sm transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="date"
                                                            value={item.created_at}
                                                            onChange={(e) => handleEditPreviewData(index, 'created_at', e.target.value)}
                                                            className="w-full rounded-xl border-2 border-gray-300 p-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                                        />
                                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(item.created_at + 'T12:00:00').toLocaleDateString('es-CO', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <textarea
                                                            value={item.description || ''}
                                                            onChange={(e) => handleEditPreviewData(index, 'description', e.target.value)}
                                                            className="w-full resize-none rounded-xl border-2 border-gray-300 p-2 text-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-purple-400"
                                                            rows={2}
                                                            placeholder="Descripción opcional..."
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleRemoveRow(index)}
                                                            className="group rounded-full p-2 text-red-500 transition-all hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                                                        >
                                                            <svg
                                                                className="h-5 w-5 transition-transform group-hover:scale-110"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
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

                            <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:justify-end">
                                <button
                                    onClick={() => setStep('mapping')}
                                    className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-400 to-gray-600 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 dark:from-gray-600 dark:to-gray-800"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative">← Volver</span>
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={isLoading || previewData.length === 0}
                                    className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-green-700 px-8 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <span className="relative flex items-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        className="opacity-25"
                                                    ></circle>
                                                    <path
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        className="opacity-75"
                                                    ></path>
                                                </svg>
                                                Importando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Importar {previewData.length} donaciones
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
