/**
 * Página principal de la comunidad de AdoptaFácil
 *
 * Esta vista constituye el centro social de la plataforma donde los usuarios
 * pueden interactuar, compartir experiencias y crear una comunidad sólida:
 *
 * Características principales:
 * - Feed principal con publicaciones de la comunidad
 * - Sistema de creación de posts con texto e imágenes
 * - Interacciones sociales (likes, comentarios, compartir)
 * - Filtros para organizar el contenido por tipo
 * - Trending topics y temas populares
 *
 * Funcionalidades del feed:
 * - Carga paginada de publicaciones ordenadas por fecha
 * - Sistema de likes en tiempo real
 * - Comentarios anidados en publicaciones
 * - Filtrado por tipo de contenido (historias, consejos, preguntas)
 * - Búsqueda de posts por contenido
 *
 * Interacciones disponibles:
 * - Crear nuevas publicaciones con imágenes
 * - Dar like/unlike a publicaciones
 * - Comentar y responder comentarios
 * - Compartir posts en redes sociales
 * - Reportar contenido inapropiado
 *
 * @author Equipo AdoptaFácil
 * @version 1.0.0
 * @since 2024
 */

import ChatbotWidget from '@/components/chatbot-widget';
import ComunityHero from '@/components/comunidad/comunity-hero';
import CreatePost from '@/components/comunidad/create-post';
import PostCard from '@/components/comunidad/post-card';
import PostFilters from '@/components/comunidad/post-filters';
import TrendingTopics from '@/components/comunidad/trending-topics';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useToastMessage } from '@/lib/toast';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface Post {
    id: number;
    author: {
        name: string;
        avatarUrl: string;
    };
    timestamp: string;
    content: string;
    imageUrl?: string;
    likes: number;
    is_liked?: boolean;
    comments: number;
    category: string;
}

interface ComunidadProps {
    auth?: {
        user?: User;
    };
    posts?: Post[];
    flash?: {
        success?: string;
        error?: string;
    };
}

// Datos de ejemplo para las publicaciones (como fallback)
const samplePosts = [
    {
        id: 1,
        author: {
            name: 'Fundación Huellitas Felices',
            avatarUrl: 'https://i.pravatar.cc/150?u=huellitasfelices',
        },
        timestamp: 'hace 2 horas',
        content:
            '¡Gran jornada de esterilización este fin de semana! 🐾 Ayúdanos a controlar la sobrepoblación y a mejorar la calidad de vida de nuestros amigos peludos. Tendremos precios especiales y contaremos con el apoyo de veterinarios expertos. ¡No faltes!',
        imageUrl: 'https://images.unsplash.com/photo-1549483363-1c8b7be41523?q=80&w=870&auto=format&fit=crop',
        likes: 125,
        comments: 12,
        category: 'Campaña',
    },
    {
        id: 2,
        author: {
            name: 'AdoptaFácil Admin',
            avatarUrl: 'https://i.pravatar.cc/150?u=adoptafaciladmin',
        },
        timestamp: 'hace 1 día',
        content:
            '¡Bienvenidos a nuestra nueva sección de Comunidad! ✨ Este es un espacio para conectar, compartir y colaborar por el bienestar de los animales. ¡Esperamos ver sus publicaciones pronto!',
        likes: 350,
        comments: 45,
        category: 'Noticia',
    },
    {
        id: 3,
        author: {
            name: 'Veterinaria El Arca',
            avatarUrl: 'https://i.pravatar.cc/150?u=elarca',
        },
        timestamp: 'hace 3 días',
        content:
            'Consejo del día: ¿Sabías que el cepillado regular no solo mantiene el pelaje de tu mascota sano, sino que también fortalece su vínculo contigo? 🐕❤️',
        likes: 88,
        comments: 5,
        category: 'Consejo',
    },
];

