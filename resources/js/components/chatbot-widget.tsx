import React, { useEffect, useRef, useState } from 'react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: '¡Hola! Soy tu asistente de adopciones. ¿En qué puedo ayudarte hoy? 🐶', sender: 'bot' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessageToService = async (message: string): Promise<string> => {
        try {
            // Llamada al servicio de chatbot
            const response = await fetch('http://127.0.0.1:8001/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servicio');
            }

            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error('Error al conectar con el servicio:', error);
            return 'Lo siento, hay un problema con la conexión. Inténtalo de nuevo más tarde. 🐾';
        }
    };

    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage: Message = {
            id: messages.length + 1,
            text: inputValue,
            sender: 'user',
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Obtener respuesta del servicio
        const botReply = await sendMessageToService(inputValue);

        const botMessage: Message = {
            id: messages.length + 2,
            text: botReply,
            sender: 'bot',
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Botón flotante mejorado */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group fixed right-6 bottom-6 z-50 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 p-4 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50"
                aria-label="Abrir chat"
            >
                <div className="relative">
                    {/* Ícono de chat */}
                    <svg
                        className="h-7 w-7 transition-transform group-hover:rotate-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    {/* Indicador de disponibilidad */}
                    <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
                </div>
            </button>

            {/* Modal de chat mejorado */}
            {isOpen && (
                <div className="fixed right-6 bottom-24 z-50 flex h-[36rem] w-96 flex-col rounded-3xl border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in-0 zoom-in-95 dark:border-gray-700/50 dark:bg-gray-800/95">
                    {/* Encabezado mejorado */}
                    <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 p-6 text-white shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <span className="text-lg">🐾</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Asistente de Adopciones</h3>
                                <p className="text-xs text-white/80">Estoy aquí para ayudarte</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-full bg-white/20 p-2 text-white transition-all hover:scale-110 hover:bg-white/30"
                            aria-label="Cerrar chat"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Área de mensajes mejorada */}
                    <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-br from-gray-50/80 via-blue-50/20 to-purple-50/20 p-6 dark:from-gray-900/80 dark:via-gray-800/50 dark:to-gray-900/80">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-end space-x-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.sender === 'bot' && (
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                        <span className="text-sm text-white">🐾</span>
                                    </div>
                                )}
                                <div
                                    className={`max-w-sm rounded-2xl px-5 py-4 shadow-lg transition-all hover:shadow-xl ${
                                        message.sender === 'user'
                                            ? 'ml-4 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white'
                                            : 'mr-4 border border-gray-200/50 bg-white/90 text-gray-800 dark:border-gray-600/50 dark:bg-gray-700/90 dark:text-white'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.text}</p>
                                </div>
                                {message.sender === 'user' && (
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg dark:from-gray-600 dark:to-gray-700">
                                        <span className="text-sm text-white">👤</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-end justify-start space-x-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                    <span className="text-sm text-white">🐾</span>
                                </div>
                                <div className="mr-4 max-w-sm rounded-2xl border border-gray-200/50 bg-white/90 px-5 py-4 text-gray-800 shadow-lg dark:border-gray-600/50 dark:bg-gray-700/90 dark:text-white">
                                    <div className="flex space-x-1">
                                        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-400"></div>
                                        <div className="h-3 w-3 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input y botón mejorado */}
                    <div className="rounded-b-3xl border-t border-gray-200/50 bg-white/95 p-6 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/95">
                        <div className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu mensaje..."
                                disabled={isLoading}
                                className={`flex-1 rounded-xl border px-5 py-4 shadow-sm transition-all focus:ring-4 focus:ring-blue-300/50 focus:outline-none ${
                                    isLoading
                                        ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-blue-500'
                                }`}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading}
                                className={`rounded-xl p-4 text-white shadow-lg transition-all duration-300 ${
                                    isLoading
                                        ? 'cursor-not-allowed bg-gray-400'
                                        : 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:scale-110 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 hover:shadow-xl'
                                }`}
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        {/* Sugerencias rápidas */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setInputValue('¿Qué es AdoptaFácil?')}
                                className="rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2 text-xs text-blue-800 transition-all hover:scale-105 hover:from-blue-200 hover:to-blue-300 dark:from-blue-900/50 dark:to-blue-800/50 dark:text-blue-300 dark:hover:from-blue-800/60 dark:hover:to-blue-700/60"
                            >
                                ¿Qué es AdoptaFácil?
                            </button>
                            <button
                                onClick={() => setInputValue('¿Cómo funciona la plataforma?')}
                                className="rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-3 py-2 text-xs text-green-800 transition-all hover:scale-105 hover:from-green-200 hover:to-green-300 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-300 dark:hover:from-green-800/60 dark:hover:to-green-700/60"
                            >
                                ¿Cómo funciona?
                            </button>
                            <button
                                onClick={() => setInputValue('¿Cuál es el proceso de adopción?')}
                                className="rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-2 text-xs text-purple-800 transition-all hover:scale-105 hover:from-purple-200 hover:to-purple-300 dark:from-purple-900/50 dark:to-purple-800/50 dark:text-purple-300 dark:hover:from-purple-800/60 dark:hover:to-purple-700/60"
                            >
                                Proceso de adopción
                            </button>
                            <button
                                onClick={() => setInputValue('¿Cuáles son los requisitos para adoptar?')}
                                className="rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 px-3 py-2 text-xs text-orange-800 transition-all hover:scale-105 hover:from-orange-200 hover:to-orange-300 dark:from-orange-900/50 dark:to-orange-800/50 dark:text-orange-300 dark:hover:from-orange-800/60 dark:hover:to-orange-700/60"
                            >
                                Requisitos adopción
                            </button>
                            <button
                                onClick={() => setInputValue('¿Es gratuita la plataforma?')}
                                className="rounded-lg bg-gradient-to-r from-teal-100 to-teal-200 px-3 py-2 text-xs text-teal-800 transition-all hover:scale-105 hover:from-teal-200 hover:to-teal-300 dark:from-teal-900/50 dark:to-teal-800/50 dark:text-teal-300 dark:hover:from-teal-800/60 dark:hover:to-teal-700/60"
                            >
                                ¿Es gratis?
                            </button>
                            <button
                                onClick={() => setInputValue('¿Cómo me registro?')}
                                className="rounded-lg bg-gradient-to-r from-indigo-100 to-indigo-200 px-3 py-2 text-xs text-indigo-800 transition-all hover:scale-105 hover:from-indigo-200 hover:to-indigo-300 dark:from-indigo-900/50 dark:to-indigo-800/50 dark:text-indigo-300 dark:hover:from-indigo-800/60 dark:hover:to-indigo-700/60"
                            >
                                ¿Cómo registrarme?
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;
