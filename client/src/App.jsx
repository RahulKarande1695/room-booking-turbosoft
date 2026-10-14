import { useState } from "react";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <h1>Room Booking</h1>
      <BookingForm onBooked={() => setRefreshKey((k) => k + 1)} />
      <BookingList refreshKey={refreshKey} />
    </div>
  );
}