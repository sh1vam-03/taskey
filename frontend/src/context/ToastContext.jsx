'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right-full duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' :
                                toast.type === 'error' ? 'bg-red-500 text-white' :
                                    'bg-background border text-foreground'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        {toast.type === 'error' && <AlertCircle className="h-4 w-4" />}
                        {toast.type === 'info' && <Info className="h-4 w-4" />}
                        <span>{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
