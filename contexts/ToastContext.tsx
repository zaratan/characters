'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

type Toast = {
  id: number;
  message: string;
};

type ToastContextType = {
  showError: (message: string) => void;
};

const ToastContext = createContext<ToastContextType>({
  showError: () => {},
});

export const useToast = () => useContext(ToastContext);

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ToastItem = styled.div<{ $removing?: boolean }>`
  background: #d32f2f;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  max-width: 360px;
  animation: ${({ $removing }) => ($removing ? slideOut : slideIn)} 0.3s
    ease-in-out forwards;
`;

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(Toast & { removing?: boolean })[]>([]);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const showError = useCallback((message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showError }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} $removing={toast.removing}>
            {toast.message}
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export default ToastContext;
