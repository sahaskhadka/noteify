import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Reminder {
  id?: string;
  noteId: string;
  noteTitle: string;
  reminderTime: Date;
  userId: string;
  isSent: boolean;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission was denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function scheduleReminder(reminder: Omit<Reminder, 'id' | 'isSent'>) {
  try {
    // Check permission before saving
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }

    const reminderData = {
      ...reminder,
      reminderTime: reminder.reminderTime,
      isSent: false,
      createdAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'reminders'), reminderData);
    
    const now = new Date();
    const timeUntilReminder = reminder.reminderTime.getTime() - now.getTime();
    
    if (timeUntilReminder > 0 && timeUntilReminder < 86400000) {
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          showNotification(reminder.noteTitle, reminder.reminderTime);
          markReminderAsSent(docRef.id);
        }
      }, timeUntilReminder);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    throw error;
  }
}

export function showNotification(noteTitle: string, reminderTime: Date) {
  if (Notification.permission === 'granted') {
    new Notification('Note Reminder', {
      body: `Reminder: ${noteTitle}`,
      icon: '/vite.svg',
      tag: `reminder-${Date.now()}`,
    });
  }
}

async function markReminderAsSent(reminderId: string) {
  try {
    const reminderRef = doc(db, 'reminders', reminderId);
    await updateDoc(reminderRef, { isSent: true });
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
  }
}

export async function deleteReminder(reminderId: string) {
  try {
    await deleteDoc(doc(db, 'reminders', reminderId));
  } catch (error) {
    console.error('Error deleting reminder:', error);
  }
}

export async function getRemindersForNote(noteId: string, userId: string) {
  try {
    const q = query(
      collection(db, 'reminders'),
      where('noteId', '==', noteId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
}