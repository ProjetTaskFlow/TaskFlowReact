import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import Header from './components/Header.jsx';
import Project from './pages/Project.jsx';
import Kanban from './components/Kanban.jsx';
import Settings from './pages/Settings.jsx';
import KanbanDemo from './pages/KanbanDemo.jsx';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<><Header/><Home/></>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/projects" element={<Project/>}/>
                    <Route path="/settings" element={<Settings />}/>
                    <Route path="/demokanban" element={<KanbanDemo/>}/>
                    <Route path="/projects/:id/board" element={<Kanban/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
export default App;