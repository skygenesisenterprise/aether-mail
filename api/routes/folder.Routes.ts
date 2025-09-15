import { Router } from 'express';
import { listFolders, createFolder, deleteFolder } from '../controllers/folderController';
import authMiddleware from '../middlewares/authMiddleware';
// import { validateCreateFolder } from '../middlewares/validateMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', listFolders);
// router.post('/create', validateCreateFolder, createFolder);
router.post('/create', createFolder);
router.delete('/:folderId', deleteFolder);

export default router;
