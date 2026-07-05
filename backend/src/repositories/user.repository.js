const pool = require('../config/database');

const userRepository = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async findByUsername(username) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    return rows[0] || null;
  },

  async findAllEmployees() {
    const { rows } = await pool.query(
      `SELECT id, username, email, role, created_at
       FROM users WHERE role = 'employee' ORDER BY username`
    );
    return rows;
  },

  async create({ username, email, password, role = 'employee' }) {
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, created_at`,
      [username, email, password, role]
    );
    return rows[0];
  },
};

module.exports = userRepository;
