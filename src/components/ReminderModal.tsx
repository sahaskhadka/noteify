import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, noteId, noteTitle }) => {
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetReminder = async () => {
    if (!reminderDateTime) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const reminderTime = new Date(reminderDateTime);
      
      if (reminderTime <= new Date()) {
        toast.error('Time must be in the future');
        return;
      }

      // Check notification permission
      if (Notification.permission === 'denied') {
        toast.error('Please enable notifications in browser settings');
        return;
      }

      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Notifications are required for reminders');
          return;
        }
      }

      // Schedule notification
      const timeUntil = reminderTime.getTime() - Date.now();
      if (timeUntil <= 86400000) { // Within 24 hours
        setTimeout(() => {
          new Notification('Note Reminder', {
            body: `Reminder: ${noteTitle || 'Untitled Note'}`,
            icon: '/vite.svg',
          });
        }, timeUntil);
        toast.success(`Reminder set for ${reminderTime.toLocaleString()}`);
        onClose();
      } else {
        toast.error('Please set reminder within 24 hours');
      }
    } catch (error) {
      toast.error('Failed to set reminder');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Set Reminder</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="font-medium">{noteTitle || 'Untitled Note'}</span>
          </p>
          
          <input
            type="datetime-local"
            value={reminderDateTime}
            onChange={(e) => setReminderDateTime(e.target.value)}
            className="w-full px-3 py-2 mb-5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
            min={new Date().toISOString().slice(0, 16)}
          />
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSetReminder}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
            >
              <Bell size={16} />
              {loading ? 'Setting...' : 'Set Reminder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};