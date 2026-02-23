import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type SharedData, type Shelter } from '@/types';
import { usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import FormularioDonacion from '../../pages/Dashboard/Donaciones/components/formulario-donacion';

interface ShelterCardProps {
    shelter: Shelter;
}

export default function ShelterCard({ shelter }: ShelterCardProps) {
    const { auth } = usePage<SharedData>().props;
    const [showDonationForm, setShowDonationForm] = useState(false);

    const handleDonateClick = () => {
        if (!auth.user) {
            window.location.href = route('login');
        } else {
            setShowDonationForm(true);
        }
    };

    return (
        <>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                {/* Badge de refugio según PALETA */}
                <div className="absolute top-4 right-4 z-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    Refugio
                </div>

                {/* Elementos decorativos de fondo */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-300/20 to-green-300/20 blur-xl dark:from-blue-700/15 dark:to-green-700/15"></div>
                    <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-tr from-green-300/15 to-blue-300/15 blur-lg dark:from-green-800/10 dark:to-blue-800/10"></div>
                </div>

                <div className="relative z-10 p-6">
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={shelter.user?.avatar ? `/storage/${shelter.user.avatar}` : undefined} alt={shelter.user?.name} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-xs text-white">
                                    {shelter.user?.name?.substring(0, 2).toUpperCase() || 'RF'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:to-gray-300">
                                    {shelter.name}
                                </h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Registrado por: {shelter.user?.name || 'Aliado'}</p>
                            </div>
                        </div>
                    </div>

                    <p className="mb-6 line-clamp-3 text-base leading-relaxed text-gray-700 dark:text-gray-300">{shelter.description}</p>

                    {/* Separador decorativo */}
                    <div className="mb-6 h-0.5 w-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 group-hover:w-24"></div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <span>{shelter.user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4 text-green-500 dark:text-green-400" />
                            <span>
                                {shelter.address}, {shelter.city}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <span>{shelter.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Sección inferior con botón de donar y contador */}
                <div className="relative z-10 mt-auto flex items-center justify-between p-6 pt-2">
                    <Button
                        onClick={handleDonateClick}
                        className="rounded-xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-800 hover:shadow-xl focus:ring-4 focus:ring-green-300/50 focus:outline-none"
                    >
                        <span className="flex items-center space-x-2">
                            <span>💝</span>
                            <span>Donar</span>
                        </span>
                    </Button>
                    {/* Contador de Donaciones */}
                    <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-green-500/10 px-3 py-2 backdrop-blur-sm dark:from-blue-600/20 dark:to-green-600/20">
                        <p className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-sm font-bold text-transparent dark:from-blue-400 dark:to-green-400">
                            {shelter.donations_count} donaciones
                        </p>
                    </div>
                </div>

                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-all duration-500 group-hover:translate-x-[200%] group-hover:opacity-100"></div>
            </div>

            {showDonationForm && <FormularioDonacion showModal={showDonationForm} onClose={() => setShowDonationForm(false)} shelters={[shelter]} />}
        </>
    );
}
