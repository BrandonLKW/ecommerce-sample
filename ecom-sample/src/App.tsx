import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import ProductPage from './pages/ProductPage/ProductPage';
import OrdersPage from './pages/OrderPage/OrderPage';
import Navbar from './components/Navbar/Navbar';
import { CartContextProvider } from './context/CartContext';
import { ModalContextProvider } from './context/ModalContext';
import './App.css';

function App() {

  useEffect(() => {
    //Future implementation to check if cart exists when logged in
  }, []);

  return (
    <CartContextProvider>
      <ModalContextProvider>
        <div className="appbody">
          <Navbar />
          <Routes>
            <Route path="/products" element={<ProductPage />}/>
            <Route path="/orders" element={<OrdersPage />}/>
            <Route path="*" element={<MainPage/>}/>
          </Routes>
        </div>
      </ModalContextProvider>
    </CartContextProvider>
  )
}

export default App
