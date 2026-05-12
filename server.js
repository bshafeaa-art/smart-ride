const express = require('express');

const multer = require('multer'); // 👈 Import Multer

const mysql = require('mysql2');

const cors = require('cors');

const path = require('path');



const app = express();

app.use(cors());

app.use(express.json());




// ✅ SERVE IMAGES (Only need this once)

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 👈 ADDED THIS LINE

// ----------------------------------------------------

// 1. DATABASE CONNECTION

// ----------------------------------------------------

const db = mysql.createConnection({

    host: 'localhost',

    user: 'root',

    password: '',

    database: 'smart_ride'

});



db.connect(err => {

    if (err) {

        console.error('❌ Database Connection Failed:', err);

    } else {

        console.log('✅ MySQL Connected to smart_ride');

    }

});

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        // Files will be saved in 'uploads/services'

        // Make sure this folder exists!

        cb(null, 'uploads/services');

    },

    filename: (req, file, cb) => {

        // Rename file to prevent duplicates (e.g., service_17823.jpg)

        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));

    }

});



const upload = multer({ storage: storage });



// ----------------------------------------------------

// 2. AUTHENTICATION (Login & Register)

// ----------------------------------------------------



// LOGIN

const loginHandler = (req, res) => {

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [req.body.email, req.body.password], (err, data) => {

        if (err) return res.status(500).json({ Error: "Database error" });

        if (data.length > 0) {

            return res.json({
                Status: "Success",
                user: { user_id: data[0].user_id, name: data[0].name, role: data[0].role }
            });

        }

        return res.json({ Status: "Error", Message: "Wrong email/password" });

    });

};

app.post('/user-login', loginHandler);

app.post('/login', loginHandler);



// REGISTER

app.post('/api/auth/register', (req, res) => {

    const sql = "INSERT INTO users (`name`, `email`, `password`,`phone`, `role`) VALUES (?)";

    const values = [req.body.username, req.body.email, req.body.password, req.body.phone, 'user'];



    db.query(sql, [values], (err, data) => {

        if (err) return res.status(500).json({ error: "Email already taken" });

        return res.json({ message: "User registered successfully" });

    });

});



// ----------------------------------------------------

// 3. CARS API

// ----------------------------------------------------



// ==========================================

// 🚗 CARS API (Add this to fix the empty page)

// ==========================================



// 1. GET ALL CARS

app.get('/cars', (req, res) => {

    const sql = "SELECT * FROM cars";

    db.query(sql, (err, data) => {

        if (err) return res.json([]);

        return res.json(data);

    });

});



// 2. GET SINGLE CAR (For the BookCar page)

app.get('/cars/:id', (req, res) => {

    const sql = "SELECT * FROM cars WHERE id = ?";

    const id = req.params.id;

    db.query(sql, [id], (err, data) => {

        if (err) return res.json({ Error: "Error fetching car" });

        return res.json(data); // Returns an array with 1 car

    });

});



// ==========================================

// 📅 CREATE BOOKING (FIXED COLUMN COUNT)

// ==========================================

app.post("/bookings", (req, res) => {

    console.log("📥 Received Booking Data:", req.body);



    const {

        user_id, car_id, service_id, service_name,

        pickup_date, dropoff_date, status, total_price, booking_date, booking_type,

        payment_method, transaction_id, payment_status

    } = req.body;



    // Use toLowerCase to prevent "service" vs "Service" issues

    const type = booking_type ? booking_type.toLowerCase() : "";



    if (type === 'service') {

        console.log("🛠️ Saving to 'service_bookings' table...");



        // Ensure we match exactly: 9 columns = 9 values

        const sql = `INSERT INTO service_bookings

            (user_id, service_id, service_name, date, status, payment_method, transaction_id, payment_status, created_at)

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;



        const values = [

            user_id || 0, // Fallback if user_id is missing

            service_id,

            service_name,

            pickup_date,

            'Confirmed',

            payment_method || 'Cash',

            transaction_id,

            payment_status || 'Paid',

            new Date()

        ];



        db.query(sql, values, (err, result) => {

            if (err) {

                console.error("❌ SQL Error (Service):", err.sqlMessage);

                return res.status(500).json({ Error: err.sqlMessage });

            }

            return res.json({ Status: "Success", id: result.insertId });

        });



    } else {

        console.log("🏎️ Saving to 'booking' table...");



        // Ensure we match exactly: 10 columns = 10 values

        const sql = `INSERT INTO booking

            (user_id, car_id, pickup_date, drop_date, total_price, status, booking_type, payment_method, transaction_id, payment_status)

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;



        const values = [

            user_id || 0,

            car_id || null,

            pickup_date,

            dropoff_date || null,

            status || 'Confirmed',

            total_price,

            booking_date || new Date(),

            booking_type || 'Car',

            'Confirmed',

            'Car',

            payment_method || 'Online',

            transaction_id,

            payment_status || 'Paid'

        ];



        db.query(sql, values, (err, result) => {

            if (err) {

                console.error("❌ SQL Error (Car):", err.sqlMessage);

                return res.status(500).json({ Error: err.sqlMessage });

            }

            return res.json({ Status: "Success", id: result.insertId });

        });

    }

});

// GET SINGLE CAR

app.get("/cars/:id", (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM cars WHERE id = ?";

    db.query(sql, [id], (err, data) => {

        if (err) return res.json({ Error: "SQL Error" });

        return res.json(data);

    });

});





// 🟢 NEW: Route to handle car bookings

app.post("/book-car", (req, res) => {

    // 1. Grabbing the dates from React

    const { user_id, car_id, pickup_date, drop_date, total_price, status } = req.body;



    // 2. The SQL query MUST have ? marks for the dates, NOT the word NULL!

    const sql = `INSERT INTO booking

                (user_id, car_id, service_id, pickup_date, drop_date, status, total_price, booking_date, payment_method, payment_status)

                VALUES (?, ?, NULL, ?, ?, ?, ?, NOW(), 'Online', 'Paid')`;



    // 3. Pass the dates into the array

    db.query(sql, [user_id, car_id, pickup_date, drop_date, status, total_price], (err, result) => {

        if (err) {

            console.error("SQL Error:", err);

            return res.status(500).json({ Error: err.sqlMessage });

        }

        return res.json({ Status: "Success" });

    });

});



// ----------------------------------------------------

// 4. SERVICES API

// ⚠️ CHECK YOUR DB: Is the table named 'service' or 'services'?

// I have standardized it to 'services' (Plural) below.

// ----------------------------------------------------







// ==========================================

// 🕵️ GET SERVICES (Cleaned)

// ==========================================

app.get('/services', (req, res) => {

    // 🟢 Single-line string prevents invisible character errors

    const sql = "SELECT s.*, c.category_name FROM service s LEFT JOIN service_category c ON s.category_id = c.category_id";



    db.query(sql, (err, data) => {

        if (err) {

            console.error("❌ SQL ERROR:", err.sqlMessage);

            return res.json([]);

        }

        console.log("📦 DATA FOUND:", data.length, "items");

        return res.json(data);

    });

});



// ==========================================

// 🛠️ ADD SERVICE (Merged & Fixed)

// ==========================================

app.post('/services', upload.single('image'), (req, res) => {

    const { category_id, service_name, price, description } = req.body;

    const imagePath = req.file ? `/uploads/services/${req.file.filename}` : "/uploads/services/default.jpg";



    const sql = "INSERT INTO service (`category_id`, `service_name`, `price`, `image`, `description`) VALUES (?)";

    const values = [category_id || 1, service_name, price, imagePath, description];



    db.query(sql, [values], (err) => {

        if (err) return res.status(500).json({ Error: err.sqlMessage });

        return res.json({ Status: "Success" });

    });

});



// ==========================================

// 📝 UPDATE SERVICE (EDIT)

// ==========================================

app.put('/services/:id', upload.single('image'), (req, res) => {

    const id = req.params.id;

    const { category_id, service_name, price, description } = req.body;



    let sql = "";

    let values = [];



    if (req.file) {

        const imagePath = `/uploads/services/${req.file.filename}`;

        sql = "UPDATE service SET `category_id`=?, `service_name`=?, `price`=?, `description`=?, `image`=? WHERE service_id=?";

        values = [category_id, service_name, price, description, imagePath, id];

    } else {

        sql = "UPDATE service SET `category_id`=?, `service_name`=?, `price`=?, `description`=? WHERE service_id=?";

        values = [category_id, service_name, price, description, id];

    }



    db.query(sql, values, (err) => {

        if (err) return res.status(500).json({ Error: err.sqlMessage });

        return res.json({ Status: "Success" });

    });

});



// ==========================================

// 🗑️ DELETE SERVICE

// ==========================================

app.delete('/services/:id', (req, res) => {

    const sql = "DELETE FROM service WHERE service_id = ?";

    db.query(sql, [req.params.id], (err) => {

        if (err) return res.json({ Error: "Error deleting" });

        return res.json({ Status: "Success" });

    });

});



// ----------------------------------------------------

// 5. BOOKINGS API

