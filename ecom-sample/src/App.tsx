import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import ProductPage from './pages/ProductPage/ProductPage';
import OrdersPage from './pages/OrderPage/OrderPage';
import MetricPage from './pages/MetricPage/MetricPage';
import Navbar from './components/Navbar/Navbar';
import LoginFormModal from './components/Modal/LoginModal';
import SignUpFormModal from './components/Modal/SignupModal';
import { CartContextProvider } from './context/CartContext';
import { ModalContextProvider } from './context/ModalContext';
import 'dayjs/locale/en-sg';
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
            <Route path="/metrics" element={<MetricPage />}/>
            <Route path="*" element={<MainPage/>}/>
          </Routes>
          <LoginFormModal />
          <SignUpFormModal />
        </div>
      </ModalContextProvider>
    </CartContextProvider>
  )
}

export default App
