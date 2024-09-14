import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './BusSeats.css';
import Passengers from './Passengers';

// Seat Component
const Seat = ({ seatNumber, isSelected, isBooked, onClick }) => (
  <div
    className={`seat-card ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
    onClick={onClick}
  >
    {seatNumber}
  </div>
);

const BusSeats = ({ slNo, date, departureTimings, selectedDepartureTime, fromLocation, toLocation, routeLength }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [confirmedSeats, setConfirmedSeats] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);
  const [correspondingRoute] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slNo && date && selectedDepartureTime) {
          const response = await axios.get(
            `http://mjkr421.pythonanywhere.com/api/getseats/?sl_no=${slNo}&date=${date}&departure_timings=${selectedDepartureTime}`
          );
          const { seats } = response.data;

          const bookedSeatsFromAPI = seats.filter(
            (seat) => seat.sl_no === String(slNo) && seat.date === date && seat.departure_timings === selectedDepartureTime
          );
          const newSeats = bookedSeatsFromAPI.map((seat) => seat.selected_seats);

          setBookedSeats(bookedSeatsFromAPI);
          setSelectedSeats(newSeats);
        } else {
          setSelectedSeats([]);
          setBookedSeats([]);
        }
      } catch (error) {
        console.error('Error fetching seat data:', error);
      }
    };

    fetchData();
  }, [slNo, date, departureTimings, selectedDepartureTime, correspondingRoute]);

  const handleSeatClick = (seatNumber) => {
    if (slNo && date) {
      const isSeatSelected = selectedSeats.includes(seatNumber);
      const isSeatBooked = bookedSeats.some((bookedSeat) => bookedSeat.selected_seats === seatNumber);

      if (!isSeatBooked) {
        setSelectedSeats((prevSelectedSeats) =>
          isSeatSelected ? prevSelectedSeats.filter((seat) => seat !== seatNumber) : [...prevSelectedSeats, seatNumber]
        );
      }
    }
  };

  const generateSeatCards = (deck) => {
    const seatCards = [];
    const totalSeats = 18;
    const seatsPerRow = 6;
    const deckLabel = deck === 'upper' ? 'U' : 'L';

    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = `${deckLabel}${i}`;
      const isSeatBooked = bookedSeats.some((bookedSeat) => bookedSeat.selected_seats === seatNumber);

      seatCards.push(
        <Seat
          key={seatNumber}
          seatNumber={seatNumber}
          isSelected={selectedSeats.includes(seatNumber)}
          isBooked={isSeatBooked}
          onClick={() => handleSeatClick(seatNumber)}
        />
      );

      if (i % seatsPerRow === 0) {
        seatCards.push(<br key={`br-${i}`} />);
      }
    }

    return seatCards;
  };

  const handleConfirmClick = () => {
    const newlySelectedSeats = selectedSeats.filter((seat) => !bookedSeats.some((bookedSeat) => bookedSeat.selected_seats === seat));

    if (newlySelectedSeats.length > 0) {
      setConfirmedReservation({
        slNo: slNo,
        fromLocation: fromLocation,
        toLocation: toLocation,
        date: date,
        departureTime: selectedDepartureTime,
        selectedSeats: newlySelectedSeats.join(', '),
      });
      setConfirmedSeats(true);
    } else {
      console.log('No newly selected seats.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Bus Seats</h2>
      <div className="upper-deck">
        <h3>Upper Deck</h3>
        <div className="seat-container">{generateSeatCards('upper')}</div>
      </div>
      <div className="lower-deck">
        <h3>Lower Deck</h3>
        <div className="seat-container">{generateSeatCards('lower')}</div>
      </div>
      <div>
        <h3>Booked Seats</h3>
        {bookedSeats.length > 0 ? (
          <ul>
            <li>{bookedSeats.map((seat) => seat.selected_seats).join(', ')}</li>
          </ul>
        ) : (
          <p>No seats booked</p>
        )}
        <h3>Newly Selected Seats</h3>
        {selectedSeats.length > 0 ? (
          <ul>
            <li>{selectedSeats.filter((seat) => !bookedSeats.some((bookedSeat) => bookedSeat.selected_seats === seat)).join(', ')}</li>
          </ul>
        ) : (
          <p>No seats selected</p>
        )}
        <button onClick={handleConfirmClick} disabled={selectedSeats.length === 0} className="btn btn-primary">
          Confirm
        </button>
        {confirmedSeats && <Passengers {...confirmedReservation} time={selectedDepartureTime} routeLength={routeLength} />}
      </div>
    </div>
  );
};

BusSeats.propTypes = {
  slNo: PropTypes.number.isRequired,
  fromLocation: PropTypes.string.isRequired,
  toLocation: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  departureTimings: PropTypes.string.isRequired,
  selectedDepartureTime: PropTypes.string.isRequired,
  routeLength: PropTypes.string.isRequired,
};

export default BusSeats;
