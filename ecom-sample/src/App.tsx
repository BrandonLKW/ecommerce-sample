import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainPage from './pages/MainPage/MainPage'
import ProductPage from './pages/ProductPage/ProductPage'
import { CartContextProvider } from './context/CartContext'
import './App.css'

function App() {

  useEffect(() => {
    //Future implementation to check if cart exists when logged in
  }, []);

  return (
    <CartContextProvider>
      <div>
        <Routes>
          <Route path="/products" element={<ProductPage />}/>
          <Route path="*" element={<MainPage/>}/>
        </Routes>
      </div>
    </CartContextProvider>
  )
}

export default App
