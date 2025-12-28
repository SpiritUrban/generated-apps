import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './screens/Home';
import { TestRunner } from './screens/TestRunner';
import { Results } from './screens/Results';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestRunner />} />
        <Route path="/results" element={<Results />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
