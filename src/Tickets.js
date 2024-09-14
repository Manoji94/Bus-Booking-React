import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import html2canvas from 'html2canvas';

const Tickets = ({ ticketNumbers }) => {
  const [passengerDetails, setPassengerDetails] = useState([]);

  useEffect(() => {
    const fetchPassengerDetails = async () => {
      try {
        // Fetch all records for now
        const response = await axios.get('http://mjkr421.pythonanywhere.com/api/getseats/');
        const allPassengerDetails = response.data.seats;

        // Filter records based on provided ticketNumbers
        const filteredPassengerDetails = allPassengerDetails.filter((passenger) =>
          ticketNumbers.includes(passenger.ticket_number)
        );

        setPassengerDetails(filteredPassengerDetails);
      } catch (error) {
        console.error('Error fetching passenger details:', error);
      }
    };

    // Fetch details only if there are ticketNumbers provided
    if (ticketNumbers.length > 0) {
      fetchPassengerDetails();
    }
  }, [ticketNumbers]);

  const handleSave = (passengerNo) => {
    const cardBody = document.getElementById(`card-body-${passengerNo}`);

    if (cardBody) {
      html2canvas(cardBody).then((canvas) => {
        const dataURL = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `ticket-${passengerNo}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  };

  return (
    <div className="container mt-4">
      {passengerDetails.map((passenger) => (
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
          <button className="btn btn-primary" onClick={() => handleSave(passenger.no)}>
            Save as Image
          </button>
        </div>
      ))}
    </div>
  );
};

Tickets.propTypes = {
  ticketNumbers: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Tickets;