// ----------------------------------------------------



// ==========================================

// 📅 CREATE BOOKING (Fixed Table Names)

// ==========================================

app.post("/bookings", (req, res) => {

    console.log("📥 New Booking Request:", req.body);



    const {

        user_id, car_id, service_id, service_name,

        pickup_date, dropoff_date, total_price, booking_type,

        payment_method, transaction_id, payment_status

    } = req.body;



    // 🛑 CASE 1: SERVICE BOOKING

    // We must save to 'service_bookings' table

    if (booking_type === 'Service') {



        // Check if user_id exists (Admin might be booking)

        if (!user_id) {

            return res.status(400).json({ Error: "User ID is missing!" });

        }



        const sql = "INSERT INTO service_bookings (user_id, service_id, service_name, date, status, payment_method, transaction_id, payment_status, created_at) VALUES (?)";



        const values = [

            user_id,

            service_id,

            service_name,

            pickup_date, // This maps to 'date' in your table

            'Confirmed',

            payment_method || 'Cash',

            transaction_id || 'TXN-ADMIN',

            payment_status || 'Paid',

            new Date() // created_at

        ];



        db.query(sql, [values], (err, result) => {

            if (err) {

                console.error("❌ SQL Error (Service):", err.sqlMessage);

                return res.status(500).json({ Error: err.sqlMessage });

            }

            console.log("✅ Service Booking Saved! ID:", result.insertId);

            return res.json({ Status: "Success" });

        });



    } else {

        // 🚗 CASE 2: CAR BOOKING

        // We must save to 'booking' table (Singular!)



        console.log("🏎️ Saving to 'booking' table...");



        const sql = "INSERT INTO booking (user_id, car_id, pickup_date, drop_date, total_price, status, booking_type, payment_method, transaction_id, payment_status, booking_date) VALUES (?)";



        const values = [

            user_id,

            car_id,

            pickup_date,

            dropoff_date, // Maps to 'drop_date'

            total_price,

            'Confirmed',

            'Car',

            payment_method || 'Online',

            transaction_id || 'TXN-CAR',

            payment_status || 'Paid',

            new Date() // booking_date

        ];



        db.query(sql, [values], (err, result) => {

            if (err) {

                console.error("❌ SQL Error (Car):", err.sqlMessage);

                return res.status(500).json({ Error: err.sqlMessage });

            }

            console.log("✅ Car Booking Saved! ID:", result.insertId);

            return res.json({ Status: "Success" });

        });

    }

});

// 1. Delete a booking

app.delete("/cancel-booking/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM booking WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) return res.json({ Error: err });

        return res.json({ Status: "Success" });

    });

});

app.post('/book-car', (req, res) => {

    const { user_id, car_id, pickup_date, drop_date, total_price } = req.body;

    const sql = "INSERT INTO booking (user_id, car_id, service_id, pickup_date, drop_date, total_price, status) VALUES (?, ?, ?, ?, ?, 'Confirmed')";

    db.query(sql, [user_id, car_id, service_id, pickup_date, drop_date, total_price], (err) => {

        if (err) return res.status(500).json({ Error: err.message });

        res.json({ Status: "Success" });

    });

});

app.get("/admin-stats", (req, res) => {
    // 1. Get all car bookings
    const sqlBookings = `
        SELECT b.*, c.name AS car_name, u.name AS user_name
        FROM booking b
        LEFT JOIN cars c ON b.car_id = c.id
        LEFT JOIN users u ON b.user_id = u.user_id
        ORDER BY b.id DESC`;

    // 2. Get all service bookings (including prices for revenue calculation)
    const sqlServiceBookings = `
        SELECT sb.*, s.price
        FROM service_bookings sb
        LEFT JOIN service s ON sb.service_id = s.service_id`;

    db.query(sqlBookings, (err, bookingData) => {
        if (err) return res.status(500).json({ Error: err.sqlMessage });

        db.query(sqlServiceBookings, (err, serviceBookingData) => {
            if (err) return res.status(500).json({ Error: err.sqlMessage });

            // Calculate unified revenue
            const carRevenue = bookingData.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
            const serviceRevenue = serviceBookingData.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
            const totalRevenue = carRevenue + serviceRevenue;

            return res.json({
                bookings: bookingData,            // For the table
                totalRevenue: totalRevenue,       // For Card 1
                totalBookings: bookingData.length, // For Card 2 (Car Bookings)
                totalServices: serviceBookingData.length // For Card 3 (Service Bookings)
            });
        });
    });
});

