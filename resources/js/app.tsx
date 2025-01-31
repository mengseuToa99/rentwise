import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router'; // Import your router

const container = document.getElementById('app');

if (container) {
    const root = createRoot(container);
    root.render(<AppRouter />);
} else {
    console.error('Root element not found');
}