const todoRepository = require('../repositories/todo.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

const todoService = {
  async getAll({ userId, role, status, search, page, limit }) {
    if (status && !['pending', 'completed'].includes(status)) {
      throw new AppError('Status must be pending or completed', 400);
    }
    return todoRepository.findAll({ userId, role, status, search, page, limit });
  },

  async getById({ id, userId, role }) {
    const todo = await todoRepository.findById(id);
    if (!todo) throw new AppError('Todo not found', 404);

    // Employee chỉ xem được todo được giao cho mình
    if (role === 'employee' && todo.assigned_to !== userId) {
      throw new AppError('You do not have permission to view this todo', 403);
    }
    return todo;
  },

  async create({ userId, title, description }) {
    if (!title || title.trim().length === 0) throw new AppError('Title is required', 400);
    if (title.trim().length > 255) throw new AppError('Title must not exceed 255 characters', 400);
    return todoRepository.create({ createdBy: userId, title: title.trim(), description });
  },

  async update({ id, title, description }) {
    const todo = await todoRepository.findById(id);
    if (!todo) throw new AppError('Todo not found', 404);

    if (!title || title.trim().length === 0) throw new AppError('Title is required', 400);
    if (title.trim().length > 255) throw new AppError('Title must not exceed 255 characters', 400);
    if (todo.status === 'completed') throw new AppError('Cannot update a completed todo', 400);
    return todoRepository.update({ id, title: title.trim(), description });
  },

  async assign({ id, assignedTo }) {
    const [todo, employee] = await Promise.all([
      todoRepository.findById(id),
      userRepository.findById(assignedTo)
    ]);
    if (!todo) throw new AppError('Todo not found', 404);
    if (!employee) throw new AppError('Employee not found', 404);
    if (employee.role !== 'employee') throw new AppError('Can only assign todos to employees', 400);
    return todoRepository.assign({ id, assignedTo });
  },

  async toggleStatus({ id, userId, role }) {
    const todo = await todoRepository.findById(id);
    if (!todo) throw new AppError('Todo not found', 404);

    // Employee chỉ được toggle todo được giao cho mình
    if (role === 'employee' && todo.assigned_to !== userId) {
      throw new AppError('You can only update status of your assigned todos', 403);
    }

    // Admin không được tự ý đổi trạng thái của công việc
    if (role === 'admin') {
      throw new AppError('Admins cannot change the status of tasks. Only the employee can do this.', 403);
    }

    const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
    return todoRepository.updateStatus({ id, status: newStatus });
  },

  async delete(id) {
    const todo = await todoRepository.findById(id);
    if (!todo) throw new AppError('Todo not found', 404);
    return todoRepository.delete(id);
  },

  async getEmployees() {
    return userRepository.findAllEmployees();
  },
};

module.exports = todoService;
