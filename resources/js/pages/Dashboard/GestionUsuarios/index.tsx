import ChatbotWidget from '@/components/chatbot-widget';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Eye, EyeOff, Mail, Plus, Trash2, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Gestión de Usuarios', href: route('gestion.usuarios') }];

type UserType = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function GestionUsuarios() {
    const { usuarios, errors } = usePage<{ usuarios: UserType[]; errors?: Record<string, string> }>().props;
    const [filterRole, setFilterRole] = useState<string>('all');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'cliente' });
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailDescription, setEmailDescription] = useState('');
    const [additionalRecipients, setAdditionalRecipients] = useState<string[]>([]);
    const [showAllRecipients, setShowAllRecipients] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const filteredUsers = filterRole === 'all' ? usuarios : usuarios.filter((user) => user.role === filterRole);

    const handleSelectUser = (userId: number) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };

    const handleSelectAll = () => {
        setSelectedUsers(selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map((user) => user.id));
    };

    const handleCreateUser = () => {
        router.post(route('gestion.usuarios.store'), newUser, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                setNewUser({ name: '', email: '', password: '', role: 'cliente' });
                setShowPassword(false);
            },
        });
    };

    const handleEditUser = (user: UserType) => {
        setEditingUser(user);
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = () => {
        if (editingUser) {
            router.put(
                route('gestion.usuarios.update', editingUser.id),
                {
                    name: editingUser.name,
                    email: editingUser.email,
                    role: editingUser.role,
                },
                {
                    onSuccess: () => {
                        setIsEditDialogOpen(false);
                        setEditingUser(null);
                    },
                },
            );
        }
    };

    const handleDeleteUser = (userId: number) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            router.delete(route('gestion.usuarios.destroy', userId));
        }
    };

    const handleSendBulkEmail = async () => {
        const selectedEmails = selectedUsers
            .map((userId) => {
                const user = usuarios.find((u) => u.id === userId);
                return user ? user.email : null;
            })
            .filter((email) => email !== null);

        const allEmails = [...selectedEmails, ...additionalRecipients];

        try {
            const response = await fetch('/api/send-bulk-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emails: allEmails,
                    subject: emailSubject,
                    description: emailDescription,
                }),
            });

            if (response.ok) {
                alert('Correos enviados exitosamente');
                setIsEmailModalOpen(false);
                setEmailSubject('');
                setEmailDescription('');
                setAdditionalRecipients([]);
            } else {
                const errorText = await response.text();
                alert('Error al enviar correos: ' + errorText);
            }
        } catch (error) {
            alert('Error de conexión: ' + (error as Error).message);
        }
    };

    const generateEmailHTML = (subject: string, description: string) => {
        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { width: 100px; }
                    h1 { color: #4CAF50; text-align: center; }
                    p { line-height: 1.6; }
                    .cta-button { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="/Logo/Logo.png" alt="AdoptaFácil Logo">
                    </div>
                    <h1>${subject}</h1>
                    <p>Hola,</p>
                    <p>${description.replace(/\n/g, '<br>')}</p>
                    <p>¡Gracias por ser parte de AdoptaFácil!</p>
                    <a href="#" class="cta-button">Visitar AdoptaFácil</a>
                    <footer>
                        <p>AdoptaFácil - Conectando corazones con patitas</p>
                        <p>Si tienes alguna pregunta, contáctanos en info@adoptafacil.com</p>
                    </footer>
                </div>
            </body>
            </html>
        `;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Usuarios" />

            <main className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 relative flex-1 overflow-y-auto bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6 dark:from-green-600 dark:via-blue-700 dark:to-purple-800">
                {/* Elementos decorativos de fondo */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Círculos decorativos grandes */}
                    <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                    <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-300/10 blur-3xl"></div>

                    {/* Puntos animados */}
                    <div className="absolute top-20 right-20 h-3 w-3 animate-pulse rounded-full bg-white/20 shadow-lg"></div>
                    <div className="absolute top-1/3 left-1/4 h-4 w-4 animate-ping rounded-full bg-white/30 shadow-lg"></div>
                    <div className="absolute right-1/3 bottom-32 h-2 w-2 animate-pulse rounded-full bg-white/25 shadow-md"></div>
                </div>

                <div className="relative z-10 container mx-auto">
                    {/* Título de la página con gradiente */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl lg:text-6xl">
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Gestión de Usuarios</span>
                        </h1>
                        <p className="mt-4 text-xl leading-relaxed font-medium text-white/90">Administra los usuarios de la plataforma</p>

                        {/* Línea decorativa */}
                        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    </div>

                    {/* Panel de controles superior */}
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:bg-gray-800/95">
                        <div className="flex items-center gap-4">
                            <Select value={filterRole} onValueChange={setFilterRole}>
                                <SelectTrigger className="w-48 border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                    <SelectValue placeholder="Filtrar por rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="cliente">Cliente</SelectItem>
                                    <SelectItem value="aliado">Aliado</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="text-gray-600 dark:text-gray-300">
                                {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {selectedUsers.length > 0 && (
                                <Button
                                    onClick={() => setIsEmailModalOpen(true)}
                                    variant="outline"
                                    className="border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Enviar Correo ({selectedUsers.length})
                                </Button>
                            )}
                            <Dialog
                                open={isCreateDialogOpen}
                                onOpenChange={(open) => {
                                    setIsCreateDialogOpen(open);
                                    if (!open) {
                                        setShowPassword(false);
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:from-blue-600 dark:to-blue-800">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Crear Usuario
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-white/95 p-0 shadow-2xl backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=open]:zoom-in-95 dark:bg-gray-800/95">
                                    {/* Elementos decorativos del modal */}
                                    <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                                    <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/5 to-transparent"></div>

                                    <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-600 relative max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
                                        <DialogHeader className="mb-6">
                                            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                                                Crear Nuevo Usuario
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-200">
                                                    Nombre
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={newUser.name}
                                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                    className="col-span-3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                />
                                                {errors?.name && (
                                                    <p className="col-span-3 col-start-2 text-sm text-red-500 dark:text-red-400">{errors.name}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="email" className="text-right text-gray-700 dark:text-gray-200">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={newUser.email}
                                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                    className="col-span-3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                />
                                                {errors?.email && (
                                                    <p className="col-span-3 col-start-2 text-sm text-red-500 dark:text-red-400">{errors.email}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="password" className="text-right text-gray-700 dark:text-gray-200">
                                                    Contraseña
                                                </Label>
                                                <div className="relative col-span-3">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={newUser.password}
                                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                        className="pr-10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {errors?.password && (
                                                    <p className="col-span-3 col-start-2 text-sm text-red-500 dark:text-red-400">{errors.password}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="role" className="text-right text-gray-700 dark:text-gray-200">
                                                    Rol
                                                </Label>
                                                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                                                    <SelectTrigger className="col-span-3 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cliente">Cliente</SelectItem>
                                                        <SelectItem value="aliado">Aliado</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors?.role && (
                                                    <p className="col-span-3 col-start-2 text-sm text-red-500 dark:text-red-400">{errors.role}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsCreateDialogOpen(false);
                                                    setShowPassword(false);
                                                }}
                                                className="border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleCreateUser}
                                                className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:from-green-600 dark:to-green-800"
                                            >
                                                Crear Usuario
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                <DialogContent className="fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-white/95 p-0 shadow-2xl backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=open]:zoom-in-95 dark:bg-gray-800/95">
                                    {/* Elementos decorativos del modal */}
                                    <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                                    <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-300/5 to-transparent"></div>

                                    <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-600 relative max-h-[calc(100vh-6rem)] overflow-y-auto p-6">
                                        <DialogHeader className="mb-6">
                                            <DialogTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent dark:from-purple-400 dark:to-blue-400">
                                                Editar Usuario
                                            </DialogTitle>
                                        </DialogHeader>
                                        {editingUser && (
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="edit-name" className="text-right text-gray-700 dark:text-gray-200">
                                                        Nombre
                                                    </Label>
                                                    <Input
                                                        id="edit-name"
                                                        value={editingUser.name}
                                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                                        className="col-span-3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="edit-email" className="text-right text-gray-700 dark:text-gray-200">
                                                        Email
                                                    </Label>
                                                    <Input
                                                        id="edit-email"
                                                        type="email"
                                                        value={editingUser.email}
                                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                                        className="col-span-3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="edit-role" className="text-right text-gray-700 dark:text-gray-200">
                                                        Rol
                                                    </Label>
                                                    <Select
                                                        value={editingUser.role}
                                                        onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                                                    >
                                                        <SelectTrigger className="col-span-3 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cliente">Cliente</SelectItem>
                                                            <SelectItem value="aliado">Aliado</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-8 flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsEditDialogOpen(false)}
                                                className="border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleUpdateUser}
                                                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:from-blue-600 dark:to-blue-800"
                                            >
                                                Actualizar Usuario
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                                <DialogContent className="fixed top-[50%] left-[50%] z-50 w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-white/95 p-0 shadow-2xl backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=open]:zoom-in-95 dark:bg-gray-800/95">
                                    {/* Elementos decorativos del modal de email */}
                                    <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/15 to-transparent"></div>
                                    <div className="pointer-events-none absolute top-1/3 -left-8 h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                                    <div className="pointer-events-none absolute right-1/4 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-tl from-purple-500/8 to-transparent"></div>

                                    <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-600 relative max-h-[calc(100vh-4rem)] overflow-y-auto p-8">
                                        <DialogHeader className="mb-8">
                                            <DialogTitle className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:via-blue-400 dark:to-purple-400">
                                                📧 Enviar Correo Masivo
                                            </DialogTitle>
                                            <DialogDescription className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                                                Envía un correo electrónico personalizado a los usuarios seleccionados con un diseño profesional.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-8">
                                            {/* Sección de Destinatarios */}
                                            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50">
                                                <Label className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    👥 Destinatarios ({selectedUsers.length + additionalRecipients.length})
                                                </Label>
                                                <div className="mt-4 flex flex-wrap gap-3">
                                                    {(() => {
                                                        const allRecipients = [
                                                            ...selectedUsers
                                                                .map((userId) => {
                                                                    const user = usuarios.find((u) => u.id === userId);
                                                                    return user ? { name: user.name, email: user.email } : null;
                                                                })
                                                                .filter(Boolean),
                                                            ...additionalRecipients.map((email) => ({ name: '', email })),
                                                        ];
                                                        const displayedRecipients = showAllRecipients ? allRecipients : allRecipients.slice(0, 2);
                                                        return (
                                                            <>
                                                                {displayedRecipients.map((recipient, index) => (
                                                                    <Badge
                                                                        key={index}
                                                                        variant="secondary"
                                                                        className="border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-blue-800 shadow-sm dark:border-blue-700/50 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-200"
                                                                    >
                                                                        {recipient!.name
                                                                            ? `${recipient!.name} <${recipient!.email}>`
                                                                            : recipient!.email}
                                                                    </Badge>
                                                                ))}
                                                                {allRecipients.length > 2 && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => setShowAllRecipients(!showAllRecipients)}
                                                                        className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-600/50 dark:bg-blue-900/30 dark:text-blue-400"
                                                                    >
                                                                        {showAllRecipients ? 'Ver menos' : `Ver todos (${allRecipients.length - 2})`}
                                                                    </Button>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Sección de Asunto */}
                                            <div className="rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50">
                                                <Label
                                                    htmlFor="email-subject"
                                                    className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200"
                                                >
                                                    📝 Asunto del Correo
                                                </Label>
                                                <Input
                                                    id="email-subject"
                                                    placeholder="Ej: ¡Nuevas mascotas disponibles para adopción!"
                                                    value={emailSubject}
                                                    onChange={(e) => setEmailSubject(e.target.value)}
                                                    className="mt-3 border-2 border-green-200 bg-white shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-green-400"
                                                />
                                            </div>

                                            {/* Sección de Descripción */}
                                            <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50">
                                                <Label
                                                    htmlFor="email-description"
                                                    className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200"
                                                >
                                                    ✍️ Mensaje del Correo
                                                </Label>
                                                <Textarea
                                                    id="email-description"
                                                    placeholder="Escribe un mensaje cálido y personalizado para tus usuarios..."
                                                    value={emailDescription}
                                                    onChange={(e) => setEmailDescription(e.target.value)}
                                                    rows={6}
                                                    className="mt-3 border-2 border-purple-200 bg-white shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-purple-400"
                                                />
                                            </div>
                                            {/* Sección de Previsualización */}
                                            <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50">
                                                <Label className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    👁️ Previsualización del Correo
                                                </Label>
                                                <div className="mt-4 overflow-hidden rounded-2xl border-2 border-yellow-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                                                    <iframe
                                                        srcDoc={generateEmailHTML(emailSubject, emailDescription)}
                                                        className="w-full rounded-2xl border-0"
                                                        style={{ height: '450px' }}
                                                        title="Email Preview"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Botones de acción */}
                                        <div className="flex items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-600">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {selectedUsers.length + additionalRecipients.length > 0
                                                    ? `Se enviará a ${selectedUsers.length + additionalRecipients.length} destinatario${selectedUsers.length + additionalRecipients.length !== 1 ? 's' : ''}`
                                                    : 'Selecciona al menos un destinatario'}
                                            </div>
                                            <div className="flex gap-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEmailModalOpen(false)}
                                                    className="border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    onClick={handleSendBulkEmail}
                                                    disabled={
                                                        !emailSubject.trim() ||
                                                        !emailDescription.trim() ||
                                                        selectedUsers.length + additionalRecipients.length === 0
                                                    }
                                                    className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:from-green-600 dark:to-green-800"
                                                >
                                                    📧 Enviar Correo Masivo
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Tabla de usuarios con diseño mejorado */}
                    <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-sm transition-all duration-500 dark:bg-gray-800/95">
                        {/* Elementos decorativos internos */}
                        <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                        <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/5 to-transparent"></div>

                        <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-600 relative overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                                        <TableHead className="w-12 pl-6">
                                            <Checkbox
                                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                                onCheckedChange={handleSelectAll}
                                                className="border-blue-300 data-[state=checked]:bg-blue-600 dark:border-gray-500 dark:data-[state=checked]:bg-blue-500"
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-gray-800 dark:text-gray-100">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Nombre
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-bold text-gray-800 dark:text-gray-100">Email</TableHead>
                                        <TableHead className="font-bold text-gray-800 dark:text-gray-100">Rol</TableHead>
                                        <TableHead className="w-32 pr-6 font-bold text-gray-800 dark:text-gray-100">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="group border-b border-gray-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:shadow-md dark:border-gray-700 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50"
                                        >
                                            <TableCell className="pl-6">
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={() => handleSelectUser(user.id)}
                                                    className="border-blue-300 transition-colors data-[state=checked]:bg-blue-600 dark:border-gray-500 dark:data-[state=checked]:bg-blue-500"
                                                />
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900 transition-colors group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                                                {user.name}
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-300">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={`rounded-full font-semibold capitalize shadow-sm ${
                                                        user.role === 'admin'
                                                            ? 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-red-200 dark:from-red-500 dark:to-red-700'
                                                            : user.role === 'aliado'
                                                              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-blue-200 dark:from-blue-500 dark:to-blue-700'
                                                              : 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-green-200 dark:from-green-500 dark:to-green-700'
                                                    }`}
                                                >
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <div className="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEditUser(user)}
                                                        className="border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-blue-100 hover:shadow-md dark:border-blue-600/50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-red-100 hover:shadow-md dark:border-red-600/50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Estado vacío mejorado */}
                    {filteredUsers.length === 0 && (
                        <div className="group hover:shadow-3xl relative overflow-hidden rounded-3xl bg-white/95 p-16 shadow-2xl backdrop-blur-sm transition-all duration-500 dark:bg-gray-800/95">
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-tr from-blue-300/5 to-transparent"></div>

                            <div className="relative text-center">
                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg dark:from-blue-900/50 dark:to-purple-900/50">
                                    <User className="h-12 w-12 text-blue-600 dark:text-blue-300" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">No hay usuarios con ese filtro</h3>
                                <p className="text-gray-600 dark:text-gray-300">Cambia el filtro o crea un nuevo usuario</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Componentes adicionales */}
            <ChatbotWidget />
            <ThemeSwitcher />
        </AppLayout>
    );
}
