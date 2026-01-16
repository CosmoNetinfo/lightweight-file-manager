import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Folder, File, Home, HardDrive, Image, FileText, Music, Video, 
  Archive, Code, ChevronRight, ChevronLeft, Search, Grid, List, 
  Download, Trash2, FolderPlus, FilePlus, Copy, RefreshCw, Scissors,
  Star, Clock, Settings, MoreVertical, X, Info, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// utility for tailwind classes
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
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);

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
        { name: 'Vacanze_2025.jpg', type: 'file', size: '4.2 MB', date: '10/01/2026' },
        { name: 'Logo_Aziendale.png', type: 'file', size: '850 KB', date: '12/01/2026' },
        { name: 'Skyline.jpg', type: 'file', size: '3.1 MB', date: '14/01/2026' }
      ]
    }
  };

  const [fileSystem, setFileSystem] = useState(initialFileSystem);

  const getFileIcon = (name, type) => {
    if (type === 'folder' || type === 'drive') return <Folder className="w-10 h-10 text-amber-400 fill-amber-400/20" />;
    
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

    // 1. Handle External Files (from OS)
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
        
        if (!newFS[destPath]) {
          newFS[destPath] = { type: 'folder', children: [] };
        }
        newFS[destPath].children = [...newFS[destPath].children, ...newFiles];
        return newFS;
      });
      return;
    }

    // 2. Handle Internal Move
    const itemData = e.dataTransfer.getData('item');
    const sourcePath = e.dataTransfer.getData('sourcePath');
    
    if (!itemData || !sourcePath) return;
    
    const draggedItem = JSON.parse(itemData);
    const targetPath = targetFolderItem 
      ? `${currentPath}${targetFolderItem.name}\\\\`
      : null; // Null if dropped on empty space in current directory (no move)

    if (!targetPath || targetPath === sourcePath || targetPath === sourcePath + draggedItem.name + '\\\\') return;

    setFileSystem(prev => {
      const newFS = { ...prev };
      
      // Remove from source
      newFS[sourcePath].children = newFS[sourcePath].children.filter(i => i.name !== draggedItem.name);
      
      // Add to target
      if (!newFS[targetPath]) {
        newFS[targetPath] = { type: 'folder', children: [] };
      }
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

  // components
  const Breadcrumbs = () => {
    const parts = currentPath.split('\\\\').filter(p => p);
    return (
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        <button 
          onClick={() => navigateTo('C:\\\\')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <HardDrive className="w-4 h-4" />
          <span className="text-sm font-medium whitespace-nowrap">Disco Locale (C:)</span>
        </button>
        {parts.slice(1).map((part, i) => (
          <React.Fragment key={i}>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <button 
              onClick={() => {
                const newPath = 'C:\\\\' + parts.slice(1, i + 2).join('\\\\') + '\\\\';
                navigateTo(newPath);
              }}
              className="px-2 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors text-sm font-medium whitespace-nowrap"
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">CosmoNav</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">File Explorer</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          <section>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Favoriti</p>
            <div className="space-y-1">
              {[
                { name: 'Desktop', icon: Home, path: 'C:\\\\Desktop\\\\' },
                { name: 'Download', icon: Download, path: 'C:\\\\Download\\\\' },
                { name: 'Recenti', icon: Clock, path: 'C:\\\\' },
                { name: 'Preferiti', icon: Star, path: 'C:\\\\' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                    item.path === currentPath ? "bg-sky-50 text-sky-600 font-semibold" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", item.path === currentPath ? "text-sky-500" : "text-slate-400")} />
                  {item.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cartelle</p>
            <div className="space-y-1">
              {[
                { name: 'Documenti', icon: FileText, path: 'C:\\\\Documenti\\\\' },
                { name: 'Immagini', icon: Image, path: 'C:\\\\Immagini\\\\' },
                { name: 'Video', icon: Video, path: 'C:\\\\Video\\\\' },
                { name: 'Musica', icon: Music, path: 'C:\\\\Musica\\\\' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                    item.path === currentPath ? "bg-sky-50 text-sky-600 font-semibold" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", item.path === currentPath ? "text-sky-500" : "text-slate-400")} />
                  {item.name}
                </button>
              ))}
            </div>
          </section>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4" />
            Impostazioni
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col relative overflow-hidden bg-white"
        onDragOver={(e) => { e.preventDefault(); setIsExternalDragOver(true); }}
        onDragLeave={() => setIsExternalDragOver(false)}
        onDrop={(e) => handleDrop(e, null)}
      >
        {/* External Drag Overlay */}
        <AnimatePresence>
          {isExternalDragOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-sky-500/10 backdrop-blur-sm border-4 border-dashed border-sky-500 m-4 rounded-3xl flex flex-col items-center justify-center pointer-events-none"
            >
              <UploadCloud className="w-16 h-16 text-sky-500 mb-4 animate-bounce" />
              <p className="text-xl font-bold text-sky-600">Rilascia per caricare i file qui</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header/Toolbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={goBack} 
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
                disabled={historyIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={goForward} 
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
                disabled={historyIndex === history.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button onClick={goUp} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <FolderPlus className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="flex-1 bg-slate-100/50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 overflow-hidden">
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="text"
                placeholder="Cerca file o cartelle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all outline-none"
              />
            </div>
            
            <div className="flex items-center bg-slate-100 p-1 rounded-lg shadow-inner">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-sky-500" : "text-slate-400")}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white shadow-sm text-sky-500" : "text-slate-400")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Browser Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {currentPath.split('\\\\').filter(Boolean).pop() || 'Disco Locale'}
                <span className="ml-3 text-sm font-normal text-slate-400">{currentItems.length} oggetti</span>
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-200">
                  <FolderPlus className="w-4 h-4" />
                  Nuova Cartella
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPath + viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                    : "flex flex-col space-y-1"
                )}
              >
                {currentItems.map((item) => {
                  const isSelected = selectedItems.some(i => i.name === item.name);
                  const isHoveredAsDropTarget = dragOverItem === item.name;
                  
                  if (viewMode === 'grid') {
                    return (
                      <motion.div
                        key={item.name}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragOver={(e) => handleDragOver(e, item)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, item)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => handleItemSelect(item, e)}
                        onDoubleClick={() => handleItemClick(item)}
                        className={cn(
                          "group relative flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all duration-300",
                          isSelected 
                            ? "bg-sky-50 ring-2 ring-sky-500/20" 
                            : "hover:bg-slate-50 border border-transparent hover:border-slate-100",
                          isHoveredAsDropTarget && "bg-sky-100 ring-2 ring-sky-500 scale-105"
                        )}
                      >
                        <div className="mb-4 relative">
                          {getFileIcon(item.name, item.type)}
                          <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white rounded-full p-1 shadow-md border border-slate-100">
                              <MoreVertical className="w-3 h-3 text-slate-400" />
                            </div>
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-semibold text-center break-words w-full px-2 line-clamp-2 transition-colors",
                          isSelected ? "text-sky-600" : "text-slate-600"
                        )}>
                          {item.name}
                        </span>
                        {item.size !== '--' && (
                          <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">{item.size}</span>
                        )}
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={item.name}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragOver={(e) => handleDragOver(e, item)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, item)}
                      whileHover={{ x: 4 }}
                      onClick={(e) => handleItemSelect(item, e)}
                      onDoubleClick={() => handleItemClick(item)}
                      className={cn(
                        "grid grid-cols-[1fr_150px_150px_100px] gap-4 items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200",
                        isSelected ? "bg-sky-50 border-l-4 border-sky-500" : "hover:bg-slate-50 border-l-4 border-transparent",
                        isHoveredAsDropTarget && "bg-sky-100 ring-1 ring-sky-500"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {React.cloneElement(getFileIcon(item.name, item.type), { className: "w-5 h-5" })}
                        </div>
                        <span className={cn("text-sm font-medium", isSelected ? "text-sky-600" : "text-slate-700")}>{item.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-tight">{item.type}</span>
                      <span className="text-xs text-slate-400 font-semibold text-right uppercase tracking-tight">{item.size}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {currentItems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-slate-300"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 transition-all hover:bg-slate-100">
                  <Folder className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-sm font-medium">Cartella vuota</p>
              </motion.div>
            )}
          </div>

          {/* Details Sidebar (Optional) */}
          <AnimatePresence>
            {(selectedItems.length > 0 || showDetails) && (
              <motion.div
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                className="w-80 bg-white border-l border-slate-200 p-6 shadow-2xl z-10"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-slate-800">Dettagli</h3>
                  <button onClick={() => setSelectedItems([])} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedItems.length === 1 ? (
                  <div className="space-y-8">
                    <div className="flex flex-col items-center py-6 bg-slate-50 rounded-2xl">
                      {getFileIcon(selectedItems[0].name, selectedItems[0].type)}
                      <p className="mt-4 font-bold text-slate-800 text-center px-4">{selectedItems[0].name}</p>
                      <p className="text-xs font-bold text-sky-500 mt-1 uppercase tracking-tight">{selectedItems[0].type}</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Dimensione', value: selectedItems[0].size },
                        { label: 'Creato il', value: selectedItems[0].date },
                        { label: 'Tipo', value: selectedItems[0].name.split('.').pop().toUpperCase() || 'Cartella' },
                        { label: 'Percorso', value: currentPath },
                      ].map(row => (
                        <div key={row.label} className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                          <span className="text-sm font-semibold text-slate-700 break-all">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">
                        <Copy className="w-4 h-4" /> Copia
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors">
                        <Trash2 className="w-4 h-4" /> Elimina
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <Info className="w-12 h-12 opacity-10 mb-4" />
                    <p className="text-sm font-medium">{selectedItems.length} elementi selezionati</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <footer className="bg-slate-50 border-t border-slate-200 px-6 py-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>{currentItems.length} Oggetti</span>
            <span className="text-slate-300">|</span>
            <span>{selectedItems.length} Selezionati</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sky-500">Storage: 450 GB Liberi di 1 TB</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
