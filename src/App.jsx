import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Colleges from './pages/Colleges'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/colleges' element={<Colleges/>}/>
          <Route path='/users' element={<h1>Users Page - Coming Soon</h1>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
