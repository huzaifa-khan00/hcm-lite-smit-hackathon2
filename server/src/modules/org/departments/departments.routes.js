import { Router } from 'express';
import { authenticate } from '../../../middleware/auth.js';
import { requireRole } from '../../../middleware/requireRole.js';
import { validate } from '../../../middleware/validate.js';
import { departmentSchema } from './departments.schema.js';
import * as controller from './departments.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', requireRole('admin', 'hr'), controller.list);
router.post('/', requireRole('admin'), validate(departmentSchema), controller.create);
router.put('/:id', requireRole('admin'), validate(departmentSchema), controller.update);
router.delete('/:id', requireRole('admin'), controller.remove);

export default router;