app.get('/all-bookings', (req, res) => {

    const sql = `

        SELECT b.*, c.name AS car_name, u.name AS user_name

        FROM booking b

        LEFT JOIN cars c ON b.car_id = c.id

        LEFT JOIN users u ON b.user_id = u.user_id

        ORDER BY b.booking_date DESC`;



    db.query(sql, (err, data) => {

        if (err) return res.json(err);

        return res.json(data);

    });

});

// 🟢 GET BOOKINGS FOR A SPECIFIC USER

app.get('/my-bookings/:id', (req, res) => {
    const userId = req.params.id;

    const sql = `
        SELECT 
            b.id, 
            'Car' AS type, 
            c.name AS item_name, 
            c.image AS item_image, 
            b.total_price, 
            b.pickup_date, 
            b.drop_date, 
            b.status 
        FROM booking b 
        LEFT JOIN cars c ON b.car_id = c.id 
        WHERE b.user_id = ?

        UNION ALL

        SELECT 
            sb.id, 
            'Service' AS type, 
            sb.service_name AS item_name, 
            s.image AS item_image, 
            s.price AS total_price, 
            sb.date AS pickup_date, 
            sb.date AS drop_date, 
            sb.status 
        FROM service_bookings sb 
        LEFT JOIN service s ON sb.service_id = s.service_id 
        WHERE sb.user_id = ?
        
        ORDER BY id DESC`;

    db.query(sql, [userId, userId], (err, data) => {
        if (err) return res.status(500).json({ Error: err.sqlMessage });
        return res.json(data);
    });
});

// 1. FIXED: Unified Admin Stats (Cars + Services)


// 2. FIXED: All Bookings (Shows every customer and what they bought)
app.get('/admin/all-bookings', (req, res) => {
    const sql = `
        SELECT 
            b.id, u.name AS customer_name, 'Car' AS type, 
            c.name AS item_name, b.total_price, b.status, b.pickup_date AS date
        FROM booking b 
        JOIN users u ON b.user_id = u.user_id 
        LEFT JOIN cars c ON b.car_id = c.id 

        UNION ALL

        SELECT 
            sb.id, u.name AS customer_name, 'Service' AS type, 
            sb.service_name AS item_name, s.price AS total_price, sb.status, sb.date
        FROM service_bookings sb
        JOIN users u ON sb.user_id = u.user_id
        LEFT JOIN service s ON sb.service_id = s.service_id

        ORDER BY id DESC`;

    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ Error: err.sqlMessage });
        res.json(data);
    });
});

// ==========================================

// 📂 GET ALL CATEGORIES (For the Dropdown)

// ==========================================

app.get('/categories', (req, res) => {

    // ⚠️ Make sure your table name matches (service_category OR categories)

    const sql = "SELECT * FROM service_category";



    db.query(sql, (err, data) => {

        if (err) return res.json(err);

        return res.json(data);

    });

});



// ==========================================

// 📂 CATEGORIES API (Connected to 'service_category')

// ==========================================

app.get('/categories', (req, res) => {

    // 👇 FIXED: Using your exact table name

    const sql = "SELECT * FROM service_category";



    db.query(sql, (err, data) => {

        if (err) {

            console.error("Error fetching categories:", err);

            return res.json([]);

        }

        return res.json(data);

    });

});

// ==========================================

// 🛠️ ADD SERVICE (Dynamic Entry)

// ==========================================

app.post('/services', (req, res) => {

    // We expect the frontend to send these values

    const sql = "INSERT INTO service (`category_id`, `service_name`, `price`, `image`, `description`) VALUES (?)";



    // Note: For image, we are saving the PATH string (e.g. "/images/services/car.jpg")

    // You still need to manually paste the image file into the folder for now.

    const values = [

        req.body.category_id,

        req.body.service_name,

        req.body.price,

        req.body.image,

        req.body.description

    ];



    db.query(sql, [values], (err, data) => {

        if (err) {

            console.error(err);

            return res.json({ Error: "Error adding service" });

        }

        return res.json({ Status: "Success" });

    });

});



// 🟢 THE DASHBOARD DATA GENERATOR




// GET USER BOOKINGS

app.get('/api/bookings/:userId', (req, res) => {

    const userId = req.params.userId;

    // Simple fetch from bookings table

    const sql = "SELECT * FROM booking WHERE user_id = ?";



    db.query(sql, [userId], (err, data) => {

        if (err) return res.json([]);

        return res.json(data);

    });

});



// ----------------------------------------------------

// 6. START SERVER (Only Once!)

// ----------------------------------------------------

app.listen(8081, () => {

    console.log("🚀 Server running on port 8081");

});