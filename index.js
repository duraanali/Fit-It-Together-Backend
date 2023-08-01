require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const sqlite3 = require('sqlite3').verbose();

// Add body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Connect to the SQLite database
const db = new sqlite3.Database('./database.sqlite');

const port = process.env.PORT || 9001;
// Secret key for JWT
const secretKey = 'your-secret-key';

// Create tables in the database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    date TEXT,
    image TEXT,
    location TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Helper function to run database queries
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        const result = rows.map(row => ({ ...row }));
        resolve(result);
      }
    });
  });
}

// Helper function to generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

// Register a new user
app.post('/api/user/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    // Check if user with the same email already exists
    const existingUser = await runQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User with the same email already exists' });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the user in the database
    const result = await runQuery(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword]
    );

    // Generate token
    const token = generateToken({ id: result.lastID });

    res.json({ message: 'User registered successfully', user_id: result.lastID, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// User login
app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  db.get('SELECT * FROM users WHERE email = ?', [email], async (error, row) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if the password matches
    const passwordMatches = await bcrypt.compare(password, row.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create and return JWT token
    const token = jwt.sign({ id: row.id }, secretKey, { expiresIn: '1h' });

    res.json({ message: 'User logged in successfully', user_id: row.id, token });
  });
});

// Get information of the current logged-in user
app.get('/api/user', verifyToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await runQuery('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Do not include the password in the response
    const { password, ...userInfo } = user[0];

    res.json(userInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



// get all issues
app.get('/api/issues', async (req, res) => {
    try {
        const issues = await runQuery('SELECT * FROM issues');
        res.json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// get issue by id
app.get('/api/issues/:issue_id', async (req, res) => {
    const { issue_id } = req.params;
    try {
        const issue = await runQuery('SELECT * FROM issues WHERE id = ?', [issue_id]);
        if (issue.length === 0) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        res.json(issue[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// Create a new issue
app.post('/api/issues', verifyToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { title, description, date, image, location } = req.body;
  const user_id = req.user.id;

  try {
    const result = await runQuery(
      'INSERT INTO issues (user_id, title, description, date, image, location) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, title, description, date, image, location]
    );

    res.json({ message: 'Issue created successfully', issue_id: result.lastID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Update an issue
app.put('/api/issues/:issue_id', verifyToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { issue_id } = req.params;
  const { title, description, date, image, location } = req.body;
  const user_id = req.user.id;

  try {
    const issue = await runQuery('SELECT * FROM issues WHERE id = ?', [issue_id]);

    if (issue.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to update this issue' });
    }

    await runQuery(
      'UPDATE issues SET title = ?, description = ?, date = ?, image = ?, location = ? WHERE id = ?',
      [title, description, date, image, location, issue_id]
    );

    res.json({ message: 'Issue updated successfully', issue_id: issue[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Delete an issue
app.delete('/api/issues/:issue_id', verifyToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { issue_id } = req.params;
  const user_id = req.user.id;

  try {
    const issue = await runQuery('SELECT * FROM issues WHERE id = ?', [issue_id]);

    if (issue.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to delete this issue' });
    }

    await runQuery('DELETE FROM issues WHERE id = ?', [issue_id]);

    res.json({ message: 'Issue deleted successfully', issue_id: issue[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Upvote an issue
app.post('/api/issues/:issue_id/upvote', verifyToken, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    const { issue_id } = req.params;
  
    try {
      const issue = await runQuery('SELECT * FROM issues WHERE id = ?', [issue_id]);
  
      if (issue.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }
  
      issue[0].upvotes += 1;
  
      await runQuery('UPDATE issues SET upvotes = ? WHERE id = ?', [issue[0].upvotes, issue_id]);
  
      res.json({ message: 'Issue upvoted successfully', issue_id: issue[0].id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  // Downvote an issue
  app.post('/api/issues/:issue_id/downvote', verifyToken, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    const { issue_id } = req.params;
  
    try {
      const issue = await runQuery('SELECT * FROM issues WHERE id = ?', [issue_id]);
  
      if (issue.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }
  
      issue[0].downvotes += 1;
  
      await runQuery('UPDATE issues SET downvotes = ? WHERE id = ?', [issue[0].downvotes, issue_id]);
  
      res.json({ message: 'Issue downvoted successfully', issue_id: issue[0].id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  // Verify JWT token middleware
  function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
  
    if (typeof bearerHeader !== 'undefined') {
      const bearerToken = bearerHeader.split(' ')[1];
      jwt.verify(bearerToken, secretKey, (error, decoded) => {
        if (error) {
          return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
      });
    } else {
      res.status(401).json({ error: 'Authentication required' });
    }
  }
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });