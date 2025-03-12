import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainPage from './pages/MainPage/MainPage'
import ProductPage from './pages/ProductPage/ProductPage'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Routes>
        <Route path="/products" element={<ProductPage />}/>
        <Route path="*" element={<MainPage/>}/>
      </Routes>
    </div>
  )
}

export default App
