import { getCustomers } from "../zoho/zoho.js";

export const listCustomers = async (req, res) => {
  const list = await getCustomers();
  const q = req.query.search?.toLowerCase();
  res.json(
    q
      ? list.filter((c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
      : list
  );
};