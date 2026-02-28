import { Link } from '@inertiajs/react';
import { FaEnvelope, FaInstagram, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

export default function Footer() {
    return (
        <footer className="relative z-10 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 py-16 text-white dark:from-gray-900 dark:via-black dark:to-gray-900">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-600/20 to-green-600/20 blur-2xl"></div>
                <div className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-gradient-to-br from-green-600/20 to-purple-600/20 blur-xl"></div>
            </div>

            <div className="relative container mx-auto px-6">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <div className="mb-6">
                            <h3 className="mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-2xl font-bold text-transparent">
                                ADOPTAFÁCIL
                            </h3>
                            <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500"></div>
                        </div>
                        <p className="mb-6 leading-relaxed text-gray-300">
                            Conectando mascotas con hogares amorosos desde 2025.
                            <span className="font-medium text-green-400"> Cambiando vidas, una adopción a la vez.</span>
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span className="text-green-400">🐾</span>
                            <span>Miles de familias felices</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-6 text-lg font-semibold text-green-400">Contacto</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-3 text-gray-300">
                                <FaEnvelope className="text-blue-400" size={18} />
                                <a href="mailto:notificacionesadoptafacil@gmail.com" className="transition-colors hover:text-blue-300">
                                    notificacionesadoptafacil@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-300">
                                <FaWhatsapp className="text-green-400" size={18} />
                                <a
                                    href="https://wa.me/573102079572"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="transition-colors hover:text-green-300"
                                >
                                    +57 3102079572
                                </a>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-300">
                                <FaMapMarkerAlt className="text-purple-400" size={18} />
                                <span>Colombia</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 text-lg font-semibold text-purple-400">Síguenos</h4>
                        <div className="mb-6 flex space-x-4">
                            <a
                                href="https://www.instagram.com/adoptafacil/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Instagram de AdoptaFácil"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50"
                            >
                                <FaInstagram size={18} />
                            </a>
                            <a
                                href="https://www.tiktok.com/@adoptafacil2025"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="TikTok de AdoptaFácil"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-gray-700 to-black text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-500/50"
                            >
                                <SiTiktok size={18} />
                            </a>
                        </div>
                        <p className="text-sm text-gray-400">Síguenos para ver historias de adopción y consejos para el cuidado de mascotas</p>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-700 pt-8">
                    <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                        <p className="text-center text-gray-400 md:text-left">© 2025 Adoptafácil. Todos los derechos reservados.</p>
                        <div className="flex space-x-6 text-sm text-gray-400">
                            <Link href="/terminos" className="transition-colors hover:text-green-400">
                                Términos y condiciones
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
