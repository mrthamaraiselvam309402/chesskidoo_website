const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbackSecretKey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const allStudents = await pool.query(`
      SELECT s.*, c.name as coach_name 
      FROM students s 
      LEFT JOIN coaches c ON s.coach_id = c.id 
      ORDER BY s.id ASC
    `);
    res.json(allStudents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const student = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (student.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentData = student.rows[0];
    if (req.user.role !== 'admin' && req.user.sub != studentData.user_id) {
       return res.status(403).json({ error: 'Access denied' });
    }

    res.json(studentData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;