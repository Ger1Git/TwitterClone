import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getNotifications, deleteAllNotifications, deleteNotification } from '../controllers/NotificationController.js';

const router = express.Router();

router.get("/", protectRoute, getNotifications)
    .delete("/all", protectRoute, deleteAllNotifications)
    .delete("/:notificationId", protectRoute, deleteNotification);

export default router;