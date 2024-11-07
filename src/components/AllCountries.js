// src/components/CountryList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CountryList = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('name'); // Default sort by name
  const [ascending, setAscending] = useState(true); // Ascending order

  // Fetch data on component mount
  useEffect(() => {
    axios.get('https://restcountries.com/v3.1/all')
      .then((response) => {
        setCountries(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Something went wrong while fetching countries.');
        setLoading(false);
      });
  }, []);

  // Sort the countries based on the selected sort order (name or population)
  const sortCountries = () => {
    const sortedCountries = [...countries];
    if (sortOrder === 'name') {
      sortedCountries.sort((a, b) => {
        const nameA = a.name.common.toLowerCase();
        const nameB = b.name.common.toLowerCase();
        if (nameA < nameB) return ascending ? -1 : 1;
        if (nameA > nameB) return ascending ? 1 : -1;
        return 0;
      });
    } else if (sortOrder === 'population') {
      sortedCountries.sort((a, b) => {
        if (a.population < b.population) return ascending ? -1 : 1;
        if (a.population > b.population) return ascending ? 1 : -1;
        return 0;
      });
    }
    return sortedCountries;
  };

  // Handle sorting changes
  const handleSortChange = (sortBy) => {
    if (sortBy === sortOrder) {
      // Toggle the order if the same sorting criterion is selected
      setAscending(!ascending);
    } else {
      setSortOrder(sortBy);
      setAscending(true); // Default to ascending order
    }
  };

  // Handle country deletion
  const handleDelete = (countryCode) => {
    // Filter out the country with the given countryCode from the list
    const updatedCountries = countries.filter((country) => country.cca3 !== countryCode);
    setCountries(updatedCountries);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const sortedCountries = sortCountries();

  return (
    <div>
      <h1>List of Countries</h1>

      <div className="sort-controls">
        <button onClick={() => handleSortChange('name')}>
          Sort by Name {sortOrder === 'name' ? (ascending ? '↑' : '↓') : ''}
        </button>
        <button onClick={() => handleSortChange('population')}>
          Sort by Population {sortOrder === 'population' ? (ascending ? '↑' : '↓') : ''}
        </button>
      </div>

      <ul>
        {sortedCountries.map((country) => (
          <li key={country.cca3}>
            <div className="country-item">
              <Link to={`/country/${country.cca3}`}>
                <img src={country.flags.svg} alt={country.name.common} width="50" />
                <h2>{country.name.common}</h2>
                <p>Population: {country.population.toLocaleString()}</p>
              </Link>
              <button onClick={() => handleDelete(country.cca3)} className="delete-button">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CountryList;
