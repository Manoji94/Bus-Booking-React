import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cancellation = () => {
  const [bookedSeats, setBookedSeats] = useState([]);
  const [searchTicketNumber, setSearchTicketNumber] = useState('');
  const [filteredSeats, setFilteredSeats] = useState([]);
  const [dataFetched, setDataFetched] = useState(false); // Track whether data has been fetched
  const [searchError, setSearchError] = useState(''); // Track search error
  const [cancellationMessage, setCancellationMessage] = useState(''); // Track cancellation message

  const fetchData = async () => {
    try {
      const response = await axios.get('http://mjkr421.pythonanywhere.com/api/getseats/');
      setBookedSeats(response.data.seats);
      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Fetch data only when searchTicketNumber is not empty and data has not been fetched yet
    if (searchTicketNumber && !dataFetched) {
      fetchData();
    }
  }, [searchTicketNumber, dataFetched]);

  const handleSearch = () => {
    // Trigger filtering when the search button is clicked
    const filtered = bookedSeats.filter(seat => seat.ticket_number === searchTicketNumber);
    setFilteredSeats(filtered);
    setSearchError(filtered.length === 0 ? 'No matching records found.' : ''); // Set error message
  };

  const handleCancellation = async (ticketNumber) => {
    // Show confirmation dialog
    const confirmCancellation = window.confirm('Are you sure you want to cancel this ticket?');

    if (confirmCancellation) {
      try {
        // Make a DELETE request to the API endpoint for deleting a seat
        await axios.delete(`http://mjkr421.pythonanywhere.com/api/deleteseat/${ticketNumber}/`);
        // Refetch data after cancellation
        fetchData();
        // Show cancellation message
        setCancellationMessage('Your ticket has been cancelled successfully.');
        // Clear filtered seats to hide the details
        setFilteredSeats([]);
      } catch (error) {
        console.error('Error cancelling ticket:', error);
        setCancellationMessage('Error cancelling ticket. Please try again.');
      }
    }
  };

  return (
    <div className="container mt-4">
      <h1>Booked Seats</h1>
      <div className="mb-3">
        <label htmlFor="ticketNumber" className="form-label">Search by Ticket Number:</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            id="ticketNumber"
            value={searchTicketNumber}
            onChange={(e) => setSearchTicketNumber(e.target.value)}
          />
          <button className="btn btn-primary" type="button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {searchError && <div className="alert alert-danger">{searchError}</div>}
      {cancellationMessage && <div className="alert alert-success">{cancellationMessage}</div>}

      {/* Conditionally render based on whether cancellation message is shown */}
      {filteredSeats.length > 0 && cancellationMessage === '' && (
        <div>
          {filteredSeats.map((passenger) => (
            <div className="card text-center mb-4" key={passenger.no}>
            <div className="card-body" id={`card-body-${passenger.no}`}>
              <div className="row">
                <div className="col-12 bg-light">
                  Ticket Number: <strong>{passenger.ticket_number}</strong>
                </div>
                <div className="col-12">
                  Bus Number: <strong>{passenger.sl_no}</strong>
                </div>
                <div className="col-6">
                  From Location: <strong>{passenger.from_location}</strong>
                </div>
                <div className="col-6">
                  To Location: <strong>{passenger.to_location}</strong>
                </div>
              </div>
              <div className="row">
          <div className="col-4">
            Date: <strong>{passenger.date}</strong>
          </div>
          <div className="col-4">
            Time: <strong>{passenger.departure_timings}</strong>
          </div>
          <div className="col-4">
            Selected Seat: <strong>{passenger.selected_seats}</strong>
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            Name: <strong>{passenger.passenger_name}</strong>
          </div>
          <div className="col-4">
            Age: <strong>{passenger.passenger_age}</strong>
          </div>
          <div className="col-4">
            Gender: <strong>{passenger.passenger_gender}</strong>
          </div>
          <div className="col-12">
            Mobile Number: <strong>{passenger.passenger_mobile_number}</strong>
          </div>
          <div className="col-12">
            Ticket Price: <strong>{passenger.ticket_price}</strong>
          </div>
            </div>
            </div>
<button
  className="btn btn-danger"
  onClick={() => handleCancellation(passenger.ticket_number)}>
  Ticket Cancellation
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cancellation;
