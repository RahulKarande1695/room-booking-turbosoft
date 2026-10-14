const [roomId, customerId] = process.argv.slice(2);
const url = "http://localhost:5000/bookings";

const post = (purpose, headers = {}) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      customerId,
      roomId,
      start: "2026-10-20T10:00:00Z",
      end: "2026-10-20T11:00:00Z",
      purpose,
    }),
  }).then(async (r) => ({ status: r.status, id: (await r.json())._id }));

console.log("race:", (await Promise.all([1, 2, 3, 4, 5].map((i) => post(`race ${i}`, { "Idempotency-Key": `race-${i}` })))).map((r) => r.status));

const dbl = await Promise.all([1, 2, 3].map(() => post("double click", { "Idempotency-Key": "dbl-1" })));
console.log("double click:", dbl);