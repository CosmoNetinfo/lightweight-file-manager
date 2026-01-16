import React, { useState, useCallback, useMemo } from 'react';
import { Folder, File, Home, HardDrive, Image, FileText, Music, Video, Archive, Code, ChevronRight, ChevronLeft, Search, Grid, List, Download, Trash2, FolderPlus, FilePlus, Copy, RefreshCw, Scissors } from 'lucide-react';

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState('C:\\\\');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState(['C:\\\\']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const fileSystem = useMemo(() => ({
    'C:\\\\': {
      type: 'drive',
      children: ['Users', 'Program Files', 'Windows', 'Desktop', 'Documents', 'Downloads', 'Pictures', 'Videos', 'Music']
    },
    'C:\\\\Users': {
      type: 'folder',
      children: ['User1', 'Public', 'Default']
    },
    'C:\\\\Documents': {
      type: 'folder',
      children: ['Report.docx', 'Presentation.pptx', 'Budget.xlsx', 'Notes.txt']
    },
    'C:\\\\Downloads': {
      type: 'folder',
      children: ['setup.exe', 'photo.jpg', 'document.pdf', 'archive.zip']
    },
    'C:\\\\Pictures': {
      type: 'folder',
      children: ['vacation.jpg', 'family.png', 'landscape.jpg']
    },
    'C:\\\\Videos': {
      type: 'folder',
      children: ['movie.mp4', 'tutorial.avi']
    },
    'C:\\\\Music': {
      type: 'folder',
      children: ['song1.mp3', 'song2.wav', 'album']
    }
  }), []);

  const getFileIcon = useCallback((name) => {
    const ext = name.split('.').pop().toLowerCase();
    const iconClass = "w-8 h-8";
    
    if (fileSystem[currentPath + name]) return <Folder className={` text-yellow-500`} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <Image className={` text-blue-500`} />;
    if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) return <Video className={` text-purple-500`} />;
    if (['mp3', 'wav', 'flac'].includes(ext)) return <Music className={` text-pink-500`} />;
    if (['zip', 'rar', '7z'].includes(ext)) return <Archive className={` text-orange-500`} />;
    if (['txt', 'doc', 'docx', 'pdf'].includes(ext)) return <FileText className={` text-gray-600`} />;
    if (['js', 'py', 'java', 'cpp', 'html', 'css'].includes(ext)) return <Code className={` text-green-600`} />;
    
    return <File className={` text-gray-500`} />;
  }, [currentPath, fileSystem]);

  const currentItems = useMemo(() => {
    const current = fileSystem[currentPath];
    if (!current) return [];
    
    const query = searchQuery.toLowerCase();
    return query ? current.children.filter(item => item.toLowerCase().includes(query)) : current.children;
  }, [currentPath, searchQuery, fileSystem]);

  const navigateTo = useCallback((path) => {
    if (fileSystem[path]) {
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

  const handleItemClick = useCallback((item) => {
    const fullPath = currentPath + item;
    if (fileSystem[fullPath]) {
      navigateTo(fullPath + '\\\\');
    }
  }, [currentPath, fileSystem, navigateTo]);

  const handleItemSelect = useCallback((item, e) => {
    if (e.ctrlKey) {
      setSelectedItems(prev => 
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      );
    } else {
      setSelectedItems([item]);
    }
  }, []);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedItems([]);
    }
  }, [historyIndex, history]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setCurrentPath(history[historyIndex + 1]);
      setSelectedItems([]);
    }
  }, [historyIndex, history]);

  const goUp = useCallback(() => {
    const parts = currentPath.split('\\\\').filter(p => p);
    if (parts.length > 1) {
      parts.pop();
      navigateTo(parts.join('\\\\') + '\\\\');
    }
  }, [currentPath, navigateTo]);

  const quickAccess = useMemo(() => [
    { name: 'Desktop', path: 'C:\\\\Desktop', icon: Home },
    { name: 'Documenti', path: 'C:\\\\Documents', icon: FileText },
    { name: 'Download', path: 'C:\\\\Downloads', icon: Download },
    { name: 'Immagini', path: 'C:\\\\Pictures', icon: Image },
    { name: 'Video', path: 'C:\\\\Videos', icon: Video },
    { name: 'Musica', path: 'C:\\\\Music', icon: Music },
  ], []);

  const FileItem = useCallback(({ item }) => {
    const isSelected = selectedItems.includes(item);
    
    return (
      <div
        onClick={(e) => handleItemSelect(item, e)}
        onDoubleClick={() => handleItemClick(item)}
        className={`flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ``}
      >
        {getFileIcon(item)}
        <p className="mt-2 text-sm text-center break-words w-full">{item}</p>
      </div>
    );
  }, [selectedItems, handleItemSelect, handleItemClick, getFileIcon]);

  const ListItem = useCallback(({ item }) => {
    const isFolder = fileSystem[currentPath + item];
    const isSelected = selectedItems.includes(item);
    
    return (
      <div
        onClick={(e) => handleItemSelect(item, e)}
        onDoubleClick={() => handleItemClick(item)}
        className={`grid grid-cols-[1fr_150px_100px] gap-4 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ``}
      >
        <div className="flex items-center gap-2">
          {getFileIcon(item)}
          <span className="text-sm">{item}</span>
        </div>
        <div className="text-sm text-gray-600">
          {isFolder ? 'Cartella' : 'File'}
        </div>
        <div className="text-sm text-gray-600">
          {isFolder ? '--' : '1.2 MB'}
        </div>
      </div>
    );
  }, [currentPath, fileSystem, selectedItems, handleItemSelect, handleItemClick, getFileIcon]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            File Manager
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 px-2 mb-2">ACCESSO RAPIDO</p>
            {quickAccess.map(({ name, path, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigateTo(path)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-gray-100 ``}
              >
                <Icon className="w-4 h-4" />
                {name}
              </button>
            ))}
          </div>
          
          <div>
            <p className="text-xs font-semibold text-gray-500 px-2 mb-2">DISPOSITIVI</p>
            <button
              onClick={() => navigateTo('C:\\\\')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-gray-100 ``}
            >
              <HardDrive className="w-4 h-4" />
              Disco locale (C:)
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-2 flex items-center gap-2">
          <button
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Indietro"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Avanti"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={goUp} className="p-2 rounded hover:bg-gray-100" title="Cartella superiore">
            <Folder className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentPath(currentPath)} className="p-2 rounded hover:bg-gray-100" title="Aggiorna">
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-1" />
          
          <button className="p-2 rounded hover:bg-gray-100" title="Nuovo file">
            <FilePlus className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Nuova cartella">
            <FolderPlus className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-1" />
          
          <button className="p-2 rounded hover:bg-gray-100" title="Copia">
            <Copy className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Taglia">
            <Scissors className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Elimina">
            <Trash2 className="w-5 h-5" />
          </button>
          
          <div className="flex-1" />
          
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ``}
            title="Vista griglia"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ``}
            title="Vista lista"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1 bg-gray-100 rounded px-3 py-2">
            <HardDrive className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">{currentPath}</span>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {currentItems.map(item => <FileItem key={item} item={item} />)}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="grid grid-cols-[1fr_150px_100px] gap-4 px-4 py-2 border-b border-gray-200 font-semibold text-sm text-gray-600">
                <div>Nome</div>
                <div>Tipo</div>
                <div>Dimensione</div>
              </div>
              {currentItems.map(item => <ListItem key={item} item={item} />)}
            </div>
          )}
          
          {currentItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Folder className="w-16 h-16 mb-2" />
              <p>Nessun elemento da visualizzare</p>
            </div>
          )}
        </div>

        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
          <span>{currentItems.length} elementi</span>
          <span>{selectedItems.length} selezionati</span>
        </div>
      </div>
    </div>
  );
}
