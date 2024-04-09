const express = require('express');
const app = express();
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');

// MySQL connection configuration
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jewellery'
});

// Connect to MySQL
mysqlConnection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});

const upload = multer({
    storage: storage,
});

app.use('/profile', express.static('upload/images'));

// Upload file endpoint
app.post("/upload", upload.single('profile'), (req, res) => {
    console.log(req.file);

    // Save file details to MySQL database
    const { id, filename,  } = req.file;
    mysqlConnection.query(
        'INSERT INTO uploadfile (id, filename ) VALUES (?,?)',
        [id, filename, ],
        (err, result) => {
            if (err) {
                console.error('Error inserting into database: ' + err.stack);
                return res.status(500).json({ success: 0, message: 'Database error' });
            }
            console.log('File details saved to database');
            res.json({
                success: 1,
                profile_url: `http://localhost:4000/profile/${filename}`
            });
        }
    );
});

function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.json({
            success: 0,
            message: err.message
        });
    }
}
app.use(errHandler);

app.listen(4000, () => {
    console.log("Server running on port 4000");
});
