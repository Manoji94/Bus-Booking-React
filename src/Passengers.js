import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Tickets from './Tickets';

const Passengers = ({ slNo, fromLocation, toLocation, date, time, selectedSeats, routeLength }) => {
  const [passengerForms, setPassengerForms] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(0);

  useEffect(() => {
    const seatsArray = selectedSeats.split(',').map((seat) => seat.trim());
    const initialForms = seatsArray.reduce((acc, seat) => {
      const seatForms = Array.from({ length: 1 }, () => createPassengerForm());
      return [...acc, ...seatForms];
    }, []);
    setPassengerForms(initialForms);
    // Calculate and set the initial ticket price
    setTicketPrice(2 * parseFloat(routeLength));
  }, [selectedSeats, routeLength]);

  function createPassengerForm() {
    return {
      name: '',
      age: '',
      gender: '',
      mobileNumber: '',
    };
  }

  const generateTicketNumber = (seat) => {
    // Remove whitespaces and pad single-digit seat numbers with a leading '0'
    const cleanedSeat = seat.trim().length === 2 ? `0${seat.trim()}` : seat.trim();

    // Combine components to form the ticket number
    const formattedDate = date.replace(/-/g, '');
    const formattedTime = time.replace(/\./g, '');
    const ticketNumber = `${slNo}${formattedDate}${formattedTime}${cleanedSeat}`;

    // Replace 'L' with '0' and 'U' with '1', then remove whitespaces
    const cleanedTicketNumber = ticketNumber.replace(/L/g, '0').replace(/U/g, '1').replace(/\s/g, '');

    return cleanedTicketNumber;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Calculate ticket price inside the form submit handler
      const currentTicketPrice = 2 * parseFloat(routeLength);

      // Prepare an array of requests to save each form in a separate row
      const requests = passengerForms.map((form, index) => {
        const { name, age, gender, mobileNumber } = form;

        const ticketNumber = generateTicketNumber(selectedSeats.split(',').map((seat) => seat.trim())[index]);

        console.log(`Submitting form for seat ${selectedSeats.split(',').map((seat) => seat.trim())[index]} with ticket number ${ticketNumber}`);

        return axios.post('http://mjkr421.pythonanywhere.com/api/reserveseats/', {
          sl_no: slNo,
          date: date,
          departure_timings: time,
          selected_seats: selectedSeats.split(',').map((seat) => seat.trim())[index],
          passenger_name: name,
          passenger_age: age,
          passenger_gender: gender,
          passenger_mobile_number: mobileNumber,
          ticket_price: currentTicketPrice, // Use the currentTicketPrice
          ticket_number: ticketNumber,
          from_location: fromLocation, // Add fromLocation
          to_location: toLocation,     // Add toLocation
        });
      });

      // Execute the requests
      await Promise.all(requests);

      // Set confirmed to true upon successful form submission
      setConfirmed(true);
    } catch (error) {
      console.error('Error submitting forms:', error);
      // Handle error, e.g., show an error message to the user
    }
  };

  const updatePassengerForm = (index, field, value) => {
    setPassengerForms((prevForms) => {
      const newForms = [...prevForms];
      newForms[index][field] = value;
      return newForms;
    });
  };

  return (
    <div className="container mt-4">
      <h2>Passenger Information</h2>
      <table className="table">
      <tbody>
        <tr>
          <th>From Location:</th>
          <td>{fromLocation}</td>
          <th>To Location:</th>
          <td>{toLocation}</td>
        </tr>
        <tr>
          <th>Date:</th>
          <td>{date}</td>
          <th>Time:</th>
          <td>{time}</td>
        </tr>
        <tr>
          <th>Bus Number:</th>
          <td>{slNo}</td>
          <th>Route Length:</th>
          <td>{routeLength}</td>
        </tr>
        <tr>
          <th>Ticket Price Per Seat (INR):</th>
          <td>{ticketPrice}</td>
          <th>Total Price (INR):</th>
          <td>{ticketPrice * passengerForms.length}</td>
        </tr>
        <tr>
          <th>Selected Seats:</th>
          <td colSpan="3">{selectedSeats}</td>
        </tr>
      </tbody>
    </table>

      <form onSubmit={handleFormSubmit}>
        <table className="table">
          <thead>
            <tr className="text-center">
              <th>Ticket Number</th>
              <th>Seat</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Mobile Number</th>
            </tr>
          </thead>
          <tbody>
            {passengerForms.map((form, index) => (
              <tr key={index}>
                <td>{generateTicketNumber(selectedSeats.split(',').map((seat) => seat.trim())[index])}</td>
                <td>{selectedSeats.split(',').map((seat) => seat.trim())[index]}</td>
                <td>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updatePassengerForm(index, 'name', e.target.value)}
                    className="form-control"
                  />
                </td>
                <td style={{ width: '100px' }}>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => updatePassengerForm(index, 'age', e.target.value)}
                    className="form-control"
                  />
                </td>
                <td>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      value="male"
                      checked={form.gender === 'male'}
                      onChange={() => updatePassengerForm(index, 'gender', 'male')}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Male</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      value="female"
                      checked={form.gender === 'female'}
                      onChange={() => updatePassengerForm(index, 'gender', 'female')}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Female</label>
                  </div>
                </td>
                <td>
                  <input
                    type="tel"
                    value={form.mobileNumber}
                    onChange={(e) => updatePassengerForm(index, 'mobileNumber', e.target.value)}
                    className="form-control"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>

{confirmed && (
  <div>
    <h2>Confirmation Successful</h2>
    <p>Your reservation has been confirmed. Thank you!</p>
    <Tickets
      slNo={slNo}
      fromLocation={fromLocation}
      toLocation={toLocation}
      date={date}
      time={time}
      selectedSeats={selectedSeats}
      ticketNumbers={passengerForms.map((form, index) =>
        generateTicketNumber(selectedSeats.split(',').map((seat) => seat.trim())[index])
      )}
    />
  </div>
)}

    </div>
  );
};

Passengers.propTypes = {
  slNo: PropTypes.number.isRequired,
  fromLocation: PropTypes.string.isRequired,
  toLocation: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  selectedSeats: PropTypes.string.isRequired,
  routeLength: PropTypes.number.isRequired,
};

export default Passengers;
