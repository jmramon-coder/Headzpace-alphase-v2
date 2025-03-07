import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AIProvider } from './context/AIContext';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import { DesignProvider } from './context/DesignContext';
import { ViewportProvider } from './context/ViewportContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { VideoProvider } from './context/VideoContext';
import { router } from './routes';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AIProvider>
            <LayoutProvider>
              <DesignProvider>
                <ViewportProvider>
                  <WorkspaceProvider>
                    <VideoProvider>
                      <RouterProvider router={router} />
                    </VideoProvider>
                  </WorkspaceProvider>
                </ViewportProvider>
              </DesignProvider>
            </LayoutProvider>
          </AIProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);