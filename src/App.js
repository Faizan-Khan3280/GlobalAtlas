// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CountryList from './components/AllCountries';
import CountryDetails from './components/CountryDetails';

const App = () => {
  return (
    <Router>
      <div className="App">
        <h1>Welcome to the Global Atlas</h1>
        <Routes>
          <Route path="/" element={<CountryList />} />
          <Route path="/country/:countryCode" element={<CountryDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
