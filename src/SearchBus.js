import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the styles
import BusSeats from './BusSeats';

const SearchBus = () => {
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [selectedFromLocation, setSelectedFromLocation] = useState('');
  const [selectedToLocation, setSelectedToLocation] = useState('');
  const [busRoutes, setBusRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartureTiming, setSelectedDepartureTiming] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date()); // Use a Date object for react-datepicker
  const [showBusSeats, setShowBusSeats] = useState(false);
  const [correspondingRoute, setCorrespondingRoute] = useState(null);

  const getBusRoutes = async () => {
    try {
      const response = await axios.get('https://mjkr421.pythonanywhere.com/api/getroutes/');
      const data = response.data.rows;

      const uniqueFromLocations = Array.from(new Set(data.map((route) => route.from_location)));
      setFromLocations(uniqueFromLocations);

      setBusRoutes(data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getBusRoutes();
  }, []);

  const handleFromLocationChange = (selectedOption) => {
    setSelectedFromLocation(selectedOption.value);
    setSelectedToLocation('');
    setSelectedDepartureTiming('');
    setSelectedDate(new Date()); // Reset date when changing from location
    setShowBusSeats(false);

    const matchingToLocations = Array.from(
      new Set(
        busRoutes
          .filter((route) => route.from_location === selectedOption.value)
          .map((route) => route.to_location)
      )
    );
    setToLocations(matchingToLocations);
  };

  const handleToLocationChange = (selectedOption) => {
    setSelectedToLocation(selectedOption.value);
    setSelectedDepartureTiming('');
    setShowBusSeats(false);
  };

  const handleChangeDepartureTiming = (selectedOption) => {
    setSelectedDepartureTiming(selectedOption.value);

    const route = busRoutes.find(
      (route) =>
        route.from_location === selectedFromLocation &&
        route.to_location === selectedToLocation &&
        route.departure_timings.split(',').includes(selectedOption.value)
    );

    if (route) {
      setCorrespondingRoute(route);
    } else {
      setCorrespondingRoute(null);
    }

    setShowBusSeats(true);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Bus Booking Application</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error fetching bus routes: {error.message}</p>
      ) : (
        <>
          <div className="mb-3">
            <label htmlFor="fromLocationsDropdown" className="form-label">
              <h4>From Location</h4>
            </label>
            <Select
              id="fromLocationsDropdown"
              options={fromLocations.map((location) => ({ label: location, value: location }))}
              onChange={handleFromLocationChange}
              value={{ label: selectedFromLocation, value: selectedFromLocation }}
              isSearchable
              placeholder="Select a location"
              styles={{ // Custom styles to display the select value
                singleValue: (provided) => ({ ...provided, overflow: 'visible' }),
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="toLocationsDropdown" className="form-label">
              <h4>To Location</h4>
            </label>
            <Select
              id="toLocationsDropdown"
              options={toLocations.map((location) => ({ label: location, value: location }))}
              onChange={handleToLocationChange}
              value={{ label: selectedToLocation, value: selectedToLocation }}
              isSearchable
              placeholder="Select a location"
              styles={{ // Custom styles to display the select value
                singleValue: (provided) => ({ ...provided, overflow: 'visible' }),
              }}
            />
          </div>

          {selectedFromLocation && selectedToLocation && (
            <div>
              <div className="mb-3">
                <label htmlFor="departureDate" className="form-label">
                  <h4>Select Departure Date</h4>
                </label>
                <div>
                <DatePicker
                  id="departureDate"
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                />
                </div>
              </div>

              {selectedDate && (
                <div className="mb-3">
                  {/* <h3>
                    Departure Timings from {selectedFromLocation} to {selectedToLocation} on {selectedDate.toISOString().split('T')[0]}:
                  </h3> */}
                  <div className="mb-3">
                    <label htmlFor="departureTimingsDropdown" className="form-label">
                      <h4>Select a Departure Timing</h4>
                    </label>
                    <Select
                      id="departureTimingsDropdown"
                      options={
                        busRoutes
                          .filter(
                            (route) =>
                              route.from_location === selectedFromLocation &&
                              route.to_location === selectedToLocation
                          )
                          .reduce((timings, route) => {
                            const routeTimings = route.departure_timings.split(',');
                            timings.push(...routeTimings);
                            return timings;
                          }, [])
                          .map((time) => ({ label: time, value: time }))
                      }
                      onChange={handleChangeDepartureTiming}
                      value={correspondingRoute && { label: selectedDepartureTiming, value: selectedDepartureTiming }}
                      isSearchable
                      placeholder="Select a departure timing"
                      styles={{ // Custom styles to display the select value
                        singleValue: (provided) => ({ ...provided, overflow: 'visible' }),
                      }}
                    />
                  </div>

                  {showBusSeats && correspondingRoute && (
                    <BusSeats
                      slNo={correspondingRoute.sl_no}
                      fromLocation={selectedFromLocation}
                      toLocation={selectedToLocation}
                      date={selectedDate.toISOString().split('T')[0]}
                      departureTimings={correspondingRoute.departure_timings}
                      selectedDepartureTime={selectedDepartureTiming}
                      routeLength={correspondingRoute.route_length}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchBus;
