import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

function ComingSoon() {
  return (
    <main className="pt-24 flex-1 flex items-center justify-center">
      <div className="text-center space-y-4 py-32">
        <h1 className="text-4xl font-black text-[#191b23]">În curând</h1>
        <p className="text-[#424654]">Această pagină este în curs de dezvoltare.</p>
      </div>
    </main>
  );
}

export default App;
