import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import CadastroPage from './pages/CadastroPage'
import BipagemPage from './pages/BipagemPage'
import HistoricoPage from './pages/HistoricoPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/bipagem" element={<BipagemPage />} />
        <Route path="/historico" element={<HistoricoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
