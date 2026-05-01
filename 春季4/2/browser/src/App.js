import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
function App() {
  return (
    <div>
      <nav>
        <Link to="/one">1</Link>
        <Link to="/two">2</Link>
      </nav>

      <Routes>
        <Route path="/one" element={<A />} />
        <Route path="/two" element={<B />} />
      </Routes>
    </div>
  );
}
function A() { return <h1>快点</h1> }
function B() { return <h1>放假</h1> }

export default App;
