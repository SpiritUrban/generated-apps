import { NavLink, Route, Routes } from "react-router-dom";
import Today from "./screens/Today";
import AddEntry from "./screens/AddEntry";
import Search from "./screens/Search";

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-title">STRAT-J</div>
          <div className="brand-sub">personal strategic journal</div>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Today
          </NavLink>
          <NavLink to="/search">Search</NavLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/add" element={<AddEntry />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
    </div>
  );
}
