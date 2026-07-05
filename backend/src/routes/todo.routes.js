const router = require('express').Router();
const todoController = require('../controllers/todo.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

router.use(authenticate);

// Admin + Employee
router.get('/', todoController.getAll);
router.get('/:id', todoController.getById);
router.patch('/:id/status', todoController.toggleStatus);

// Admin only
router.post('/', authorize('admin'), todoController.create);
router.put('/:id', authorize('admin'), todoController.update);
router.delete('/:id', authorize('admin'), todoController.remove);
router.patch('/:id/assign', authorize('admin'), todoController.assign);
router.get('/meta/employees', authorize('admin'), todoController.getEmployees);

module.exports = router;
