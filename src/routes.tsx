import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthCallback } from './components/auth/AuthCallback';
import { About } from './components/About';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />
  },
  {
    path: '/about',
    element: <About />
  }
]);
