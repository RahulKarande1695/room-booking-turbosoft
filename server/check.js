import "dotenv/config";

const e = process.env;
console.log("client_id:", e.ZOHO_CLIENT_ID.slice(0, 14) + "...");

const res = await fetch(
  `${e.ZOHO_ACCOUNTS_URL}/oauth/v2/token?` +
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: e.ZOHO_CLIENT_ID,
      client_secret: e.ZOHO_CLIENT_SECRET,
      refresh_token: e.ZOHO_REFRESH_TOKEN,
    }),
  { method: "POST" }
);
const data = await res.json();
console.log(data.access_token ? "TOKEN OK, scope: " + data.scope : data);