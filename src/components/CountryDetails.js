// src/components/CountryDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CountryDetails = () => {
  const { countryCode } = useParams(); // Extract the countryCode from the URL
  const navigate = useNavigate(); // For navigation
  const [country, setCountry] = useState(null);
  const [borderingCountries, setBorderingCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the country details using the country code
  useEffect(() => {
    axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
      .then((response) => {
        const countryData = response.data[0];
        setCountry(countryData);

        // Fetch the bordering countries
        if (countryData.borders) {
          const borderRequests = countryData.borders.map((borderCode) =>
            axios.get(`https://restcountries.com/v3.1/alpha/${borderCode}`)
          );
          // Wait for all border country data requests to resolve
          Promise.all(borderRequests)
            .then((borderResponses) => {
              const borders = borderResponses.map((res) => res.data[0]);
              setBorderingCountries(borders);
            })
            .catch((error) => {
              setError('Failed to fetch bordering countries.');
            });
        }

        setLoading(false);
      })
      .catch((error) => {
        setError('Country details not found');
        setLoading(false);
      });
  }, [countryCode]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Country coordinates (latitude and longitude)
  const { latlng } = country;
  const [lat, lng] = latlng || [0, 0]; // Default to [0, 0] if no coordinates are available

  // Get additional details like currencies, timezones, etc.
  const currencies = country.currencies ? Object.values(country.currencies).map(currency => currency.name).join(", ") : 'N/A';
  const timezones = country.timezones ? country.timezones.join(", ") : 'N/A';
  const demonym = country.demonyms ? Object.values(country.demonyms).join(", ") : 'N/A';
  const gini = country.gini ? country.gini[0] : 'N/A'; // Some countries may not have a Gini coefficient

  return (
    <div>
      <button onClick={() => navigate('/')}>Back to List</button>

      {country && (
        <>
          <h1>{country.name.common}</h1>
          <img src={country.flags.svg} alt={country.name.common} width="200" />
          
          <div className="country-info">
            <h3>Capital: {country.capital ? country.capital[0] : 'N/A'}</h3>
            <p><strong>Region:</strong> {country.region}</p>
            <p><strong>Subregion:</strong> {country.subregion}</p>
            <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
            <p><strong>Area:</strong> {country.area} km²</p>
            <p><strong>Currency:</strong> {currencies}</p>
            <p><strong>Timezones:</strong> {timezones}</p>
            <p><strong>Demonym:</strong> {demonym}</p>
            <p><strong>Gini Index:</strong> {gini}</p>
          </div>

          {/* Map Display */}
          <h2>Location on the Map:</h2>
          <div style={{ width: '100%', height: '400px' }}>
            <MapContainer center={[lat, lng]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[lat, lng]} icon={new Icon({ iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Flag_of_the_United_Nations.svg', iconSize: [30, 30] })}>
                <Popup>
                  <b>{country.name.common}</b><br />
                  {country.capital ? `Capital: ${country.capital[0]}` : 'Capital: N/A'}
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Bordering Countries List */}
          {borderingCountries.length > 0 && (
            <>
              <h3>Bordering Countries:</h3>
              <ul>
                {borderingCountries.map((borderCountry) => (
                  <li key={borderCountry.cca3}>
                    <Link to={`/country/${borderCountry.cca3}`}>
                      {borderCountry.name.common}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CountryDetails;
