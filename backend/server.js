require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Helper to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { enquiries: [], packages: [], settings: { whatsapp: '37493964458', adminEmail: 'athulk8182004@gmail.com' } };
    }
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

let transporter;
const setupTransporter = (email, pass) => {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: pass
        }
    });
};

// Initialize transporter with current settings and env
const currentData = readData();
setupTransporter(currentData.settings.adminEmail, process.env.GMAIL_APP_PASSWORD || '');


app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ----- PUBLIC ROUTES -----

// Get public data (packages and public settings)
app.get('/api/public-data', (req, res) => {
    const data = readData();
    res.json({
        packages: data.packages,
        whatsapp: data.settings.whatsapp
    });
});

// Submit Enquiry
app.post('/api/enquiry', async (req, res) => {
    const { service, name, email, phone, details } = req.body;
    
    // Save to database
    const data = readData();
    const newEnquiry = { id: Date.now(), date: new Date().toISOString(), service, name, email, phone, details };
    data.enquiries.unshift(newEnquiry); // Add to beginning
    writeData(data);
    
    // Send email
    const mailOptions = {
        from: data.settings.adminEmail,
        to: data.settings.adminEmail,
        subject: `New Enquiry: ${service}`,
        text: `You have received a new enquiry from the website!\n\nService: ${service}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${details}`
    };

    try {
        if (transporter) await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Enquiry saved and email sent!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(200).json({ success: true, warning: 'Enquiry saved, but email failed.' });
    }
});


// ----- ADMIN ROUTES -----

// Get all data
app.get('/api/admin/data', (req, res) => {
    res.json(readData());
});

// Update settings
app.post('/api/admin/settings', (req, res) => {
    const { whatsapp, adminEmail, appPassword } = req.body;
    const data = readData();
    data.settings.whatsapp = whatsapp || data.settings.whatsapp;
    data.settings.adminEmail = adminEmail || data.settings.adminEmail;
    writeData(data);
    
    // Update .env file for password if provided
    if (appPassword) {
        fs.writeFileSync(path.join(__dirname, '.env'), `GMAIL_APP_PASSWORD=${appPassword}\n`, 'utf8');
        setupTransporter(data.settings.adminEmail, appPassword);
    } else {
        setupTransporter(data.settings.adminEmail, process.env.GMAIL_APP_PASSWORD || '');
    }
    
    res.json({ success: true });
});

// Add Package
app.post('/api/admin/packages', (req, res) => {
    const pkg = req.body;
    const data = readData();
    pkg.id = Date.now();
    data.packages.push(pkg);
    writeData(data);
    res.json({ success: true, packages: data.packages });
});

// Delete Package
app.delete('/api/admin/packages/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    data.packages = data.packages.filter(p => p.id.toString() !== id);
    writeData(data);
    res.json({ success: true, packages: data.packages });
});

// Delete Enquiry
app.delete('/api/admin/enquiries/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    data.enquiries = data.enquiries.filter(e => e.id.toString() !== id);
    writeData(data);
    res.json({ success: true, enquiries: data.enquiries });
});

// Serve built frontend in production if available
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

