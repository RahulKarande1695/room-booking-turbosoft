import { useEffect, useState } from "react";
import { api } from "../api";

export default function BookingForm({ onBooked }) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState(60);
  const [purpose, setPurpose] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const searchCustomers = async () => {
    const list = await api(`/customers?search=${encodeURIComponent(search)}`);
    setCustomers(list);
    setCustomerId(list[0]?.id || "");
  };

  const loadSlots = async () => {
    if (!roomId || !date) return;
    const { free } = await api(`/rooms/${roomId}/availability?date=${date}`);
    setSlots(free);
    setStart(free[0]?.start || "");
  };

  useEffect(() => {
    searchCustomers();
    api("/rooms").then((list) => {
      setRooms(list);
      setRoomId(list[0]?._id || "");
    });
  }, []);

  useEffect(() => {
    loadSlots();
  }, [roomId, date]);

  const book = async () => {
    setLoading(true);
    try {
      const startDate = new Date(start);
      const endDate = new Date(startDate.getTime() + duration * 60000);
      const booking = await api("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          customerId,
          roomId,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          purpose,
        }),
      });
      setMsg("Booked: " + booking._id);
      onBooked();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setLoading(false);
    loadSlots();
  };

  return (
    <div>
      <h2>1. Customer</h2>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name or email" />
      <button onClick={searchCustomers}>Search</button>
      <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.email}) - {c.company}
          </option>
        ))}
      </select>

      <h2>2. Room, date, slot</h2>
      <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
        {rooms.map((r) => (
          <option key={r._id} value={r._id}>
            {r.name} ({r.capacity}, {r.location})
          </option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <select value={start} onChange={(e) => setStart(e.target.value)}>
        {slots.map((s) => (
          <option key={s.start} value={s.start}>
            {s.start.slice(11, 16)} UTC
          </option>
        ))}
      </select>
      <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
        <option value={15}>15 min</option>
        <option value={30}>30 min</option>
        <option value={60}>60 min</option>
      </select>

      <h2>3. Book</h2>
      <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="purpose" />
      <button onClick={book} disabled={loading || !start || !customerId}>
        Book
      </button>
      <p>{msg}</p>
    </div>
  );
}