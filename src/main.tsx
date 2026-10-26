import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { NotInPrototypeProvider } from './lib/notInPrototype';
import { ThemeProvider } from './lib/theme';
import { ToastProvider } from './lib/toast';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <NotInPrototypeProvider>
            <App />
          </NotInPrototypeProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
