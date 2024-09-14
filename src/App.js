import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchBus from './SearchBus';
import Cancellation from './Cancellation';

const App = () => {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Ticket Booking
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/cancellation" className="nav-link">
                Ticket Cancellation
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<SearchBus />} />
        <Route path="/cancellation" element={<Cancellation />} />
      </Routes>
    </Router>
  );
};

export default App;
