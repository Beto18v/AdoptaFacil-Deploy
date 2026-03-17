import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

export type BulkEmailRecipient = {
    email: string;
    id: number;
    name: string;
};

type BulkEmailErrors = {
    description?: string;
    subject?: string;
    user_ids?: string;
};

interface BulkEmailModalProps {
    errors?: BulkEmailErrors;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: { description: string; subject: string }) => void;
    open: boolean;
    processing?: boolean;
    recipients: BulkEmailRecipient[];
}

const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Esta vista previa solo vive en el cliente. El correo real se renderiza con resources/views/emails/bulk-email.blade.php.
const buildBulkEmailPreview = (subject: string, description: string) => {
    const appUrl = typeof window === 'undefined' ? 'https://adoptafacil.com' : window.location.origin;
    const safeSubject = escapeHtml(subject.trim() || 'Asunto del correo');
    const safeDescription = escapeHtml(description.trim() || 'Escribe aqui el mensaje que quieres enviar a los usuarios seleccionados.').replace(
        /\n/g,
        '<br>',
    );

    return `
        <!doctype html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${safeSubject}</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#111827;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:24px 12px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; padding:24px;">
                            <tr>
                                <td align="center" style="padding-bottom:16px;">
                                    <img src="${appUrl}/Logo/LogoGreen.png" alt="AdoptaFacil" style="max-width:180px; height:auto; border:0;" />
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:24px; font-weight:700; line-height:1.3; padding-bottom:16px;">
                                    Hola,
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:16px; line-height:1.6; padding-bottom:12px;">
                                    ${safeSubject}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:16px; line-height:1.6; padding-bottom:16px;">
                                    ${safeDescription}
                                </td>
                            </tr>
                            <tr>
                                <td style="background:#f3f4f6; border-radius:6px; padding:12px 16px; font-size:15px; line-height:1.5; color:#374151;">
                                    Gracias por seguir conectado con AdoptaFacil.
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; line-height:1.6; color:#6b7280; padding-top:12px;">
                                    Este envio se realizara en copia oculta (BCC) a los destinatarios seleccionados.
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-top:24px; padding-bottom:16px;">
                                    <a href="${appUrl}" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; padding:12px 20px; border-radius:6px;">
                                        Visitar AdoptaFacil
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; line-height:1.6; color:#6b7280;">
                                    Este mensaje fue enviado por el equipo de AdoptaFacil.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

export default function BulkEmailModal({ errors, onOpenChange, onSubmit, open, processing = false, recipients }: BulkEmailModalProps) {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [showAllRecipients, setShowAllRecipients] = useState(false);

    useEffect(() => {
        if (open) {
            return;
        }

        setSubject('');
        setDescription('');
        setShowAllRecipients(false);
    }, [open]);

    const displayedRecipients = showAllRecipients ? recipients : recipients.slice(0, 2);
    const totalRecipients = recipients.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed top-[50%] left-[50%] z-50 w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-white/95 p-0 shadow-2xl backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=open]:zoom-in-95 dark:bg-gray-800/95">
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/15 to-transparent"></div>
                <div className="pointer-events-none absolute top-1/3 -left-8 h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                <div className="pointer-events-none absolute right-1/4 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-tl from-purple-500/8 to-transparent"></div>

                <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-600 relative max-h-[calc(100vh-4rem)] overflow-y-auto p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:via-blue-400 dark:to-purple-400">
                            Enviar Correo Masivo
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                            Envia un correo electronico masivo en copia oculta para proteger los destinatarios seleccionados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                        <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50">
                            <Label className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Destinatarios ({totalRecipients})
                            </Label>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {displayedRecipients.map((recipient) => (
                                    <Badge
                                        key={recipient.id}
                                        variant="secondary"
                                        className="border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-blue-800 shadow-sm dark:border-blue-700/50 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-200"
                                    >
                                        {`${recipient.name} <${recipient.email}>`}
                                    </Badge>
                                ))}
                                {recipients.length > 2 && (
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAllRecipients((current) => !current)}
                                        className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-600/50 dark:bg-blue-900/30 dark:text-blue-400"
                                    >
                                        {showAllRecipients ? 'Ver menos' : `Ver todos (${recipients.length - 2})`}
                                    </Button>
                                )}
                            </div>
                            <InputError className="mt-3" message={errors?.user_ids} />
                        </div>

                        <div className="rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50">
                            <Label
                                htmlFor="bulk-email-subject"
                                className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200"
                            >
                                Asunto del Correo
                            </Label>
                            <Input
                                id="bulk-email-subject"
                                placeholder="Ej: Nuevas mascotas disponibles para adopcion"
                                value={subject}
                                onChange={(event) => setSubject(event.target.value)}
                                className="mt-3 border-2 border-green-200 bg-white shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-green-400"
                            />
                            <InputError className="mt-3" message={errors?.subject} />
                        </div>

                        <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50">
                            <Label
                                htmlFor="bulk-email-description"
                                className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200"
                            >
                                Mensaje del Correo
                            </Label>
                            <Textarea
                                id="bulk-email-description"
                                placeholder="Escribe aqui el mensaje que quieres enviar a los usuarios seleccionados...."
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={6}
                                className="mt-3 border-2 border-purple-200 bg-white shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-purple-400"
                            />
                            <InputError className="mt-3" message={errors?.description} />
                        </div>

                        <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50">
                            <Label className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Previsualizacion del Correo
                            </Label>
                            <div className="mt-4 overflow-hidden rounded-2xl border-2 border-yellow-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                                <iframe
                                    srcDoc={buildBulkEmailPreview(subject, description)}
                                    className="w-full rounded-2xl border-0"
                                    style={{ height: '450px' }}
                                    title="Bulk email preview"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-600">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {totalRecipients > 0
                                ? `Se enviara por copia oculta a ${totalRecipients} destinatario${totalRecipients !== 1 ? 's' : ''}`
                                : 'Selecciona al menos un destinatario'}
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={() => onSubmit({ description, subject })}
                                disabled={!subject.trim() || !description.trim() || totalRecipients === 0 || processing}
                                className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:from-green-600 dark:to-green-800"
                            >
                                {processing ? 'Enviando...' : 'Enviar Correo Masivo'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
