import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
//custom page imports
import MainPage from './pages/MainPage/MainPage';
import ProductPage from './pages/ProductPage/ProductPage';
import OrdersPage from './pages/OrderPage/OrderPage';
import MetricPage from './pages/MetricPage/MetricPage';
//custom component imports
import Navbar from './components/Navbar/Navbar';
import LoginFormModal from './components/Modal/LoginModal';
import SignUpFormModal from './components/Modal/SignupModal';
import CartModal from './components/Modal/CartModal';
//custom model imports
import { User } from './models/User';
//custom context imports
import { useCartContext } from './context/CartContext';
//util imports
import 'dayjs/locale/en-sg';
import './App.css';

function App() {
  const { user, updateUser } = useCartContext();

  useEffect(() => {
    //Future implementation to check if cart exists when logged in
    updateUser(new User({}));
  }, []);

  return (
    <div className="appbody">
      <Navbar />
      <Routes>
        <Route path="/products" element={<ProductPage />}/>
        {user.id > 0 ? <Route path="/orders" element={<OrdersPage />}/> : <></>}
        {user.id > 0 ? <Route path="/metrics" element={<MetricPage />}/> : <></>}
        <Route path="*" element={<MainPage/>}/>
      </Routes>
      <LoginFormModal />
      <SignUpFormModal />
      <CartModal />
    </div>
  )
}

export default App
