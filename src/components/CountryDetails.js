import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CountryDetails.css';

const CountryDetails = () => {
  const { countryCode } = useParams();
  const navigate = useNavigate();
  const [country, setCountry] = useState(null);
  const [borderingCountries, setBorderingCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);  // To toggle between edit and view mode
  const [editFormData, setEditFormData] = useState({
    capital: '',
    population: '',
    area: '',
    currency: '',
    flag: '', // New field for flag URL or base64 data
  });

  useEffect(() => {
    axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
      .then((response) => {
        const countryData = response.data[0];
        setCountry(countryData);
        setEditFormData({
          capital: countryData.capital ? countryData.capital[0] : '',
          population: countryData.population,
          area: countryData.area,
          currency: countryData.currencies ? Object.values(countryData.currencies).map(currency => currency.name).join(", ") : 'N/A',
          flag: countryData.flags.svg, // Default flag URL
        });

        if (countryData.borders) {
          const borderRequests = countryData.borders.map((borderCode) =>
            axios.get(`https://restcountries.com/v3.1/alpha/${borderCode}`)
          );
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFlagChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({
          ...editFormData,
          flag: reader.result, // Use base64 encoding for the uploaded image
        });
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can perform a PUT or PATCH request to update the country's data
    // For now, we'll just log the data
    console.log('Updated Country Data:', editFormData);

    // After submission, switch back to view mode
    setIsEditing(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const { latlng } = country;
  const [lat, lng] = latlng || [0, 0]; 

  const markerIcon = new Icon({
    iconUrl: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div>
      <button onClick={() => navigate('/')}>Back to List</button>

      {country && (
        <>
          <h1>{country.name.common}</h1>
          
          {isEditing ? (
            <div>
              <label>Flag:</label>
              {editFormData.flag && !editFormData.flag.startsWith('data:') ? (
                <img src={editFormData.flag} alt="Current Flag" width="200" />
              ) : (
                <img src={editFormData.flag} alt="Current Flag" width="200" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFlagChange}
              />
            </div>
          ) : (
            <div>
              <img src={country.flags.svg} alt={country.name.common} width="200" />
            </div>
          )}

          <div className="country-info">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Capital:</label>
                  <input
                    type="text"
                    name="capital"
                    value={editFormData.capital}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Population:</label>
                  <input
                    type="number"
                    name="population"
                    value={editFormData.population}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Area (in km²):</label>
                  <input
                    type="number"
                    name="area"
                    value={editFormData.area}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Currency:</label>
                  <input
                    type="text"
                    name="currency"
                    value={editFormData.currency}
                    onChange={handleChange}
                  />
                </div>
                <button type="submit">Save</button>
                <button type="button" onClick={handleEditToggle}>Cancel</button>
              </form>
            ) : (
              <>
                <h3>Capital: {country.capital ? country.capital[0] : 'N/A'}</h3>
                <p><strong>Region:</strong> {country.region}</p>
                <p><strong>Subregion:</strong> {country.subregion}</p>
                <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
                <p><strong>Area:</strong> {country.area} km²</p>
                <p><strong>Currency:</strong> {editFormData.currency}</p>
                <p><strong>Timezones:</strong> {country.timezones ? country.timezones.join(", ") : 'N/A'}</p>
                {/* <p><strong>Demonym:</strong> {country.demonyms ? Object.values(country.demonyms).join(", ") : 'N/A'}</p> */}
                {/* <p><strong>Gini Index:</strong> {country.gini ? country.gini[0] : 'N/A'}</p> */}

                <button onClick={handleEditToggle}>Edit</button>
              </>
            )}
          </div>

          <h2>Location on the Map:</h2>
          <div style={{ width: '100%', height: '400px' }}>
            <MapContainer center={[lat, lng]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[lat, lng]} icon={markerIcon}>
                <Popup>
                  <b>{country.name.common}</b><br />
                  {country.capital ? `Capital: ${country.capital[0]}` : 'Capital: N/A'}
                </Popup>
              </Marker>
            </MapContainer>
          </div>

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
