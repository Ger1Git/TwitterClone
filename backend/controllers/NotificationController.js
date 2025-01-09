import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ to: userId })
            .sort({ createdAt: -1 })
            .select('-password')
            .populate('from', 'username profileImg');

        await Notification.updateMany({ to: userId }, { read: true });

        return res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({ to: userId });
        return res.status(200).json({
            message: 'Notifications deleted successfully'
        });
    } catch (error) {
        console.log('Error in deleteNotifications controller: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }

        if (notification.to.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                error: 'You are not authorized to delete this notification'
            });
        }

        await Notification.findByIdAndDelete(notificationId);

        return res.status(200).json({
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.log('Error in deleteNotification controller: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};
