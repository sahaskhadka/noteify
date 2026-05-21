import React, { useState, useEffect } from 'react';
import { auth, db, collection, getDocs, query, where } from './services/firebase';

export const DebugPanel: React.FC = () => {
  const [debugData, setDebugData] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const fetchDebugInfo = async () => {
    const user = auth.currentUser;
    if (!user) {
      setDebugData({ error: 'No user logged in' });
      return;
    }

    try {
      const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const notesList: any[] = [];
      snapshot.forEach(doc => {
        notesList.push({
          docId: doc.id,
          fieldNames: Object.keys(doc.data()),
          data: doc.data()
        });
      });
      
      setDebugData({
        userId: user.uid,
        userEmail: user.email,
        totalNotes: notesList.length,
        notes: notesList,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setDebugData({ error: error.message, code: error.code });
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-red-500 rounded-lg p-4 shadow-2xl z-50 max-w-lg max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-red-600">Firebase Debug Info</h3>
        <button onClick={() => setShowDebug(false)} className="text-gray-500">X</button>
      </div>
      <button onClick={fetchDebugInfo} className="bg-blue-500 text-white px-2 py-1 rounded text-xs mb-3">
        Refresh
      </button>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
};