export default function Comunidad({ auth, posts: initialPosts, flash }: ComunidadProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts || samplePosts);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts || samplePosts);
    const user = auth?.user;

    useToastMessage(flash?.success, 'success');
    useToastMessage(flash?.error, 'error');

    const handlePostDelete = (postId: number) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        setFilteredPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    };

    // Función para recargar posts desde el servidor
    const handlePostCreated = (newPost: Post) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        setFilteredPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    // Función para manejar actualizaciones de likes
    const handleLikeUpdate = (postId: number, liked: boolean, likesCount: number) => {
        setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, likes: likesCount, is_liked: liked } : post)));
        setFilteredPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, likes: likesCount, is_liked: liked } : post)));
    };

    // Función para manejar actualizaciones de comentarios
    const handleCommentUpdate = (postId: number, commentsCount: number) => {
        setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, comments: commentsCount } : post)));
        setFilteredPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, comments: commentsCount } : post)));
    };

    // Función para manejar cambios en los filtros
    const handleFiltersChange = (filters: { search: string; categories: string[] }) => {
        let filtered = [...posts];

        // Filtrar por búsqueda
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(
                (post) => post.content.toLowerCase().includes(searchTerm) || post.author.name.toLowerCase().includes(searchTerm),
            );
        }

        // Filtrar por categorías
        if (filters.categories.length > 0) {
            filtered = filtered.filter((post) => filters.categories.includes(post.category));
        }

        setFilteredPosts(filtered);
    };

    // Actualizar posts filtrados cuando cambien los posts originales
    useEffect(() => {
        setFilteredPosts(posts);
    }, [posts]);

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
            <Head title="Comunidad" />
            <Header />
            <ComunityHero />

            <main className="flex-1">
                {/* Sección principal con espaciado según PALETA */}
                <div className="relative border-t border-blue-200/50 bg-gradient-to-br from-blue-100/80 via-green-100/60 to-blue-200/40 py-12 md:py-16 dark:border-blue-800/30 dark:from-blue-950/40 dark:via-green-950/30 dark:to-blue-900/50">
                    {/* Elementos decorativos según PALETA */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-300/30 to-green-300/30 blur-3xl dark:from-blue-800/25 dark:to-green-800/25"></div>
                        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-br from-green-300/25 to-blue-300/25 blur-2xl dark:from-green-800/30 dark:to-blue-800/30"></div>

                        {/* Puntos animados */}
                        <div className="absolute top-1/4 right-1/3 h-3 w-3 animate-pulse rounded-full bg-blue-400/90 shadow-lg shadow-blue-400/50 dark:bg-blue-600/90 dark:shadow-blue-600/50"></div>
                        <div className="absolute bottom-1/3 left-1/4 h-4 w-4 animate-ping rounded-full bg-green-400/80 shadow-lg shadow-green-400/50 dark:bg-green-600/80 dark:shadow-green-600/50"></div>
                    </div>

                    <div className="relative container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            {/* Filtros a la izquierda (3 de 12 columnas) */}
                            <aside className="lg:col-span-3">
                                <PostFilters onFiltersChange={handleFiltersChange} />
                            </aside>

                            {/* Feed de publicaciones (6 de 12 columnas, el área central) */}
                            <section className="space-y-8 lg:col-span-6">
                                <CreatePost user={user} onPostCreated={handlePostCreated} />

                                <div className="space-y-6">
                                    {filteredPosts && filteredPosts.length > 0 ? (
                                        filteredPosts.map((post) => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                user={user}
                                                onDelete={handlePostDelete}
                                                onLikeUpdate={handleLikeUpdate}
                                                onCommentUpdate={handleCommentUpdate}
                                            />
                                        ))
                                    ) : posts && posts.length > 0 ? (
                                        <div className="rounded-xl bg-white p-8 text-center shadow-lg dark:bg-gray-900">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No se encontraron publicaciones que coincidan con los filtros aplicados.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-white p-8 text-center shadow-lg dark:bg-gray-900">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No hay publicaciones aún. ¡Sé el primero en compartir algo!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Tendencias a la derecha (3 de 12 columnas) */}
                            <aside className="hidden lg:col-span-3 lg:block">
                                <TrendingTopics />
                            </aside>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <ThemeSwitcher hasChatbot={true} />
            <ChatbotWidget />
        </div>
    );
}
