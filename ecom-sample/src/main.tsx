import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { MainContextProvider } from './context/MainContext.tsx';
import { ModalContextProvider } from './context/ModalContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MainContextProvider>
        <ModalContextProvider>
          <App />
        </ModalContextProvider>
      </MainContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
