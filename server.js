const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse incoming JSON data from your future contact form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. THIS IS THE MAGIC LINE FOR YOUR HTML/CSS
// It tells Express: "Take everything in the 'public' folder and serve it exactly as it is"
app.use(express.static(path.join(__dirname, 'public')));

// 2. Kubernetes Health Probe Endpoint
// k3s will ping this every few seconds to make sure your app hasn't crashed
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 3. Contact Form Endpoint (Backend Logic)
// When your HTML form submits via POST, it hits this route
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('New contact form submission:', { name, email, message });

  // Later, we will add the code here to actually send the email using the encrypted GitOps secrets
  res.status(200).json({ success: true, message: 'Message received by Node backend!' });
});

// 4. Default Fallback
// If a user goes to a weird URL that doesn't exist, just send them back to the homepage
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Jessamine Farm web server running on port ${PORT}`);
});