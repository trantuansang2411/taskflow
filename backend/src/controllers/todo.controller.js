const todoService = require('../services/todo.service');

const todoController = {
  async getAll(req, res, next) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await todoService.getAll({
        userId: req.userId,
        role: req.userRole,
        status,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 5,
      });
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const todo = await todoService.getById({
        id: req.params.id,
        userId: req.userId,
        role: req.userRole,
      });
      res.status(200).json({ status: 'success', data: { todo } });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { title, description } = req.body;
      const todo = await todoService.create({ userId: req.userId, title, description });
      res.status(201).json({ status: 'success', data: { todo } });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { title, description } = req.body;
      const todo = await todoService.update({ id: req.params.id, title, description });
      res.status(200).json({ status: 'success', data: { todo } });
    } catch (err) {
      next(err);
    }
  },

  async assign(req, res, next) {
    try {
      const { assignedTo } = req.body;
      const todo = await todoService.assign({ id: req.params.id, assignedTo });
      res.status(200).json({ status: 'success', data: { todo } });
    } catch (err) {
      next(err);
    }
  },

  async toggleStatus(req, res, next) {
    try {
      const todo = await todoService.toggleStatus({
        id: req.params.id,
        userId: req.userId,
        role: req.userRole,
      });
      res.status(200).json({ status: 'success', data: { todo } });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const todo = await todoService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Todo deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getEmployees(req, res, next) {
    try {
      const employees = await todoService.getEmployees();
      res.status(200).json({ status: 'success', data: { employees } });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = todoController;
