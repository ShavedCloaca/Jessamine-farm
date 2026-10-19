const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse incoming JSON data from your contact form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure your SMTP email server details using Environment Variables (for GitOps secrets)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // Your email username
    pass: process.env.SMTP_PASS  // Your email password or app password
  }
});

// 1. THIS IS THE MAGIC LINE FOR YOUR HTML/CSS
// It tells Express: "Take everything in the 'public' folder and serve it exactly as it is"
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.xml')) {
      res.setHeader('Content-Type', 'application/xml');
    }
  }
}));
// 2. Kubernetes Health Probe Endpoint
// k3s will ping this every few seconds to make sure your app hasn't crashed
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 3. Contact Form Endpoint (Backend Logic)
// When your HTML form submits via POST, it hits this route
app.post('/api/contact', async (req, res) => {
  // Pulling the exact fields sent by your frontend JavaScript
  const { fname, lname, email, phone, staytype, message } = req.body;
  console.log('New contact form submission:', { fname, lname, email, phone, staytype, message });

  try {
    // Send the email using the configured transporter
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Jessamine Farm Website" <noreply@jessaminefarm.co.uk>', 
      to: 'contact@jessaminefarm.co.uk',
      replyTo: email, // Sets the customer's email as the reply-to address
      subject: `New Website Inquiry from ${fname} ${lname}`,
      text: `
        You have received a new contact form submission:
        
        Name: ${fname} ${lname}
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        Stay Type: ${staytype}
        Message: ${message || 'No message provided'}
      `,
    });

    res.status(200).json({ success: true, message: 'Message received and email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
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