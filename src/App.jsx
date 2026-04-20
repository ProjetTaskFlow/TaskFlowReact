import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './components/Dashboard.jsx'
import Project from './pages/Project.jsx'
import Kanban from './pages/Kanban.jsx'


function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}  />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project" element={<Project />} />
          <Route path="/kanban" elemnt={<Kanban />} />
        </Routes>
      </BrowserRouter>
  )
}
export default App