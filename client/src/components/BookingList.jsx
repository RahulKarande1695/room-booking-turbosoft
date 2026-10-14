import { useEffect, useState } from "react";
import { api } from "../api";

export default function BookingList({ refreshKey }) {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    Promise.all([api("/bookings"), api("/rooms"), api("/customers")]).then(([b, r, c]) => {
      setBookings(b);
      setRooms(r);
      setCustomers(c);
    });
  }, [refreshKey]);

  const roomName = (id) => rooms.find((r) => r._id === id)?.name || id;
  const customerName = (id) => customers.find((c) => c.id === id)?.name || id;

  return (
    <div>
      <h2>Bookings</h2>
      <ul>
        {bookings.map((b) => (
          <li key={b._id}>
            {roomName(b.roomId)} | {customerName(b.customerId)} | {b.start} to {b.end} | {b.purpose}
          </li>
        ))}
      </ul>
    </div>
  );
}