import { Navigate, Route, Routes } from 'react-router-dom';
import Gallery from './pages/Gallery';

export default function App() {
  return (
    <Routes>
      {/* Until the app shell exists, the home address opens the gallery. */}
      <Route path="/" element={<Navigate to="/gallery" replace />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="*" element={<Navigate to="/gallery" replace />} />
    </Routes>
  );
}
