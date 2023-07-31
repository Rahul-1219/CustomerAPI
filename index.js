import express from "express";
import bodyParser from "body-parser";
import customers from "./customers.js";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

function saveCustomersToFile(customersData) {
  const customersJSON = JSON.stringify(customersData, null, 2);
  fs.writeFileSync("customers.js", `export default ${customersJSON}`, "utf8");
}
// API to list customers with search and pagination
app.get("/api/customers", (req, res) => {
  const { first_name, last_name, city } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.page) || 10;

  let result = [...customers];

  if (first_name) {
    result = result.filter(
      (customer) =>
        customer.first_name.toLowerCase() === first_name.toLowerCase()
    );
  }
  if (last_name) {
    result = result.filter(
      (customer) => customer.last_name.toLowerCase() === last_name.toLowerCase()
    );
  }
  if (city) {
    result = result.filter(
      (customer) => customer.city.toLowerCase() === city.toLowerCase()
    );
  }

  if (page && limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    if (startIndex < 0) {
      return res.status(400).json({ message: "Invalid page value" });
    }
    if (endIndex > result.length) {
      return res.status(400).json({ message: "Invalid limit value" });
    }

    result = result.slice(startIndex, endIndex);
  }
  res.json(result);
});

// API to get a single customer by ID
app.get("/api/customers/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const customer = customers.find((customer) => customer.id === id);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: "Customer not found" });
  }
});

// API to list all unique cities with the number of customers from each city
app.get("/api/cities", (req, res) => {
  const citiesMap = {};
  customers.forEach((customer) => {
    citiesMap[customer.city] = (citiesMap[customer.city] || 0) + 1;
  });
  res.json(citiesMap);
});

// API to add a customer with validations
app.post("/api/customers", (req, res) => {
  const { id, first_name, last_name, city, company } = req.body;
  if (!id && !first_name && !last_name && !city && !company) {
    res.status(400).json({ message: "All fields are required" });
  }

  if (customers.some((customer) => customer.id === id)) {
    res
      .status(400)
      .json({ message: "Customer with the same ID already exists" });
  }

  if (
    !customers.some(
      (customer) => customer.city === city && customer.company === company
    )
  ) {
    res.status(400).json({
      message: "City or company does not exist for an existing customer",
    });
  } else {
    const newCustomer = { id, first_name, last_name, city, company };
    customers.push(newCustomer);
    saveCustomersToFile(customers);
    res.status(201).json(customers);
  }
});

// Optional: API to update customer resource's attributes
app.put("/api/customers/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = customers.findIndex((customer) => customer.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const { first_name, last_name, city, company } = req.body;

  customers[index] = {
    ...customers[index],
    first_name,
    last_name,
    city,
    company,
  };
  saveCustomersToFile(customers);
  res.json(customers[index]);
});

app.delete("/api/customers/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = customers.findIndex((customer) => customer.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Customer not found" });
  }

  customers.splice(index, 1);
  saveCustomersToFile(customers);
  res.status(200).json({ message: "Customer deleted successfully" });
});

app.listen(process.env.PORT || PORT, () => {
  console.log("Server is running on port 3000");
});
