// resources/js/components/comunidad/post-card.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import CommentModal from './comment-modal';
import ShareButton from './share-button';

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

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface PostCardProps {
    post: Post;
    user?: User;
    onDelete?: (postId: number) => void;
    onLikeUpdate?: (postId: number, liked: boolean, likesCount: number) => void;
    onCommentUpdate?: (postId: number, commentsCount: number) => void;
}

export default function PostCard({ post, user, onDelete, onLikeUpdate, onCommentUpdate }: PostCardProps) {
    const [likes, setLikes] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(post.is_liked || false);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [currentPost, setCurrentPost] = useState(post);

    // Actualizar el estado local cuando cambien las props del post
    useEffect(() => {
        setLikes(post.likes);
        setIsLiked(post.is_liked || false);
        setCurrentPost(post);
    }, [post.likes, post.is_liked, post.comments, post]);

    const getCategoryClass = (category: string) => {
        switch (category) {
            case 'Campaña':
                return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300';
            case 'Noticia':
                return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-300';
            case 'Consejo':
                return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300';
            default:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300';
        }
    };

    const handleLike = async () => {
        if (!user || isLiking) return;

        setIsLiking(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            if (!csrfToken) {
                console.error('CSRF token no encontrado');
                return;
            }

            const response = await fetch(`/comunidad/posts/${post.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setLikes(data.likes_count);
                setIsLiked(data.liked);

                // Notificar al componente padre sobre el cambio
                if (onLikeUpdate) {
                    onLikeUpdate(post.id, data.liked, data.likes_count);
                }
            }
        } catch (error) {
            console.error('Error al dar like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!user || isDeleting) return;

        if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;

        setIsDeleting(true);

        router.delete(`/comunidad/posts/${post.id}`, {
            onSuccess: () => {
                if (onDelete) {
                    onDelete(post.id);
                }
            },
            onError: () => {
                // Manejar error
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const canDelete =
        user &&
        // El usuario es el autor del post O es admin
        (post.author.name === user.name || user?.role === 'admin');

    const isAdminDelete = user?.role === 'admin' && post.author.name !== user.name;

    return (
        <div className="overflow-hidden rounded-xl border-2 border-gray-600 bg-white shadow-lg transition-all duration-300 hover:border-gray-500 hover:shadow-2xl dark:border-gray-600 dark:bg-gray-900 dark:hover:border-gray-400">
            {/* Cabecera de la publicación */}
            <div className="flex items-center p-4">
                <Avatar>
                    <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{post.author.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryClass(post.category)}`}>{post.category}</span>
                    {canDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`${
                                isAdminDelete
                                    ? 'text-orange-500 hover:text-red-600 dark:text-orange-400 dark:hover:text-red-500'
                                    : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500'
                            }`}
                            title={isAdminDelete ? 'Eliminar como administrador' : 'Eliminar mi publicación'}
                        >
                            <Trash2 className="h-4 w-4" />
                            {isAdminDelete && <span className="ml-1 text-xs">Admin</span>}
                        </Button>
                    )}
                </div>
            </div>

            {/* Contenido e imagen lado a lado */}
            <div className="px-4 pb-4">
                {post.imageUrl ? (
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                        </div>
                        <div className="w-1/3 flex-shrink-0">
                            <img src={post.imageUrl} alt="Imagen del post" className="max-h-48 w-full rounded-lg object-cover" />
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                )}
            </div>

            {/* Acciones (Me gusta, Comentar, Compartir) */}
            <div className="flex border-t border-gray-200 p-2 dark:border-gray-700">
                <Button
                    variant="ghost"
                    className={`flex-1 gap-2 transition-all duration-300 ${
                        isLiked ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                    } hover:scale-105 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-500`}
                    onClick={handleLike}
                    disabled={!user || isLiking}
                >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''} ${isLiking ? 'animate-pulse' : ''}`} />
                    <span className="text-sm">{likes} Me gusta</span>
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 gap-2 text-gray-600 transition-all duration-300 hover:scale-105 hover:bg-blue-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-500"
                    onClick={() => setShowCommentModal(true)}
                    disabled={!user}
                >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{post.comments} Comentarios</span>
                </Button>
                <ShareButton postId={post.id} disabled={!user} />
            </div>

            {/* Modal de comentarios */}
            <CommentModal
                isOpen={showCommentModal}
                onClose={() => setShowCommentModal(false)}
                post={currentPost}
                user={user}
                onLikeToggle={(postId, liked, likesCount) => {
                    // Actualizar el estado local del post card
                    setLikes(likesCount);
                    setIsLiked(liked);
                    setCurrentPost((prev) => ({
                        ...prev,
                        likes: likesCount,
                        is_liked: liked,
                    }));

                    // Notificar al componente padre
                    if (onLikeUpdate) {
                        onLikeUpdate(postId, liked, likesCount);
                    }
                }}
                onCommentUpdate={(postId, commentsCount) => {
                    // Actualizar el estado local del post card
                    setCurrentPost((prev) => ({
                        ...prev,
                        comments: commentsCount,
                    }));

                    // Notificar al componente padre
                    if (onCommentUpdate) {
                        onCommentUpdate(postId, commentsCount);
                    }
                }}
            />
        </div>
    );
}
