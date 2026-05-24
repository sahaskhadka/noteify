import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { 
  Plus, Search, Moon, Sun, Edit2, Trash2, Save, X, Clock,
  TrendingUp, FolderOpen, ArrowRight, LayoutGrid, List, Type,
  AlignLeft, Bell, LogOut
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { auth, db, collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, signOut, onAuthStateChanged, serverTimestamp } from './services/firebase';
import type { User } from 'firebase/auth';
import { Auth } from './components/Auth';
import { ReminderModal } from './components/ReminderModal';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  userId: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedNoteForReminder, setSelectedNoteForReminder] = useState<Note | null>(null);

  useEffect(() => { document.title = 'Noteifyi'; }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(query(collection(db, 'notes'), where('userId', '==', user.uid)), (snapshot) => {
      const notesData: Note[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notesData.push({ id: doc.id, title: data.title || 'Untitled', content: data.content || '', createdAt: data.createdAt, updatedAt: data.updatedAt, userId: data.userId });
      });
      notesData.sort((a, b) => {
        const getDate = (d: any) => d?.toDate ? d.toDate() : d?.seconds ? new Date(d.seconds * 1000) : new Date(d || 0);
        return getDate(b.createdAt).getTime() - getDate(a.createdAt).getTime();
      });
      setNotes(notesData);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') setDarkMode(true);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim()) return toast.error('Please add some content');
    if (!user) return toast.error('Please sign in');
    try {
      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote.id), { title: title.trim() || 'Untitled', content: content.trim(), updatedAt: serverTimestamp() });
        toast.success('Note updated');
      } else {
        await addDoc(collection(db, 'notes'), { title: title.trim() || 'Untitled', content: content.trim(), createdAt: serverTimestamp(), updatedAt: serverTimestamp(), userId: user.uid });
        toast.success('Note created');
      }
      resetEditor();
    } catch (error) { toast.error('Failed to save note'); }
  };

  const resetEditor = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setShowEditor(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowEditor(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Delete this note?')) {
      try {
        await deleteDoc(doc(db, 'notes', id));
        toast.success('Note deleted');
      } catch (error) { toast.error('Failed to delete note'); }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success('Signed out');
  };

  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) || note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    try {
      let d = date?.toDate ? date.toDate() : date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
      if (isNaN(d.getTime())) return 'Recently';
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const noteDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (noteDate.getTime() === today.getTime()) return 'Today';
      if (noteDate.getTime() === yesterday.getTime()) return 'Yesterday';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return 'Recently'; }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-gray-600 dark:text-gray-300">Loading...</div></div>;
  if (!user) return <Auth onAuthSuccess={() => {}} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-all duration-300">
      <Toaster position="top-right" />
      <ReminderModal isOpen={showReminderModal} onClose={() => { setShowReminderModal(false); setSelectedNoteForReminder(null); }} noteId={selectedNoteForReminder?.id || ''} noteTitle={selectedNoteForReminder?.title || ''} />
      
      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Noteify" className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}>
                  <LayoutGrid size={16} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}>
                  <List size={16} />
                </button>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={handleSignOut} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Notes</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{notes.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-gray-300" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Notes</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{notes.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all" 
            />
          </div>
          <button onClick={() => setShowEditor(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105">
            <Plus size={18} />
            New Note
          </button>
        </div>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlignLeft className="text-gray-400 dark:text-gray-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{searchTerm ? 'No results found' : 'No notes yet'}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{searchTerm ? 'Try adjusting your search' : 'Create your first note'}</p>
            {!searchTerm && <button onClick={() => setShowEditor(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl font-medium hover:shadow-lg transition-all"><Plus size={16} />Create Note</button>}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredNotes.map((note) => (
              <div key={note.id} className={`group bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer ${viewMode === 'list' ? 'flex items-center justify-between p-4' : 'p-5'}`}>
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold text-gray-800 dark:text-white ${viewMode === 'list' ? 'text-base' : 'text-lg'} flex-1 line-clamp-2`}>
                      {note.title || 'Untitled'}
                    </h3>
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={() => { setSelectedNoteForReminder(note); setShowReminderModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all" title="Set reminder">
                        <Bell size={14} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                      </button>
                      <button onClick={() => handleEditNote(note)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all" title="Edit note">
                        <Edit2 size={14} className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400" />
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all" title="Delete note">
                        <Trash2 size={14} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">{note.content || 'No content'}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <Clock size={12} />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
                {viewMode === 'list' && <ArrowRight size={16} className="text-gray-400 dark:text-gray-600 ml-4 opacity-0 group-hover:opacity-100 transition-all" />}
              </div>
            ))}
          </div>
        )}

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl border-b border-gray-200 dark:border-gray-800 p-5 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{editingNote ? 'Edit Note' : 'New Note'}</h2>
                <button onClick={resetEditor} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><X size={20} className="text-gray-500 dark:text-gray-400" /></button>
              </div>
              <div className="p-6">
                <input 
                  type="text" 
                  placeholder="Title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full mb-5 px-0 py-2 bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-400 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none text-xl font-medium transition-all" 
                  autoFocus 
                />
                <textarea 
                  placeholder="Write your note here..." 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  rows={14} 
                  className="w-full mb-6 px-0 py-2 bg-transparent text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none leading-relaxed" 
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button onClick={resetEditor} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                  <button onClick={handleSaveNote} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl font-medium hover:shadow-lg transition-all"><Save size={18} />Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;