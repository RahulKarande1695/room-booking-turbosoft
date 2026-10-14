import "dotenv/config";

const res = await fetch(
  `${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/token?` +
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      code: process.argv[2],
    }),
  { method: "POST" }
);
const data = await res.json();

if (data.refresh_token) {
  console.log("REFRESH TOKEN (ha .env madhe paste kar):");
  console.log(data.refresh_token);
} else {
  console.log("Refresh token nahi milala:", data);
}