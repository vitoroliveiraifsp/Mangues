import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { SyncStatus } from './components/SyncStatus';
import { HomePage } from './pages/HomePage';
import { BiodiversidadePage } from './pages/BiodiversidadePage';
import { EstruturaPage } from './pages/EstruturaPage';
import { AmeacasPage } from './pages/AmeacasPage';
import { JogoDaMemoria } from './pages/JogoDaMemoria';
import { JogoConexoes } from './pages/JogoConexoes';
import { ContatoFuncionalPage } from './pages/ContatoFuncionalPage';
import { QuizPage } from './pages/QuizPage';
import { RankingPage } from './pages/RankingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MultiplayerPage } from './pages/MultiplayerPage';
import { VideoLibraryPage } from './pages/VideoLibraryPage';
import { GamificationPage } from './pages/GamificationPage';
import { MetricsPanel } from './components/Dashboard/MetricsPanel';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <SyncStatus />
          <PWAInstallPrompt />
          <MetricsPanel />
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Página Vida/Biodiversidade */}
            <Route path="/biodiversidade" element={<BiodiversidadePage />} />

            {/* Página Estrutura */}
            <Route path="/estrutura" element={<EstruturaPage />} />

            {/* Página Cuidados/Ameaças */}
            <Route path="/ameacas" element={<AmeacasPage />} />

            {/* Páginas de Jogos */}
            <Route path="/jogo-da-memoria" element={<JogoDaMemoria />} />
            <Route path="/jogo-conexoes" element={<JogoConexoes />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/multiplayer" element={<MultiplayerPage />} />

            {/* Novas páginas v2.2 */}
            <Route path="/videos" element={<VideoLibraryPage />} />
            <Route path="/gamificacao" element={<GamificationPage />} />
            {/* Página Analytics (Admin only) */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            {/* Página Contatos */}
            <Route path="/contatos" element={<ContatoFuncionalPage />} />

            {/* Rota 404 - redireciona para home se página não encontrada */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;