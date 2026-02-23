import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Trash2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

interface DonationData {
    donor_name: string;
    amount: number;
    created_at: string;
    description?: string;
}

interface RawRowData {
    [key: string]: unknown;
}

interface ColumnMapping {
    donor_name: string | null;
    amount: string | null;
    created_at: string | null;
    description: string | null;
}

interface DonationImportModalProps {
    onImportSuccess: () => void;
}

export function DonationImportModal({ onImportSuccess }: DonationImportModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
    const [rawData, setRawData] = useState<RawRowData[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
        donor_name: null,
        amount: null,
        created_at: null,
        description: null,
    });
    const [previewData, setPreviewData] = useState<DonationData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        if (!columnMapping.donor_name || !columnMapping.amount || !columnMapping.created_at) {
            setError('Debes mapear al menos las columnas de Donante, Monto y Fecha');
            return;
        }

        try {
            const mappedData: DonationData[] = rawData
                .map((row, index) => {
                    const donorName = String(row[columnMapping.donor_name!] || '').trim();
                    if (!donorName) {
                        throw new Error(`Nombre del donante vacío en la fila ${index + 2}`);
                    }

                    const amount = parseFloat(String(row[columnMapping.amount!] || '0'));
                    if (isNaN(amount) || amount <= 0) {
                        throw new Error(`Monto inválido en la fila ${index + 2}: ${row[columnMapping.amount!]}`);
                    }

                    const date = row[columnMapping.created_at!];
                    let dateString: string;

                    if (typeof date === 'number') {
                        // Fecha de Excel (número serial)
                        const excelDate = XLSX.SSF.parse_date_code(date);
                        dateString = new Date(excelDate.y, excelDate.m - 1, excelDate.d).toISOString().split('T')[0];
                    } else if (typeof date === 'string') {
                        // Intentar parsear la fecha string
                        const parsed = new Date(date);
                        if (isNaN(parsed.getTime())) {
                            throw new Error(`Fecha inválida en la fila ${index + 2}: ${date}`);
                        }
                        dateString = parsed.toISOString().split('T')[0];
                    } else {
                        throw new Error(`Fecha inválida en la fila ${index + 2}: ${date}`);
                    }

                    return {
                        donor_name: donorName,
                        amount,
                        created_at: dateString,
                        description: columnMapping.description ? String(row[columnMapping.description] || '').trim() : undefined,
                    };
                })
                .filter((item) => item.amount > 0); // Filtrar filas con montos inválidos

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

            // Éxito
            onImportSuccess();
            setIsOpen(false);
            resetModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al importar donaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const resetModal = () => {
        setStep('upload');
        setRawData([]);
        setColumns([]);
        setColumnMapping({ donor_name: null, amount: null, created_at: null, description: null });
        setPreviewData([]);
        setError(null);
        setIsLoading(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetModal();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Importar Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100vh-4rem)] max-w-4xl overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            Importar Donaciones desde Excel
                        </DialogTitle>
                        <DialogDescription>Sube un archivo Excel con las donaciones para importarlas masivamente</DialogDescription>
                    </DialogHeader>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {step === 'upload' && (
                        <div className="space-y-4">
                            <div
                                {...getRootProps()}
                                className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                {isDragActive ? (
                                    <p>Suelta el archivo aquí...</p>
                                ) : (
                                    <div>
                                        <p className="text-lg font-medium">Selecciona o arrastra un archivo Excel</p>
                                        <p className="mt-2 text-sm text-gray-500">Formatos soportados: .xlsx, .xls, .csv</p>
                                    </div>
                                )}
                            </div>

                            <div className="text-sm text-gray-600">
                                <p className="font-medium">Formato esperado:</p>
                                <ul className="mt-2 list-inside list-disc space-y-1">
                                    <li>
                                        <strong>Donante:</strong> Nombre del donante (requerido)
                                    </li>
                                    <li>
                                        <strong>Monto:</strong> Valor numérico (requerido)
                                    </li>
                                    <li>
                                        <strong>Fecha:</strong> Fecha de la donación (requerido)
                                    </li>
                                    <li>
                                        <strong>Descripción:</strong> Descripción de la donación (opcional)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 'mapping' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-3 text-lg font-medium">Mapear Columnas</h3>
                                <p className="mb-4 text-sm text-gray-600">Relaciona las columnas de tu archivo con los campos requeridos</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="donor-mapping" className="text-sm font-medium">
                                        Donante <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={columnMapping.donor_name || ''}
                                        onValueChange={(value) => setColumnMapping((prev) => ({ ...prev, donor_name: value || null }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar columna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount-mapping" className="text-sm font-medium">
                                        Monto <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={columnMapping.amount || ''}
                                        onValueChange={(value) => setColumnMapping((prev) => ({ ...prev, amount: value || null }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar columna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date-mapping" className="text-sm font-medium">
                                        Fecha <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={columnMapping.created_at || ''}
                                        onValueChange={(value) => setColumnMapping((prev) => ({ ...prev, created_at: value || null }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar columna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description-mapping" className="text-sm font-medium">
                                        Descripción (opcional)
                                    </Label>
                                    <Select
                                        value={columnMapping.description || ''}
                                        onValueChange={(value) => setColumnMapping((prev) => ({ ...prev, description: value || null }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar columna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Sin mapear</SelectItem>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="mb-2 text-sm font-medium">Vista previa de datos (primeras 3 filas):</h4>
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {columns.map((col) => (
                                                    <th key={col} className="px-3 py-2 text-left font-medium">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rawData.slice(0, 3).map((row, index) => (
                                                <tr key={index} className="border-t">
                                                    {columns.map((col) => (
                                                        <td key={col} className="px-3 py-2">
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
                    )}

                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Vista Previa y Edición</h3>
                                <div className="text-sm text-gray-600">{previewData.length} donaciones para importar</div>
                            </div>

                            <div className="overflow-hidden rounded-lg border">
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium">Donante</th>
                                                <th className="px-3 py-2 text-left font-medium">Monto</th>
                                                <th className="px-3 py-2 text-left font-medium">Fecha</th>
                                                <th className="px-3 py-2 text-left font-medium">Descripción</th>
                                                <th className="px-3 py-2 text-center font-medium">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((item, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="text"
                                                            value={item.donor_name}
                                                            onChange={(e) => handleEditPreviewData(index, 'donor_name', e.target.value)}
                                                            className="w-full"
                                                            placeholder="Nombre del donante"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            value={item.amount}
                                                            onChange={(e) => handleEditPreviewData(index, 'amount', parseFloat(e.target.value) || 0)}
                                                            className="w-full"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="date"
                                                            value={item.created_at}
                                                            onChange={(e) => handleEditPreviewData(index, 'created_at', e.target.value)}
                                                            className="w-full"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Textarea
                                                            value={item.description || ''}
                                                            onChange={(e) => handleEditPreviewData(index, 'description', e.target.value)}
                                                            className="min-h-[60px] w-full"
                                                            placeholder="Descripción opcional..."
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveRow(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {step === 'upload' && (
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancelar
                            </Button>
                        )}

                        {step === 'mapping' && (
                            <>
                                <Button variant="outline" onClick={() => setStep('upload')}>
                                    Volver
                                </Button>
                                <Button onClick={handleMappingComplete}>Continuar</Button>
                            </>
                        )}

                        {step === 'preview' && (
                            <>
                                <Button variant="outline" onClick={() => setStep('mapping')}>
                                    Volver
                                </Button>
                                <Button onClick={handleImport} disabled={isLoading || previewData.length === 0} className="gap-2">
                                    {isLoading ? (
                                        <>Importando...</>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Importar {previewData.length} donaciones
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
