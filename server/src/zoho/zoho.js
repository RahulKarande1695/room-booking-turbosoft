import axios from "axios";

const env = process.env;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- access token (cached until expiry) ----------
let token = null;
let tokenExpiry = 0;

async function getToken() {
  if (token && Date.now() < tokenExpiry) return token;
  const { data } = await axios.post(`${env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`, null, {
    params: {
      grant_type: "refresh_token",
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      refresh_token: env.ZOHO_REFRESH_TOKEN,
    },
  });
   if (!data.access_token) throw new Error("Zoho token error: " + JSON.stringify(data));
  token = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return token;
}

// ---------- request with retry on 429 / 5xx ----------
export async function zohoRequest(config) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await axios({
        ...config,
        baseURL: env.ZOHO_API_BASE_URL,
        headers: { Authorization: `Zoho-oauthtoken ${await getToken()}` },
      });
    } catch (err) {
      const status = err.response?.status;
      if ((status === 429 || status >= 500) && attempt < 4) {
        const wait = 500 * 2 ** attempt;
        console.warn(`Zoho ${status}, retry in ${wait}ms`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}

// ---------- fetch ALL contacts (pagination) ----------
const toCustomer = (c) => ({
  id: c.id,
  name: [c.First_Name, c.Last_Name].filter(Boolean).join(" "),
  email: c.Email || null,
  company: c.Account_Name?.name || null,
});

async function fetchAllContacts() {
  const all = [];
  let page = 1;
  let more = true;
  while (more) {
    const res = await zohoRequest({
      url: "/crm/v6/Contacts",
      params: { fields: "First_Name,Last_Name,Email,Account_Name", per_page: 200, page },
    });
    if (res.status === 204) break; // no records
    all.push(...res.data.data.map(toCustomer));
    more = res.data.info.more_records;
    page++;
  }
  return all;
}

// ---------- cache ----------
const TTL = 5 * 60 * 1000;
let cache = { data: null, at: 0 };
let inflight = null;

export async function getCustomers() {
  if (cache.data && Date.now() - cache.at < TTL) return cache.data;

  inflight ??= fetchAllContacts().finally(() => (inflight = null));
  try {
    cache = { data: await inflight, at: Date.now() };
  } catch (err) {
    if (!cache.data) throw err;
    console.warn("CRM failed, serving stale cache:", err.message);
    cache.at = Date.now() - TTL + 30_000;
  }
  return cache.data;
}

// ---------- customer exists? (cache first, then CRM directly) ----------
export async function customerExists(id) {
  const list = await getCustomers().catch(() => []);
  if (list.some((c) => c.id === id)) return true;
  try {
    const res = await zohoRequest({ url: `/crm/v6/Contacts/${id}` });
    return res.status === 200;
  } catch (err) {
    if ([400, 404].includes(err.response?.status)) return false;
    throw err;
  }
}