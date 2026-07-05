const pool = require('../config/database');

const todoRepository = {
  async findAll({ userId, role, status, search, page = 1, limit = 5 }) {
    let query = `
      SELECT t.*,
             u1.username AS created_by_name,
             u2.username AS assigned_to_name,
             COUNT(*) OVER() AS full_count
      FROM todos t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (role === 'employee') {
      query += ` AND t.assigned_to = $${idx++}`;
      params.push(userId);
    }

    if (status) {
      query += ` AND t.status = $${idx++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (t.title ILIKE $${idx} OR t.description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY t.created_at DESC`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    
    const total = rows.length > 0 ? parseInt(rows[0].full_count, 10) : 0;
    
    const todos = rows.map(row => {
      const { full_count, ...todo } = row;
      return todo;
    });

    return { todos, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT t.*,
              u1.username AS created_by_name,
              u2.username AS assigned_to_name
       FROM todos t
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.id = $1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ createdBy, title, description }) {
    const { rows } = await pool.query(
      `INSERT INTO todos (created_by, title, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [createdBy, title, description || null]
    );
    return rows[0];
  },

  async update({ id, title, description }) {
    const { rows } = await pool.query(
      `UPDATE todos
       SET title = $1, description = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [title, description || null, id]
    );
    return rows[0] || null;
  },

  async assign({ id, assignedTo }) {
    const { rows } = await pool.query(
      `UPDATE todos
       SET assigned_to = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [assignedTo, id]
    );
    return rows[0] || null;
  },

  async updateStatus({ id, status }) {
    const { rows } = await pool.query(
      `UPDATE todos
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM todos WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },
};

module.exports = todoRepository;
