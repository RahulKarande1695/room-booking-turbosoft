import "dotenv/config";
import { zohoRequest } from "../zoho/zoho.js";

const contacts = [
  { First_Name: "Rahul", Last_Name: "Karande", Email: "Rahul.karande@example.com", Account_Name: { name: "Acme" } },
  { First_Name: "Tusahr", Last_Name: "Karande", Email: "Tusahr.karande@example.com", Account_Name: { name: "Globex" } },
  { First_Name: "Rohan", Last_Name: "Karande", Email: "rohan.karande@example.com", Account_Name: { name: "Initech" } },
  { First_Name: "Aniket", Last_Name: "Karande", Email: "sneha.karande@example.com", Account_Name: { name: "Umbrella" } },
  { First_Name: "Ketan", Last_Name: "Karande", Email: "vikram.karande@example.com", Account_Name: { name: "Hooli" } },
];

const res = await zohoRequest({ method: "post", url: "/crm/v6/Contacts", data: { data: contacts } });
console.log(JSON.stringify(res.data.data, null, 2));