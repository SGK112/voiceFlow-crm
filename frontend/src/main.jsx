import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './styles/index.css';

// Enable dark mode by default
document.documentElement.classList.add('dark');

// CRITICAL DEBUG - Force console output
const apiUrl = import.meta.env.VITE_API_URL || 'NOT SET';
console.error('=== VOICEFLOW DEBUG ===');
console.error('API URL:', apiUrl);
console.error('Mode:', import.meta.env.MODE);
console.error('=======================');

// Show visible error if API URL is wrong
if (!apiUrl || apiUrl === 'NOT SET' || apiUrl.includes('localhost')) {
  document.body.innerHTML = '<div style="color: red; font-size: 24px; padding: 50px;">ERROR: API_URL is ' + apiUrl + '</div>';
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
