import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
//api imports
import * as userAPI from "./api/user-api";
//custom page imports
import MainPage from './pages/MainPage/MainPage';
import ProductPage from './pages/ProductPage/ProductPage';
import OrdersPage from './pages/OrderPage/OrderPage';
import MetricPage from './pages/MetricPage/MetricPage';
//custom component imports
import Navbar from './components/Navbar/Navbar';
import LoginFormModal from './components/User/LoginModal';
import SignUpFormModal from './components/User/SignupModal';
import CartModal from './components/Order/CartModal';
import MessageModal from './components/Message/MessageModal';
//model imports
import { User } from './models/User';
//context imports
import { useMainContext } from './context/MainContext';
//util imports
import 'dayjs/locale/en-sg';
import './App.css';

function App() {
    const { loadCart, user, updateUser } = useMainContext();

    //On init load, check if there is a user token, and if it is valid
    useEffect(() => {
        try {
            const checkExistingUser = async () => {
                const existingAuthToken = localStorage.getItem("auth-token"); //token will only be set on successful login
                if (existingAuthToken){
                    //Verify if token has expired
                    const response = await userAPI.getUser();
                    if (!response.error){
                        updateUser(new User(response[0])); //do not refresh token expiry
                    }
                } else {
                    updateUser(new User({}));
                }
            }
            checkExistingUser();
        } catch (error) {
            console.log(error);
        }
    }, []);

    //Load cart if any (localstorage for unlogged, api call for logged users)
    useEffect(() => {
        try {
            loadCart();
        } catch (error) {
            console.log(error);
        }
    }, [user]);

    return (
        <div className="appmain">
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
            <MessageModal />
        </div>
    )
}

export default App
