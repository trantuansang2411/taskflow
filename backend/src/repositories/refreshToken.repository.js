const pool = require('../config/database');

const refreshTokenRepository = {
  async create({ userId, token, expiresAt }) {
    const { rows } = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, token, expiresAt]
    );
    return rows[0];
  },

  async findByToken(token) {
    const { rows } = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 LIMIT 1',
      [token]
    );
    return rows[0] || null;
  },

  async deleteByToken(token) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  },

  async deleteByUserId(userId) {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  },
};

module.exports = refreshTokenRepository;
