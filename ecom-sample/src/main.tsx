import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartContextProvider } from './context/CartContext';
import { ModalContextProvider } from './context/ModalContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartContextProvider>
        <ModalContextProvider>
          <App />
        </ModalContextProvider>
      </CartContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
