import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  Folder, File, Home, HardDrive, Image, FileText, Music, Video, 
  Archive, Code, ChevronRight, ChevronLeft, Search, Grid, List, 
  Download, Trash2, FolderPlus, FilePlus, Copy, RefreshCw, Scissors,
  Star, Clock, Settings, MoreVertical, X, Info, UploadCloud,
  Moon, Sun, Edit3, Share2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState('C:\\\\');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState(['C:\\\\']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const containerRef = useRef(null);

  // Initial Mock File System
  const initialFileSystem = {
    'C:\\\\': {
      type: 'drive',
      children: [
        { name: 'Utenti', type: 'folder', size: '--', date: '12/01/2026' },
        { name: 'Programmi', type: 'folder', size: '--', date: '10/01/2026' },
        { name: 'Windows', type: 'folder', size: '--', date: '05/01/2026' },
        { name: 'Desktop', type: 'folder', size: '--', date: '15/01/2026' },
        { name: 'Documenti', type: 'folder', size: '--', date: '14/01/2026' },
        { name: 'Download', type: 'folder', size: '--', date: '16/01/2026' },
        { name: 'Immagini', type: 'folder', size: '--', date: '13/01/2026' },
        { name: 'Video', type: 'folder', size: '--', date: '11/01/2026' },
        { name: 'Musica', type: 'folder', size: '--', date: '09/01/2026' }
      ]
    },
    'C:\\\\Utenti\\\\': {
      type: 'folder',
      children: [
        { name: 'Admin', type: 'folder', size: '--', date: '16/01/2026' },
        { name: 'Pubblica', type: 'folder', size: '--', date: '01/01/2026' }
      ]
    },
    'C:\\\\Documenti\\\\': {
      type: 'folder',
      children: [
        { name: 'Progetto_Finale.pdf', type: 'file', size: '2.4 MB', date: '15/01/2026' },
        { name: 'Bilancio_2025.xlsx', type: 'file', size: '1.1 MB', date: '14/01/2026' },
        { name: 'Note_Meeting.txt', type: 'file', size: '45 KB', date: '16/01/2026' },
        { name: 'Presentazione.pptx', type: 'file', size: '12.8 MB', date: '13/01/2026' }
      ]
    },
    'C:\\\\Immagini\\\\': {
      type: 'folder',
      children: [
        { name: 'Vacanze_2025.jpg', type: 'file', size: '4.2 MB', date: '10/01/2026', preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
        { name: 'Logo_Aziendale.png', type: 'file', size: '850 KB', date: '12/01/2026', preview: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80' },
        { name: 'Skyline.jpg', type: 'file', size: '3.1 MB', date: '14/01/2026', preview: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80' }
      ]
    }
  };

  const [fileSystem, setFileSystem] = useState(initialFileSystem);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedItems.length > 0) {
        if (e.key === 'Enter') {
          handleItemClick(selectedItems[0]);
        }
        if (e.key === 'Delete') {
          handleDeleteItems();
        }
      }
      if (e.key === 'Backspace' && historyIndex > 0) {
        goBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems, historyIndex]);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const getFileIcon = (name, type) => {
    if (type === 'folder' || type === 'drive') {
      return (
        <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
          <img 
            src="/folder.png" 
            alt="Folder" 
            className={cn(
              "w-full h-full object-contain transition-all duration-500",
              isDarkMode 
                ? "invert hue-rotate-180 mix-blend-screen brightness-125 contrast-125" 
                : "mix-blend-multiply"
            )} 
          />
        </div>
      );
    }
    
    const ext = name.split('.').pop().toLowerCase();
    const baseClass = "w-10 h-10";
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return <Image className={cn(baseClass, "text-rose-500")} />;
    if (['mp4', 'avi', 'mov'].includes(ext)) return <Video className={cn(baseClass, "text-purple-500")} />;
    if (['mp3', 'wav'].includes(ext)) return <Music className={cn(baseClass, "text-pink-500")} />;
    if (['zip', 'rar', '7z'].includes(ext)) return <Archive className={cn(baseClass, "text-orange-500")} />;
    if (['pdf', 'doc', 'docx', 'xlsx', 'txt'].includes(ext)) return <FileText className={cn(baseClass, "text-blue-500")} />;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'json'].includes(ext)) return <Code className={cn(baseClass, "text-emerald-500")} />;
    
    return <File className={cn(baseClass, "text-slate-400")} />;
  };

  const currentItems = useMemo(() => {
    const current = fileSystem[currentPath] || { children: [] };
    const query = searchQuery.toLowerCase();
    return query 
      ? current.children.filter(item => item.name.toLowerCase().includes(query))
      : current.children;
  }, [currentPath, searchQuery, fileSystem]);

  const navigateTo = useCallback((path) => {
    if (fileSystem[path] || path === 'C:\\\\') {
      setCurrentPath(path);
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(path);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
      setSelectedItems([]);
    }
  }, [fileSystem, historyIndex]);

  const handleItemClick = (item) => {
    if (item.type === 'folder' || item.type === 'drive') {
      const separator = currentPath.endsWith('\\\\') ? '' : '\\\\';
      navigateTo(`${currentPath}${separator}${item.name}\\\\`);
    }
  };

  const handleItemSelect = (item, e) => {
    e.stopPropagation();
    if (e.ctrlKey) {
      setSelectedItems(prev => 
        prev.some(i => i.name === item.name) 
          ? prev.filter(i => i.name !== item.name) 
          : [...prev, item]
      );
    } else {
      setSelectedItems([item]);
    }
  };

  const handleContextMenu = (e, item = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (item && !selectedItems.some(i => i.name === item.name)) {
      setSelectedItems([item]);
    }
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      target: item
    });
  };

  const handleDeleteItems = () => {
    const namesToDelete = selectedItems.map(i => i.name);
    setFileSystem(prev => {
      const newFS = { ...prev };
      newFS[currentPath].children = newFS[currentPath].children.filter(i => !namesToDelete.includes(i.name));
      return newFS;
    });
    setSelectedItems([]);
    setContextMenu(null);
  };

  // Selection Rectangle logic
  const handleMouseDown = (e) => {
    if (e.button !== 0 || contextMenu) return;
    const container = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - container.left;
    const startY = e.clientY - container.top;
    
    setSelectionBox({ startX, startY, currentX: startX, currentY: startY });
    if (!e.ctrlKey) setSelectedItems([]);
  };

  const handleMouseMove = (e) => {
    if (!selectionBox) return;
    const container = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - container.left;
    const currentY = e.clientY - container.top;
    setSelectionBox(prev => ({ ...prev, currentX, currentY }));

    // Real-time selection logic
    const box = {
      left: Math.min(selectionBox.startX, currentX),
      top: Math.min(selectionBox.startY, currentY),
      right: Math.max(selectionBox.startX, currentX),
      bottom: Math.max(selectionBox.startY, currentY)
    };

    const items = document.querySelectorAll('.selectable-item');
    const newSelection = [];
    items.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elTop = rect.top - container.top;
      const elLeft = rect.left - container.left;
      const elBottom = rect.bottom - container.top;
      const elRight = rect.right - container.left;

      if (!(elLeft > box.right || elRight < box.left || elTop > box.bottom || elBottom < box.top)) {
        const itemName = el.getAttribute('data-name');
        const item = currentItems.find(i => i.name === itemName);
        if (item) newSelection.push(item);
      }
    });
    setSelectedItems(newSelection);
  };

  const handleMouseUp = () => {
    setSelectionBox(null);
  };

  // Drag and Drop Logic
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('item', JSON.stringify(item));
    e.dataTransfer.setData('sourcePath', currentPath);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    if (item && (item.type === 'folder' || item.type === 'drive')) {
      setDragOverItem(item.name);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, targetFolderItem) => {
    e.preventDefault();
    setDragOverItem(null);
    setIsExternalDragOver(false);

    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newFiles = files.map(file => ({
        name: file.name,
        type: 'file',
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        date: new Date().toLocaleDateString()
      }));

      setFileSystem(prev => {
        const newFS = { ...prev };
        const destPath = targetFolderItem 
          ? `${currentPath}${targetFolderItem.name}\\\\`
          : currentPath;
        
        if (!newFS[destPath]) newFS[destPath] = { type: 'folder', children: [] };
        newFS[destPath].children = [...newFS[destPath].children, ...newFiles];
        return newFS;
      });
      return;
    }

    const itemData = e.dataTransfer.getData('item');
    const sourcePath = e.dataTransfer.getData('sourcePath');
    if (!itemData || !sourcePath) return;
    
    const draggedItem = JSON.parse(itemData);
    const targetPath = targetFolderItem ? `${currentPath}${targetFolderItem.name}\\\\` : null;
    if (!targetPath || targetPath === sourcePath) return;

    setFileSystem(prev => {
      const newFS = { ...prev };
      newFS[sourcePath].children = newFS[sourcePath].children.filter(i => i.name !== draggedItem.name);
      if (!newFS[targetPath]) newFS[targetPath] = { type: 'folder', children: [] };
      newFS[targetPath].children = [...newFS[targetPath].children, draggedItem];
      return newFS;
    });
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedItems([]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setCurrentPath(history[historyIndex + 1]);
      setSelectedItems([]);
    }
  };

  const goUp = () => {
    const parts = currentPath.split('\\\\').filter(p => p);
    if (parts.length > 1) {
      parts.pop();
      navigateTo(parts.join('\\\\') + '\\\\');
    } else if (parts.length === 1 && currentPath !== 'C:\\\\') {
      navigateTo('C:\\\\');
    }
  };

  return (
    <div className={cn(
      "flex h-screen overflow-hidden transition-colors duration-500",
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className={cn(
          "w-64 border-r flex flex-col z-20 backdrop-blur-xl",
          isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border transition-all duration-500",
            isDarkMode ? "bg-slate-800 border-slate-700 shadow-sky-500/20" : "bg-white border-slate-100 shadow-sky-100"
          )}>
            <img 
              src="/logo.png" 
              alt="CosmoNav Logo" 
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                isDarkMode ? "invert hue-rotate-180 mix-blend-screen brightness-125" : "mix-blend-multiply"
              )} 
            />
          </div>
          <div>
            <h1 className="font-bold leading-tight">CosmoNav</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Deep Space Explorer</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          <section>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Favoriti</p>
            <div className="space-y-1">
              {[
                { name: 'Desktop', icon: Home, path: 'C:\\\\Desktop\\\\' },
                { name: 'Download', icon: Download, path: 'C:\\\\Download\\\\' },
                { name: 'Recenti', icon: Clock, path: 'C:\\\\' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                    item.path === currentPath 
                      ? (isDarkMode ? "bg-sky-500/20 text-sky-400 font-semibold" : "bg-sky-50 text-sky-600 font-semibold")
                      : (isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-50")
                  )}
                >
                  <item.icon className={cn("w-4 h-4", item.path === currentPath ? "text-sky-500" : "text-slate-400")} />
                  {item.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Cartelle</p>
            <div className="space-y-1">
              {[
                { name: 'Documenti', icon: FileText, path: 'C:\\\\Documenti\\\\' },
                { name: 'Immagini', icon: Image, path: 'C:\\\\Immagini\\\\' },
                { name: 'Video', icon: Video, path: 'C:\\\\Video\\\\' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                    item.path === currentPath 
                      ? (isDarkMode ? "bg-sky-500/20 text-sky-400 font-semibold" : "bg-sky-50 text-sky-600 font-semibold")
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", item.path === currentPath ? "text-sky-500" : "text-slate-400")} />
                  {item.name}
                </button>
              ))}
            </div>
          </section>
        </nav>

        <div className="p-4 border-t border-slate-800/10 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            {isDarkMode ? 'Tema Chiaro' : 'Tema Scuro'}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-4 h-4" />
            Impostazioni
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col relative overflow-hidden",
        isDarkMode ? "bg-slate-950" : "bg-white"
      )}>
        {/* Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className={cn(
                "fixed z-[100] w-56 p-1 rounded-2xl shadow-2xl border backdrop-blur-xl animate-scale-in",
                isDarkMode ? "bg-slate-900/90 border-slate-700 shadow-sky-500/10" : "bg-white/90 border-slate-200"
              )}
            >
              <div className="space-y-0.5">
                {[
                  { icon: ExternalLink, label: 'Apri', onClick: () => handleItemClick(contextMenu.target) },
                  { icon: Edit3, label: 'Rinomina', onClick: () => {} },
                  { icon: Copy, label: 'Copia', onClick: () => {} },
                  { icon: Scissors, label: 'Taglia', onClick: () => {} },
                  { icon: Share2, label: 'Condividi', onClick: () => {} },
                  { icon: Trash2, label: 'Elimina', color: 'text-rose-500', onClick: handleDeleteItems },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-700",
                      action.color
                    )}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <header className={cn(
          "backdrop-blur-md border-b px-6 py-3 flex items-center justify-between gap-4 z-10",
          isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center p-1 rounded-lg", isDarkMode ? "bg-slate-800" : "bg-slate-100")}>
              <button onClick={goBack} disabled={historyIndex === 0} className="p-1.5 rounded-md hover:bg-sky-500 hover:text-white transition-all disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-1.5 rounded-md hover:bg-sky-500 hover:text-white transition-all disabled:opacity-20"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button onClick={goUp} className="p-2 rounded-lg hover:bg-sky-500/10 transition-colors"><FolderPlus className="w-4 h-4" /></button>
          </div>

          <div className={cn(
            "flex-1 border rounded-xl px-3 py-1.5 flex items-center gap-2 overflow-hidden",
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100/50 border-slate-200"
          )}>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              <button onClick={() => navigateTo('C:\\\\')} className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-sky-500/20 text-slate-500 transition-colors"><HardDrive className="w-4 h-4" /><span className="text-sm font-medium">C:</span></button>
              {currentPath.split('\\\\').filter(p => p && p !== 'C:').map((part, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <button className="px-2 py-1 rounded-md hover:bg-sky-500/20 text-slate-500 text-sm font-medium">{part}</button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cerca nel cosmo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10 pr-4 py-2 rounded-xl text-sm w-64 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none",
                  isDarkMode ? "bg-slate-800 border-none text-white focus:bg-slate-700" : "bg-slate-100 border-none focus:bg-white"
                )}
              />
            </div>
            
            <div className={cn("flex items-center p-1 rounded-lg", isDarkMode ? "bg-slate-800" : "bg-slate-100")}>
              <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all uppercase text-[10px] font-bold px-3", viewMode === 'grid' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40" : "text-slate-500")}>Grid</button>
              <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-all uppercase text-[10px] font-bold px-3", viewMode === 'list' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40" : "text-slate-500")}>List</button>
            </div>
          </div>
        </header>

        {/* Browser Area */}
        <div 
          className="flex-1 flex overflow-hidden relative"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDrop={(e) => handleDrop(e, null)}
          onDragOver={(e) => { e.preventDefault(); setIsExternalDragOver(true); }}
          onDragLeave={() => setIsExternalDragOver(false)}
          onContextMenu={(e) => handleContextMenu(e)}
        >
          {/* Selection Rect */}
          {selectionBox && (
            <div 
              className="absolute z-50 bg-sky-500/20 border border-sky-500 rounded pointer-events-none"
              style={{
                left: Math.min(selectionBox.startX, selectionBox.currentX),
                top: Math.min(selectionBox.startY, selectionBox.currentY),
                width: Math.abs(selectionBox.startX - selectionBox.currentX),
                height: Math.abs(selectionBox.startY - selectionBox.currentY)
              }}
            />
          )}

          {/* External Drag Overlay */}
          <AnimatePresence>
            {isExternalDragOver && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] bg-sky-500/10 backdrop-blur-sm border-4 border-dashed border-sky-500 m-8 rounded-[40px] flex flex-col items-center justify-center pointer-events-none">
                <UploadCloud className="w-16 h-16 text-sky-500 mb-4 animate-bounce" />
                <p className="text-2xl font-bold text-sky-500">Into the Deep Space...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
            <div className="flex items-center justify-between mb-8 animate-in">
              <h2 className="text-2xl font-extrabold tracking-tight">
                {currentPath.split('\\\\').filter(Boolean).pop() || 'CosmoNav'}
                <span className="ml-4 text-xs font-bold text-sky-500 bg-sky-500/10 px-2 py-1 rounded-full">{currentItems.length} OGGETTI</span>
              </h2>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/20">
                <FolderPlus className="w-4 h-4" />Nuova Cartella
              </button>
            </div>

            <motion.div
              layout
              className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-8"
                  : "flex flex-col space-y-1"
              )}
            >
              {currentItems.map((item) => {
                const isSelected = selectedItems.some(i => i.name === item.name);
                const isHoveredAsDropTarget = dragOverItem === item.name;
                
                return (
                  <motion.div
                    key={item.name}
                    data-name={item.name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => handleDragOver(e, item)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    onClick={(e) => handleItemSelect(item, e)}
                    onDoubleClick={() => handleItemClick(item)}
                    className={cn(
                      "selectable-item group relative flex flex-col items-center justify-between transition-all duration-300 rounded-3xl cursor-pointer",
                      viewMode === 'grid' ? "p-4" : "flex-row px-6 py-3",
                      isSelected 
                        ? (isDarkMode ? "bg-sky-500/20 ring-2 ring-sky-500/50" : "bg-sky-50 ring-2 ring-sky-500/20") 
                        : (isDarkMode ? "hover:bg-slate-900" : "hover:bg-slate-50"),
                      isHoveredAsDropTarget && "bg-sky-500/30 scale-105"
                    )}
                  >
                    <div className={cn("relative", viewMode === 'grid' ? "mb-4" : "mr-4")}>
                      {getFileIcon(item.name, item.type)}
                      {isSelected && (
                        <motion.div layoutId="check" className="absolute -top-1 -right-1 bg-sky-500 rounded-full p-1 border-2 border-white dark:border-slate-950">
                          <ChevronRight className="w-2 h-2 text-white" />
                        </motion.div>
                      )}
                    </div>
                    
                    <div className={cn("text-center flex-1 min-w-0", viewMode === 'list' && "flex items-center text-left")}>
                      <span className={cn(
                        "text-xs font-bold truncate block",
                        isSelected ? "text-sky-500" : (isDarkMode ? "text-slate-300" : "text-slate-700")
                      )}>{item.name}</span>
                      {viewMode === 'list' && (
                        <>
                          <span className="ml-auto text-[10px] text-slate-500 uppercase font-black tracking-widest px-8">{item.date}</span>
                          <span className="w-24 text-[10px] text-slate-500 font-bold text-right uppercase">{item.size}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <AnimatePresence>
            {(selectedItems.length > 0) && (
              <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className={cn(
                "w-96 border-l p-8 shadow-2xl z-20 overflow-y-auto",
                isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"
              )}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black uppercase tracking-tighter text-lg">Hangar Dati</h3>
                  <button onClick={() => setSelectedItems([])} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
                </div>

                {selectedItems.length === 1 ? (
                  <div className="space-y-10 animate-fade-in">
                    <div className="flex flex-col items-center p-8 rounded-[40px] bg-sky-500/5 border border-sky-500/10 shadow-inner">
                      {selectedItems[0].preview ? (
                        <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl mb-6">
                          <img src={selectedItems[0].preview} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" alt="Preview" />
                        </div>
                      ) : getFileIcon(selectedItems[0].name, selectedItems[0].type)}
                      <p className="mt-6 font-black text-center text-xl tracking-tight leading-none truncate w-full">{selectedItems[0].name}</p>
                      <span className="mt-2 text-[10px] font-black text-sky-500 bg-sky-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{selectedItems[0].type}</span>
                    </div>

                    <div className="space-y-6">
                      {[
                        { label: 'Dimensione', value: selectedItems[0].size, icon: HardDrive },
                        { label: 'Creato il', value: selectedItems[0].date, icon: Clock },
                        { label: 'Percorso', value: currentPath, icon: Home },
                      ].map(row => (
                        <div key={row.label} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-sky-500/5 transition-colors">
                          <div className="bg-sky-500/10 p-2.5 rounded-xl"><row.icon className="w-4 h-4 text-sky-500" /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{row.label}</p>
                            <p className="text-sm font-bold truncate max-w-[200px]">{row.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-3xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95"><Copy className="w-4 h-4" /> Copia</button>
                      <button onClick={handleDeleteItems} className="flex items-center justify-center gap-2 px-6 py-4 rounded-3xl bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"><Trash2 className="w-4 h-4" /> Elimina</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center animate-pulse">
                    <div className="w-24 h-24 rounded-full bg-sky-500/10 flex items-center justify-center mb-6"><Info className="w-12 h-12 text-sky-500" /></div>
                    <p className="font-black uppercase tracking-widest text-sm mb-2">Multiselezione Attiva</p>
                    <p className="text-xs font-bold opacity-60">Hai selezionato {selectedItems.length} elementi.<br/>Cosa vuoi fare con questa flotta di dati?</p>
                    <button onClick={handleDeleteItems} className="mt-10 flex items-center gap-3 px-8 py-4 rounded-3xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 transition-transform"><Trash2 className="w-4 h-4" /> Elimina Flotta</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <footer className={cn(
          "border-t px-8 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]",
          isDarkMode ? "bg-slate-950 border-slate-900 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
        )}>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" /> Sistema Operativo</span>
            <span className="flex items-center gap-2 opacity-50"><Folder className="w-3 h-3" /> {currentItems.length} OGGETTI</span>
            {selectedItems.length > 0 && <span className="flex items-center gap-2 text-sky-500"><Star className="w-3 h-3" /> {selectedItems.length} SELEZIONATI</span>}
          </div>
          <div className="flex items-center gap-6">
            <span className="animate-pulse text-sky-500">Signal Strength: 100%</span>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <HardDrive className="w-3 h-3" /> 450 GB LIBERI / 1 TB
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
