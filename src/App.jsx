import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  Folder, File, Home, HardDrive, Image, FileText, Music, Video, 
  Archive, Code, ChevronRight, ChevronLeft, Search, Grid, List, 
  Download, Trash2, FolderPlus, FilePlus, Copy, RefreshCw, Scissors,
  Star, Clock, Settings, MoreVertical, X, Info, UploadCloud,
  Moon, Sun, Edit3, Share2, ExternalLink, Rocket, Plus, Eye, Tag,
  Filter, BarChart3, Bookmark, SplitSquareHorizontal, Maximize2,
  FileArchive, Palette, Zap, Check, Columns, FolderOpen, Split
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QuickPreviewModal, FolderStatsModal, BulkRenameModal } from './Modals';

const fs = window.require('fs');
const path = window.require('path');
const os = window.require('os');
const { shell, ipcRenderer } = window.require('electron');
const { execSync } = window.require('child_process');
const archiver = window.require('archiver');

const HOME_DIR = os.homedir();

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Utility per debouncing (ottimizzazione ricerca)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Tag colors disponibili
const TAG_COLORS = [
  { name: 'Rosso', value: 'red', bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/50' },
  { name: 'Arancione', value: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-500', border: 'border-orange-500/50' },
  { name: 'Giallo', value: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/50' },
  { name: 'Verde', value: 'green', bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/50' },
  { name: 'Blu', value: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500/50' },
  { name: 'Viola', value: 'purple', bg: 'bg-purple-500/20', text: 'text-purple-500', border: 'border-purple-500/50' },
  { name: 'Rosa', value: 'pink', bg: 'bg-pink-500/20', text: 'text-pink-500', border: 'border-pink-500/50' },
];

// Componente per catturare errori catastrofici
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-10 font-sans">
          <h1 className="text-4xl font-black text-rose-500 mb-4">CosmoNav si è fermato</h1>
          <p className="text-slate-400 mb-6 text-center">Si è verificato un errore durante l'inizializzazione del sistema.</p>
          <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-rose-300 w-full overflow-auto max-h-60">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-sky-500 rounded-full font-bold">Riavvia Sistema</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const FolderIcon = ({ colorScheme = 'blue', className }) => {
  const schemes = {
    red: { light: '#EC4A58', dark: '#C62828', back: '#B71C1C' },
    orange: { light: '#F47144', dark: '#E64A19', back: '#BF360C' },
    yellow: { light: '#F9A726', dark: '#F57F17', back: '#E65100' },
    green: { light: '#85C440', dark: '#558B2F', back: '#33691E' },
    teal: { light: '#29B89E', dark: '#00796B', back: '#004D40' },
    blue: { light: '#4FBBE5', dark: '#1976D2', back: '#0D47A1' },
    purple: { light: '#A081DB', dark: '#7B1FA2', back: '#4A148C' },
    pink: { light: '#D769AA', dark: '#AD1457', back: '#880E4F' },
    gray: { light: '#565E69', dark: '#37474F', back: '#263238' },
  };

  const scheme = schemes[colorScheme] || schemes.blue;

  return (
    <svg viewBox="0 0 100 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`folder-grad-${colorScheme}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: scheme.light, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: scheme.dark, stopOpacity: 1 }} />
        </linearGradient>
        <filter id="folder-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dx="0" dy="1" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Back Wall */}
      <rect x="5" y="15" width="90" height="60" rx="10" fill={scheme.back} />
      {/* Inner White Paper */}
      <rect x="12" y="10" width="76" height="20" rx="4" fill="white" fillOpacity="0.8" />
      {/* Front Wall with Tab */}
      <path 
        d="M5,25 L35,25 C38,25 40,27 42,32 L95,32 L95,75 C95,78 93,80 90,80 L10,80 C7,80 5,78 5,75 Z" 
        fill={`url(#folder-grad-${colorScheme})`} 
        filter="url(#folder-shadow)"
      />
      {/* Glass Highlight */}
      <path 
        d="M10,35 L40,35 C43,35 45,37 47,42 L90,42 L90,45 L10,38 Z" 
        fill="white" 
        fillOpacity="0.2"
      />
    </svg>
  );
};

const FOLDER_COLOR_MAP = {
  'Utenti': 'yellow',
  'Programmi': 'purple',
  'Windows': 'gray',
  'Desktop': 'red',
  'Documenti': 'blue',
  'Download': 'green',
  'Immagini': 'pink',
  'Video': 'teal',
  'Musica': 'orange',
  'Admin': 'blue',
  'Pubblica': 'teal',
};

const getFolderColor = (name) => {
  if (!name) return 'blue';
  return FOLDER_COLOR_MAP[name] || 'blue';
};

const DriveIcon = ({ className }) => (
  <svg viewBox="0 0 100 80" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="drive-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#64748b', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#334155', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="drive-led-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="drive-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
        <feOffset dx="0" dy="1" result="offsetblur" />
        <feMerge>
          <feMergeNode in="offsetblur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Body - Case Metallic */}
    <rect x="10" y="20" width="80" height="40" rx="6" fill="url(#drive-grad)" filter="url(#drive-shadow)" />
    {/* Detail Line */}
    <rect x="15" y="38" width="70" height="1" fill="#1e293b" fillOpacity="0.5" />
    {/* LED Light Pulse */}
    <rect x="78" y="48" width="6" height="2" rx="1" fill="url(#drive-led-grad)" className="animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
    {/* Glass Reflection Top */}
    <path d="M10,26 L90,26 L90,32 L10,36 Z" fill="white" fillOpacity="0.1" />
  </svg>
);

const LogoIcon = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#4FBBE5', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#1976D2', stopOpacity: 1 }} />
      </linearGradient>
      <radialGradient id="nebula-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style={{ stopColor: '#93c5fd', stopOpacity: 0.8 }} />
        <stop offset="50%" style={{ stopColor: '#1e40af', stopOpacity: 0.6 }} />
        <stop offset="100%" style={{ stopColor: '#1e1b4b', stopOpacity: 0.9 }} />
      </radialGradient>
    </defs>
    {/* Folder Body */}
    <rect x="10" y="25" width="80" height="60" rx="12" fill="url(#nebula-bg)" />
    {/* Nebula / Galaxy effect */}
    <g transform="translate(50,55) rotate(-30)">
      <ellipse cx="0" cy="0" rx="25" ry="10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
      <ellipse cx="0" cy="0" rx="15" ry="6" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="0" cy="0" r="4" fill="white" className="animate-pulse" />
    </g>
    {/* Folder Front Tab */}
    <path 
      d="M10,35 L40,35 C43,35 45,37 47,42 L90,42 L90,80 C90,83 88,85 85,85 L15,85 C12,85 10,83 10,80 Z" 
      fill="url(#logo-body-grad)" 
      fillOpacity="0.7"
    />
    {/* Shine / Highlight */}
    <path 
      d="M15,45 L45,45 C48,45 50,47 52,52 L85,52 L85,55 L15,48 Z" 
      fill="white" 
      fillOpacity="0.3" 
    />
  </svg>
);

export default function App() {
  return (
    <ErrorBoundary>
      <FileManager />
    </ErrorBoundary>
  );
}

const formatDate = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) {
    return '';
  }
};

function FileManager() {
  // Stati base
  const [currentPath, setCurrentPath] = useState('HOME');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState(['HOME']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const containerRef = useRef(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [systemPaths, setSystemPaths] = useState({});
  const [showSettings, setShowSettings] = useState(false);

  // ✨ NUOVE FEATURES
  // Tabs multipli
  const [tabs, setTabs] = useState([{ id: 1, path: 'HOME', name: 'Questo PC' }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [nextTabId, setNextTabId] = useState(2);

  // Dual Pane
  const [isDualPane, setIsDualPane] = useState(false);
  const [leftPane, setLeftPane] = useState({ path: 'HOME', items: [], selectedItems: [] });
  const [rightPane, setRightPane] = useState({ path: 'HOME', items: [], selectedItems: [] });
  const [activePane, setActivePane] = useState('left');

  // Quick Preview
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Clipboard Manager
  const [clipboard, setClipboard] = useState({ items: [], operation: null }); // operation: 'copy' | 'cut'

  // Bookmarks
  const [bookmarks, setBookmarks] = useState([]);

  // File Tags
  const [fileTags, setFileTags] = useState({}); // { fullPath: { tags: ['tag1'], color: 'red' } }
  const [showTagModal, setShowTagModal] = useState(false);

  // Bulk Rename
  const [showBulkRename, setShowBulkRename] = useState(false);
  const [bulkRenamePattern, setBulkRenamePattern] = useState('');

  // Statistiche
  const [showStats, setShowStats] = useState(false);
  const [folderStats, setFolderStats] = useState(null);

  // Filtri avanzati
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // all, folder, image, video, document, code, music, archive
    sizeMin: 0,
    sizeMax: Infinity,
    dateFrom: null,
    dateFrom: null,
    dateTo: null
  });

  // 💾 Info Drives per Footer
  const [drives, setDrives] = useState([]);

  // 📏 Resizable Columns
  const [columnWidths, setColumnWidths] = useState({ name: 400, date: 180, type: 120, size: 120 });
  const resizingRef = useRef(null); // { col: 'name', startX: 0, startWidth: 0 }

  const startResizing = useCallback((e, col) => {
    e.preventDefault();
    resizingRef.current = {
      col,
      startX: e.clientX,
      startWidth: columnWidths[col]
    };
    document.body.style.cursor = 'col-resize';
  }, [columnWidths]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;
      
      const { col, startX, startWidth } = resizingRef.current;
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimo 50px
      
      setColumnWidths(prev => ({
        ...prev,
        [col]: newWidth
      }));
    };

    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = null;
        document.body.style.cursor = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Debounced search per performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Recupera i percorsi nativi dal processo Main
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const paths = await ipcRenderer.invoke('get-system-paths');
        setSystemPaths(paths);
      } catch (e) {
        console.error("Errore recupero percorsi native:", e);
      }
    };
    fetchPaths();
  }, []);

  // Funzione per ottenere i dischi su Windows
  const getDrives = useCallback(() => {
    try {
      const stdout = execSync('wmic logicaldisk get name,volumename,size,freespace /format:csv').toString();
      const rows = stdout.split(/\r?\n/).filter(line => line.trim() !== '' && !line.includes('Node'));
      
      const drivesList = rows.map(line => {
        const cols = line.split(',');
        if (cols.length < 5) return null;
        
        const driveName = cols[2]?.trim();
        if (!driveName) return null;

        const totalBytes = parseInt(cols[3]) || 0; // Fix: Size è colonna 3, non 4
        const freeBytes = parseInt(cols[1]) || 0;
        const usedBytes = totalBytes - freeBytes;
        const label = cols[5]?.trim() || 'Disco Locale';
        
        const usedPercent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
        
        return {
          name: `${label} (${driveName})`,
          shortName: driveName,
          type: 'drive',
          totalSize: totalBytes > 0 ? (totalBytes / (1024 ** 3)).toFixed(0) + ' GB' : '--',
          freeSize: freeBytes > 0 ? (freeBytes / (1024 ** 3)).toFixed(1).replace('.', ',') + ' GB' : '--',
          usedPercent: Math.round(usedPercent),
          fullPath: driveName + '\\'
        };
      }).filter(Boolean);

      return drivesList.length > 0 ? drivesList : [{ name: 'Disco Locale (C:)', shortName: 'C:', type: 'drive', totalSize: '--', freeSize: '--', usedPercent: 0, fullPath: 'C:\\' }];
    } catch (e) {
      return [{ name: 'Disco Locale (C:)', shortName: 'C:', type: 'drive', totalSize: '--', freeSize: '--', usedPercent: 0, fullPath: 'C:\\' }];
    }
  }, []);

  const loadDirectory = useCallback((dirPath) => {
    if (!dirPath || dirPath === 'HOME') {
      setCurrentItems(getDrives());
      return;
    }

    try {
      if (!fs.existsSync(dirPath)) {
        setCurrentPath('HOME');
        return;
      }
      
      const files = fs.readdirSync(dirPath);
      const items = files.map(file => {
        try {
          const fullPath = path.join(dirPath, file);
          const stats = fs.statSync(fullPath);
          const isDir = stats.isDirectory();
          const ext = file.split('.').pop().toLowerCase();
          
          let preview = null;
          if (!isDir && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
            // In Electron con contextIsolation: false e nodeIntegration: true
            // possiamo usare il percorso file diretto (anche se non sempre ideale per sicurezza)
            preview = `file:///${fullPath.replace(/\\/g, '/')}`;
          }

          return {
            name: file,
            type: isDir ? 'folder' : 'file',
            size: isDir ? '--' : (stats.size / 1024 / 1024).toFixed(1) + ' MB',
            rawSize: stats.size,
            date: stats.mtime.toLocaleDateString('it-IT'),
            lastModified: stats.mtime,
            fullPath: fullPath,
            preview: preview,
            ext: ext
          };
        } catch (e) { return null; }
      }).filter(Boolean);
      setCurrentItems(items);
    } catch (error) {
      setCurrentPath('HOME');
    }
  }, [getDrives]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  // ========== NUOVE FUNZIONI UTILITY ==========
  
  // 📑 Gestione Tabs
  const createNewTab = useCallback((tabPath = 'HOME', tabName = null) => {
    const newTab = {
      id: nextTabId,
      path: tabPath,
      name: tabName || (tabPath === 'HOME' ? 'Questo PC' : tabPath.split(path.sep).filter(Boolean).pop())
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(prev => prev + 1);
    setCurrentPath(tabPath);
  }, [nextTabId]);

  const closeTab = useCallback((tabId) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (newTabs.length === 0) {
        return [{ id: nextTabId, path: 'HOME', name: 'Questo PC' }];
      }
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
        setCurrentPath(newTabs[newTabs.length - 1].path);
      }
      return newTabs;
    });
  }, [activeTabId, nextTabId]);

  const switchTab = useCallback((tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setCurrentPath(tab.path);
    }
  }, [tabs]);

  // 🔖 Gestione Bookmarks
  const addBookmark = useCallback((itemPath, itemName) => {
    setBookmarks(prev => {
      if (prev.some(b => b.path === itemPath)) return prev;
      return [...prev, { path: itemPath, name: itemName || itemPath.split(path.sep).filter(Boolean).pop() }];
    });
  }, []);

  const removeBookmark = useCallback((itemPath) => {
    setBookmarks(prev => prev.filter(b => b.path !== itemPath));
  }, []);

  // 📋 Clipboard Manager
  const copyToClipboard = useCallback(() => {
    setClipboard({ items: selectedItems, operation: 'copy' });
  }, [selectedItems]);

  const cutToClipboard = useCallback(() => {
    setClipboard({ items: selectedItems, operation: 'cut' });
  }, [selectedItems]);

  const pasteFromClipboard = useCallback(async () => {
    if (clipboard.items.length === 0 || currentPath === 'HOME') return;
    
    try {
      for (const item of clipboard.items) {
        const destPath = path.join(currentPath, item.name);
        
        if (clipboard.operation === 'copy') {
          if (item.type === 'folder') {
            fs.cpSync(item.fullPath, destPath, { recursive: true });
          } else {
            fs.copyFileSync(item.fullPath, destPath);
          }
        } else if (clipboard.operation === 'cut') {
          try {
            fs.renameSync(item.fullPath, destPath);
          } catch (err) {
            if (err.code === 'EXDEV') {
              // Fallback per spostamenti tra partizioni diverse
              if (item.type === 'folder') {
                fs.cpSync(item.fullPath, destPath, { recursive: true });
                fs.rmSync(item.fullPath, { recursive: true });
              } else {
                fs.copyFileSync(item.fullPath, destPath);
                fs.unlinkSync(item.fullPath);
              }
            } else {
              throw err;
            }
          }
        }
      }
      
      if (clipboard.operation === 'cut') {
        setClipboard({ items: [], operation: null });
      }
      
      loadDirectory(currentPath);
    } catch (e) {
      console.error('Errore paste:', e);
      alert('Errore durante l\'incolla: ' + e.message);
    }
  }, [clipboard, currentPath, loadDirectory]);

  // 💾 Compressione ZIP
  const compressFiles = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    try {
      const zipName = `Archive_${Date.now()}.zip`;
      const zipPath = path.join(currentPath, zipName);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        loadDirectory(currentPath);
        setSelectedItems([]);
      });
      
      archive.pipe(output);
      
      for (const item of selectedItems) {
        if (item.type === 'folder') {
          archive.directory(item.fullPath, item.name);
        } else {
          archive.file(item.fullPath, { name: item.name });
        }
      }
      
      await archive.finalize();
    } catch (e) {
      console.error('Errore compressione:', e);
    }
  }, [selectedItems, currentPath, loadDirectory]);

  // 📊 Calcolo Statistiche Cartella
  const calculateFolderStats = useCallback((dirPath) => {
    if (!dirPath || dirPath === 'HOME') return null;
    
    try {
      const stats = {
        totalFiles: 0,
        totalFolders: 0,
        totalSize: 0,
        byType: {
          images: { count: 0, size: 0 },
          videos: { count: 0, size: 0 },
          documents: { count: 0, size: 0 },
          music: { count: 0, size: 0 },
          archives: { count: 0, size: 0 },
          code: { count: 0, size: 0 },
          others: { count: 0, size: 0 }
        }
      };

      const scanDir = (dir) => {
        try {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            try {
              const fullPath = path.join(dir, file);
              const fileStat = fs.statSync(fullPath);
              
              if (fileStat.isDirectory()) {
                stats.totalFolders++;
                scanDir(fullPath);
              } else {
                stats.totalFiles++;
                stats.totalSize += fileStat.size;
                
                const ext = file.split('.').pop().toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
                  stats.byType.images.count++;
                  stats.byType.images.size += fileStat.size;
                } else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
                  stats.byType.videos.count++;
                  stats.byType.videos.size += fileStat.size;
                } else if (['pdf', 'doc', 'docx', 'xlsx', 'txt'].includes(ext)) {
                  stats.byType.documents.count++;
                  stats.byType.documents.size += fileStat.size;
                } else if (['mp3', 'wav', 'flac'].includes(ext)) {
                  stats.byType.music.count++;
                  stats.byType.music.size += fileStat.size;
                } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
                  stats.byType.archives.count++;
                  stats.byType.archives.size += fileStat.size;
                } else if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'json'].includes(ext)) {
                  stats.byType.code.count++;
                  stats.byType.code.size += fileStat.size;
                } else {
                  stats.byType.others.count++;
                  stats.byType.others.size += fileStat.size;
                }
              }
            } catch (e) { /* Skip inaccessible files */ }
          });
        } catch (e) { /* Skip inaccessible dirs */ }
      };

      scanDir(dirPath);
      return stats;
    } catch (e) {
      console.error('Errore calcolo stats:', e);
      return null;
    }
  }, []);

  // 📝 Bulk Rename
  const applyBulkRename = useCallback(() => {
    if (!bulkRenamePattern || selectedItems.length === 0) return;
    
    try {
      selectedItems.forEach((item, index) => {
        const ext = item.type === 'file' ? '.' + item.name.split('.').pop() : '';
        const newName = bulkRenamePattern
          .replace('{n}', (index + 1).toString())
          .replace('{name}', item.name.replace(ext, ''))
          .replace('{date}', new Date().toISOString().split('T')[0]) + ext;
        
        const newPath = path.join(currentPath, newName);
        fs.renameSync(item.fullPath, newPath);
      });
      
      loadDirectory(currentPath);
      setSelectedItems([]);
      setShowBulkRename(false);
      setBulkRenamePattern('');
    } catch (e) {
      console.error('Errore bulk rename:', e);
    }
  }, [bulkRenamePattern, selectedItems, currentPath, loadDirectory]);

  // 🎨 Tag Management
  const addTagToItem = useCallback((item, tag, color) => {
    setFileTags(prev => ({
      ...prev,
      [item.fullPath]: {
        tags: [...(prev[item.fullPath]?.tags || []), tag],
        color: color || prev[item.fullPath]?.color || 'blue'
      }
    }));
  }, []);

  const setItemColor = useCallback((item, color) => {
    setFileTags(prev => ({
      ...prev,
      [item.fullPath]: {
        ...prev[item.fullPath],
        color: color
      }
    }));
  }, []);

  // Keyboard Shortcuts

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Quick Preview con Spacebar
      if (e.key === ' ' && selectedItems.length === 1 && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setPreviewItem(selectedItems[0]);
        setShowPreview(true);
      }

      // Nuovo Tab - Ctrl+T
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        createNewTab();
      }

      // Chiudi Tab - Ctrl+W
      if (e.ctrlKey && e.key === 'w' && tabs.length > 1) {
        e.preventDefault();
        closeTab(activeTabId);
      }

      // Clipboard - Ctrl+C/X/V
      if (e.ctrlKey && e.key === 'c' && selectedItems.length > 0 && !e.target.matches('input, textarea')) {
        e.preventDefault();
        copyToClipboard();
      }
      if (e.ctrlKey && e.key === 'x' && selectedItems.length > 0 && !e.target.matches('input, textarea')) {
        e.preventDefault();
        cutToClipboard();
      }
      if (e.ctrlKey && e.key === 'v' && clipboard.items.length > 0 && !e.target.matches('input, textarea')) {
        e.preventDefault();
        pasteFromClipboard();
      }

      // Dual Pane - Ctrl+D
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setIsDualPane(!isDualPane);
      }

      // Bookmark - Ctrl+B
      if (e.ctrlKey && e.key === 'b' && currentPath !== 'HOME') {
        e.preventDefault();
        addBookmark(currentPath);
      }

      // Bulk Rename - Ctrl+R
      if (e.ctrlKey && e.key === 'r' && selectedItems.length > 1) {
        e.preventDefault();
        setShowBulkRename(true);
      }

      // Statistiche - Ctrl+I
      if (e.ctrlKey && e.key === 'i' && currentPath !== 'HOME') {
        e.preventDefault();
        const stats = calculateFolderStats(currentPath);
        setFolderStats(stats);
        setShowStats(true);
      }

      // Azioni su item selezionati
      if (selectedItems.length > 0) {
        if (e.key === 'Enter') {
          handleItemClick(selectedItems[0]);
        }
        if (e.key === 'Delete') {
          handleDeleteItems();
        }
        // F2 per rinominare
        if (e.key === 'F2' && selectedItems.length === 1) {
          e.preventDefault();
          const newName = prompt('Nuovo nome:', selectedItems[0].name);
          if (newName && newName !== selectedItems[0].name) {
            try {
              const newPath = path.join(currentPath, newName);
              fs.renameSync(selectedItems[0].fullPath, newPath);
              loadDirectory(currentPath);
              setSelectedItems([]);
            } catch (error) {
              alert('Errore nella rinomina: ' + error.message);
            }
          }
        }
      }
      
      // Chiudi Modali con ESC
      if (e.key === 'Escape') {
        if (showPreview) setShowPreview(false);
        if (showStats) setShowStats(false);
        if (showBulkRename) setShowBulkRename(false);
        if (showSettings) setShowSettings(false);
      }

      // Naviga indietro
      if (e.key === 'Backspace') {
        // Evita navigazione se stiamo scrivendo in un input
        if (e.target.matches('input, textarea') || e.target.isContentEditable) return;
        
        if (historyIndex > 0) {
          e.preventDefault();
          goBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems, historyIndex, showPreview, clipboard, isDualPane, tabs, activeTabId, currentPath, createNewTab, closeTab, copyToClipboard, cutToClipboard, pasteFromClipboard, addBookmark, calculateFolderStats, loadDirectory]);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const getFileIcon = (name, type, preview, item) => {
    if (type === 'folder' || type === 'drive') {
      const color = getFolderColor(name);
      return (
        <div className="w-10 h-10 flex items-center justify-center">
          {type === 'drive' ? (
            <DriveIcon className="w-full h-full drop-shadow-md" />
          ) : (
            <FolderIcon colorScheme={color} className="w-full h-full drop-shadow-md" />
          )}
        </div>
      );
    }
    
    const ext = name.split('.').pop().toLowerCase();
    const baseClass = "w-8 h-8";
    
    // Mostra miniatura per immagini
    if (preview && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return (
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700/50 shadow-md">
          <img 
            src={preview} 
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<svg className="w-8 h-8 text-rose-500">fallback</svg>';
            }}
          />
        </div>
      );
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return <Image className={cn(baseClass, "text-rose-500")} />;
    if (['mp4', 'avi', 'mov'].includes(ext)) return <Video className={cn(baseClass, "text-purple-500")} />;
    if (['mp3', 'wav'].includes(ext)) return <Music className={cn(baseClass, "text-pink-500")} />;
    if (['zip', 'rar', '7z'].includes(ext)) return <Archive className={cn(baseClass, "text-orange-500")} />;
    if (['pdf', 'doc', 'docx', 'xlsx', 'txt'].includes(ext)) return <FileText className={cn(baseClass, "text-blue-500")} />;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'json'].includes(ext)) return <Code className={cn(baseClass, "text-emerald-500")} />;
    
    return <File className={cn(baseClass, "text-slate-400")} />;
  };

  const filteredItems = useMemo(() => {
    let items = currentItems;

    // Filtro ricerca (debounced)
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(query));
    }

    // Filtro per tipo
    if (filters.type !== 'all') {
      items = items.filter(item => {
        if (filters.type === 'folder') return item.type === 'folder';
        if (filters.type === 'image') {
          const ext = (item.ext || '').toLowerCase();
          return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
        }
        if (filters.type === 'video') {
          const ext = (item.ext || '').toLowerCase();
          return ['mp4', 'avi', 'mov', 'mkv'].includes(ext);
        }
        if (filters.type === 'document') {
          const ext = (item.ext || '').toLowerCase();
          return ['pdf', 'doc', 'docx', 'xlsx', 'txt'].includes(ext);
        }
        if (filters.type === 'code') {
          const ext = (item.ext || '').toLowerCase();
          return ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'json'].includes(ext);
        }
        if (filters.type === 'music') {
          const ext = (item.ext || '').toLowerCase();
          return ['mp3', 'wav', 'flac'].includes(ext);
        }
        if (filters.type === 'archive') {
          const ext = (item.ext || '').toLowerCase();
          return ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
        }
        return true;
      });
    }

    // Filtro per dimensione
    if (filters.sizeMin > 0 || filters.sizeMax < Infinity) {
      items = items.filter(item => {
        if (item.type === 'folder') return true;
        const sizeInMB = item.rawSize / (1024 * 1024);
        return sizeInMB >= filters.sizeMin && sizeInMB <= filters.sizeMax;
      });
    }

    return items;
  }, [currentItems, debouncedSearch, filters]);

  const navigateTo = useCallback((newPath) => {
    try {
      if (newPath === 'HOME' || (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory())) {
        setCurrentPath(newPath);
        setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(newPath);
          return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
        setSelectedItems([]);
      }
    } catch (e) {
      console.error("Errore navigazione:", e);
    }
  }, [historyIndex]);

  const handleItemClick = (item) => {
    // Navigazione prioritaria per cartelle e drive
    if (item.type === 'folder' || item.type === 'drive' || item.isDir) { 
      navigateTo(item.fullPath);
    } else {
      // Apre file col programma di default
      shell.openPath(item.fullPath);
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
    if (confirm(`Sei sicuro di voler spostare nel cestino ${selectedItems.length} elementi?`)) {
      selectedItems.forEach(item => {
        shell.trashItem(item.fullPath);
      });
      setTimeout(() => loadDirectory(currentPath), 500);
      setSelectedItems([]);
      setContextMenu(null);
    }
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

  const handleDrop = async (e, targetFolderItem) => {
    e.preventDefault();
    setDragOverItem(null);
    setIsExternalDragOver(false);

    const targetPath = targetFolderItem 
      ? targetFolderItem.fullPath 
      : currentPath;

    if (targetPath === 'HOME') return;

    // Gestione drop di file esterni (dal sistema operativo)
    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      try {
        for (const file of files) {
          const destPath = path.join(targetPath, path.basename(file.path));
          if (fs.lstatSync(file.path).isDirectory()) {
            fs.cpSync(file.path, destPath, { recursive: true });
          } else {
            fs.copyFileSync(file.path, destPath);
          }
        }
        loadDirectory(currentPath);
      } catch (err) {
        console.error('Errore drop esterno:', err);
        alert('Errore durante il caricamento dei file: ' + err.message);
      }
      return;
    }

    // Gestione drop interno (spostamento)
    const itemData = e.dataTransfer.getData('item');
    const sourcePath = e.dataTransfer.getData('sourcePath');
    if (!itemData || !sourcePath) return;
    
    try {
      const draggedItem = JSON.parse(itemData);
      const destPath = path.join(targetPath, draggedItem.name);
      
      if (draggedItem.fullPath === destPath) return;

      fs.renameSync(draggedItem.fullPath, destPath);
      loadDirectory(currentPath);
      setSelectedItems([]);
    } catch (err) {
      console.error('Errore drop interno:', err);
      // Se fallisce il rename (es. tra drive diversi), prova copia e cancella
      try {
        const draggedItem = JSON.parse(e.dataTransfer.getData('item'));
        const destPath = path.join(targetPath, draggedItem.name);
        if (draggedItem.type === 'folder') {
          fs.cpSync(draggedItem.fullPath, destPath, { recursive: true });
          fs.rmSync(draggedItem.fullPath, { recursive: true });
        } else {
          fs.copyFileSync(draggedItem.fullPath, destPath);
          fs.unlinkSync(draggedItem.fullPath);
        }
        loadDirectory(currentPath);
        setSelectedItems([]);
      } catch (cpErr) {
        alert('Errore nello spostamento: ' + cpErr.message);
      }
    }
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
    if (currentPath === 'C:\\') return;
    const parts = currentPath.split('\\').filter(p => p);
    if (parts.length > 1) {
      parts.pop();
      navigateTo(parts.join('\\') + '\\');
    } else {
      navigateTo('C:\\');
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
        <div className="p-6 flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500",
            isDarkMode ? "bg-slate-800 shadow-sky-500/20" : "bg-white shadow-sky-100"
          )}>
            <LogoIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className={cn(
              "text-2xl font-black tracking-tight leading-none",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>CosmoNav</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Deep Space Explorer</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          <section>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Favoriti</p>
            <div className="space-y-1">
              {[
                { name: 'Home', icon: Home, path: 'HOME' },
                systemPaths.desktop && { name: 'Desktop', icon: ({ className }) => <FolderIcon colorScheme="red" className={className} />, path: systemPaths.desktop },
                systemPaths.downloads && { name: 'Download', icon: ({ className }) => <FolderIcon colorScheme="green" className={className} />, path: systemPaths.downloads },
                systemPaths.documents && { name: 'Documenti', icon: ({ className }) => <FolderIcon colorScheme="blue" className={className} />, path: systemPaths.documents },
              ].filter(Boolean).map((item) => (
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
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Librerie</p>
            <div className="space-y-1">
              {[
                systemPaths.pictures && { name: 'Immagini', icon: ({ className }) => <FolderIcon colorScheme="pink" className={className} />, path: systemPaths.pictures },
                systemPaths.videos && { name: 'Video', icon: ({ className }) => <FolderIcon colorScheme="teal" className={className} />, path: systemPaths.videos },
                systemPaths.music && { name: 'Musica', icon: ({ className }) => <FolderIcon colorScheme="orange" className={className} />, path: systemPaths.music },
              ].filter(Boolean).map((item) => (
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
        </nav>

        <div className="p-4 border-t border-slate-800/10 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            {isDarkMode ? 'Tema Chiaro' : 'Tema Scuro'}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
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
                {(contextMenu.target ? [
                  { icon: ExternalLink, label: 'Apri', onClick: () => handleItemClick(contextMenu.target) },
                  { icon: Edit3, label: 'Rinomina', onClick: () => {
                    const newName = prompt('Nuovo nome:', contextMenu.target.name);
                    if (newName && newName !== contextMenu.target.name) {
                      try {
                        const newPath = path.join(currentPath, newName);
                        fs.renameSync(contextMenu.target.fullPath, newPath);
                        loadDirectory(currentPath);
                        setSelectedItems([]);
                      } catch (err) { alert('Errore: ' + err.message); }
                    }
                  }},
                  { icon: Copy, label: 'Copia', onClick: copyToClipboard },
                  { icon: Scissors, label: 'Taglia', onClick: cutToClipboard },
                  { icon: Trash2, label: 'Elimina', color: 'text-rose-500', onClick: handleDeleteItems },
                ] : [
                  { icon: FolderPlus, label: 'Nuova Cartella', onClick: () => {
                    const name = prompt('Nome cartella:', 'Nuova Cartella');
                    if (name) {
                      try {
                        const newPath = path.join(currentPath, name);
                        if (!fs.existsSync(newPath)) {
                          fs.mkdirSync(newPath);
                          loadDirectory(currentPath);
                        }
                      } catch (err) { alert('Errore: ' + err.message); }
                    }
                  }},
                  { icon: FilePlus, label: 'Nuovo File', onClick: () => {
                    const name = prompt('Nome file:', 'nuovo_file.txt');
                    if (name) {
                      try {
                        const newPath = path.join(currentPath, name);
                        if (!fs.existsSync(newPath)) {
                          fs.writeFileSync(newPath, '');
                          loadDirectory(currentPath);
                        }
                      } catch (err) { alert('Errore: ' + err.message); }
                    }
                  }},
                  { icon: Download, label: 'Incolla', onClick: pasteFromClipboard, disabled: clipboard.items.length === 0 },
                  { icon: RefreshCw, label: 'Aggiorna', onClick: () => loadDirectory(currentPath) },
                ]).map((action, i) => (
                  <button
                    key={i}
                    disabled={action.disabled}
                    onClick={(e) => { e.stopPropagation(); action.onClick(); setContextMenu(null); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      isDarkMode ? "hover:bg-slate-800 text-slate-300 disabled:opacity-30" : "hover:bg-slate-50 text-slate-700 disabled:opacity-30",
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
              {currentPath === 'HOME' ? (
                <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-sky-500/20 text-sky-500 transition-colors">
                  <Home className="w-4 h-4" /><span className="text-sm font-medium">Questo PC</span>
                </button>
              ) : (
                <>
                  <button onClick={() => navigateTo('HOME')} className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-sky-500/20 text-slate-500 transition-colors">
                    <Home className="w-4 h-4" /><span className="text-sm font-medium">Questo PC</span>
                  </button>
                  {currentPath.split(path.sep).filter(p => p).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                      <button 
                        onClick={() => {
                          const targetPath = currentPath.split(path.sep).slice(0, currentPath.split(path.sep).indexOf(part) + 1).join(path.sep) + (part.includes(':') ? path.sep : '');
                          navigateTo(targetPath);
                        }}
                        className="px-2 py-1 rounded-md hover:bg-sky-500/20 text-slate-500 text-sm font-medium"
                      >
                        {part}
                      </button>
                    </React.Fragment>
                  ))}
                </>
              )}
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
              <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all uppercase text-[10px] font-bold px-3", viewMode === 'grid' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40" : (isDarkMode ? "text-slate-400" : "text-slate-500"))}>Grid</button>
              <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-all uppercase text-[10px] font-bold px-3", viewMode === 'list' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40" : (isDarkMode ? "text-slate-400" : "text-slate-500"))}>List</button>
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
                {currentPath === 'HOME' ? 'Questo PC' : currentPath.split(path.sep).filter(Boolean).pop()}
                <span className="ml-4 text-xs font-bold text-sky-500 bg-sky-500/10 px-2 py-1 rounded-full">{filteredItems.length} OGGETTI</span>
              </h2>
              <button 
                onClick={() => {
                  const name = prompt('Nome cartella:', 'Nuova Cartella');
                  if (name && currentPath !== 'HOME') {
                    try {
                      const newPath = path.join(currentPath, name);
                      if (!fs.existsSync(newPath)) {
                        fs.mkdirSync(newPath);
                        loadDirectory(currentPath);
                      } else {
                        alert('La cartella esiste già!');
                      }
                    } catch (err) { alert('Errore: ' + err.message); }
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/20"
              >
                <FolderPlus className="w-4 h-4" />Nuova Cartella
              </button>
            </div>

            {/* 📊 HEADER COLONNE RIDIMENSIONABILI - Solo in List View */}
            {viewMode === 'list' && filteredItems.length > 0 && (
              <div 
                className={cn(
                  "grid items-center gap-4 px-6 py-3 mb-2 rounded-xl border-b sticky top-0 z-10 select-none",
                  isDarkMode ? "bg-slate-900/95 border-slate-800 backdrop-blur-sm" : "bg-slate-100/95 border-slate-200 backdrop-blur-sm"
                )}
                style={{
                  gridTemplateColumns: `${columnWidths.name}px ${columnWidths.date}px ${columnWidths.type}px ${columnWidths.size}px`
                }}
              >
                {/* Colonna NOME */}
                <div className="relative flex items-center gap-2 group h-full">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 overflow-hidden whitespace-nowrap">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                    Nome
                  </div>
                  {/* Resizer Handle */}
                  <div 
                    className="absolute right-[-18px] top-0 bottom-0 w-4 cursor-col-resize z-20 hover:bg-sky-500/20 active:bg-sky-500/50 transition-colors rounded"
                    onMouseDown={(e) => startResizing(e, 'name')}
                  />
                </div>

                {/* Colonna DATA */}
                <div className="relative flex items-center gap-2 group h-full">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 overflow-hidden whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    Data Modifica
                  </div>
                  <div 
                    className="absolute right-[-18px] top-0 bottom-0 w-4 cursor-col-resize z-20 hover:bg-sky-500/20 active:bg-sky-500/50 transition-colors rounded"
                    onMouseDown={(e) => startResizing(e, 'date')}
                  />
                </div>

                {/* Colonna TIPO */}
                <div className="relative flex items-center gap-2 group h-full">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 overflow-hidden whitespace-nowrap">
                    <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                    Tipo
                  </div>
                  <div 
                    className="absolute right-[-18px] top-0 bottom-0 w-4 cursor-col-resize z-20 hover:bg-sky-500/20 active:bg-sky-500/50 transition-colors rounded"
                    onMouseDown={(e) => startResizing(e, 'type')}
                  />
                </div>

                {/* Colonna DIMENSIONE */}
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 justify-end overflow-hidden whitespace-nowrap">
                  <HardDrive className="w-3.5 h-3.5 flex-shrink-0" />
                  Dimensione
                </div>
              </div>
            )}

            <div
              className={cn(
                "min-h-0 overflow-y-auto custom-scrollbar p-2", // Rimosso motion.div e layout prop per performance
                viewMode === 'grid' 
                  ? "grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2"
                  : "flex flex-col space-y-1"
              )}
            >
              {filteredItems.map((item) => {
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
                    style={viewMode === 'list' ? {
                      display: 'grid',
                      gridTemplateColumns: `${columnWidths.name}px ${columnWidths.date}px ${columnWidths.type}px ${columnWidths.size}px`,
                      alignItems: 'center',
                      gap: '1rem'
                    } : {}}
                    className={cn(
                      "selectable-item group relative transition-all duration-200 rounded-lg cursor-pointer overflow-hidden border border-transparent select-none",
                      viewMode === 'grid' 
                        ? "flex flex-col items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 min-h-[140px]" 
                        : "px-6 py-2 hover:bg-sky-50 dark:hover:bg-sky-900/10 border-b border-slate-50 dark:border-slate-800/50",
                      isSelected && "bg-sky-50 dark:bg-sky-900/20 border-sky-500/30 ring-1 ring-sky-500/30 z-10",
                      isHoveredAsDropTarget && "bg-sky-500/30 scale-105 ring-2 ring-sky-500"
                    )}
                  >
                    {viewMode === 'list' ? (
                       // LIST VIEW CONTENT (Aligned Columns)
                       <>
                         <div className="flex items-center gap-3 overflow-hidden h-full min-w-0">
                           <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                              {getFileIcon(item.name, item.type, null, item)}
                           </div>
                           <span className="truncate font-semibold text-sm text-slate-900 dark:text-slate-100" title={item.name}>
                              {item.name}
                           </span>
                         </div>
                         
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                             {formatDate(item.lastModified) || item.date}
                          </div>
                         
                         <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider truncate">
                             {item.type === 'folder' ? 'Cartella' : item.type === 'drive' ? 'Disco' : item.ext?.toUpperCase() || 'File'}
                         </div>
                         
                         <div className="text-xs font-mono text-slate-600 dark:text-slate-400 text-right truncate">
                             {item.type === 'drive' ? `${item.freeSize} disp. su ${item.totalSize}` : item.size}
                         </div>
                       </>
                    ) : (
                       // GRID VIEW CONTENT (Card)
                       <>
                          <div className="relative mb-3 w-full flex-1 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 flex items-center justify-center">
                              {getFileIcon(item.name, item.type, item.preview, item)}
                            </div>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-sky-500 rounded-full p-1 shadow-sm z-10 w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                                <ChevronRight className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full text-center">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate w-full mb-1 px-1" title={item.name}>
                              {item.name}
                            </p>
                            
                            {item.type === 'drive' ? (
                                <div className="w-full px-1">
                                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                                    <div 
                                      className={cn("h-full", item.usedPercent > 90 ? "bg-rose-500" : "bg-sky-500")} 
                                      style={{ width: `${item.usedPercent}%` }} 
                                    />
                                  </div>
                                  <div className="flex justify-between text-[9px] text-slate-400">
                                    <span>{item.usedPercent}%</span>
                                    <span>{item.freeSize}</span>
                                  </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <span>{item.size !== '--' ? item.size : (formatDate(item.lastModified) || item.date)}</span>
                                </div>
                            )}
                          </div>
                       </>
                    )}
                  </motion.div>
                );
              })}
            </div>
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
                        { 
                          label: 'Dimensione', 
                          value: selectedItems[0].type === 'drive' ? selectedItems[0].totalSize : selectedItems[0].size, 
                          icon: HardDrive 
                        },
                        { 
                          label: selectedItems[0].type === 'drive' ? 'Spazio Libero' : 'Modificato il', 
                          value: selectedItems[0].type === 'drive' ? selectedItems[0].freeSize : (formatDate(selectedItems[0].lastModified) || selectedItems[0].date), 
                          icon: Clock 
                        },
                        { 
                          label: 'Percorso', 
                          value: selectedItems[0].type === 'drive' ? selectedItems[0].fullPath : currentPath, 
                          icon: Home 
                        },
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
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-3xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95"
                      >
                        <Copy className="w-4 h-4" /> Copia
                      </button>
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
            {/* Signal Strength RIMOSSO */}
            {(() => {
                const currentDrive = drives.find(d => currentPath.startsWith(d.shortName) || (d.fullPath && currentPath.startsWith(d.fullPath)));
                if (currentDrive) {
                    return (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
                          <HardDrive className="w-3 h-3" /> 
                          {currentDrive.freeSize} LIBERI su {currentDrive.totalSize}
                        </div>
                    );
                }
                return null;
            })()}
          </div>
        </footer>
        
        {/* Modals Integration */}
        <AnimatePresence>
          {showPreview && previewItem && (
            <QuickPreviewModal 
              item={previewItem} 
              isDarkMode={isDarkMode} 
              onClose={() => setShowPreview(false)} 
            />
          )}

          {showStats && folderStats && (
            <FolderStatsModal 
              stats={folderStats} 
              isDarkMode={isDarkMode} 
              onClose={() => setShowStats(false)} 
            />
          )}

          {showBulkRename && (
            <BulkRenameModal 
              items={selectedItems}
              pattern={bulkRenamePattern}
              setPattern={setBulkRenamePattern}
              onApply={applyBulkRename}
              onClose={() => setShowBulkRename(false)}
              isDarkMode={isDarkMode}
            />
          )}

          {showSettings && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowSettings(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className={cn("w-full max-w-md p-8 rounded-[40px] shadow-2xl", isDarkMode ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200")}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black">Impostazioni</h2>
                  <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-500/5">
                    <span className="font-bold">Tema Scuro</span>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={cn("w-14 h-8 rounded-full transition-colors relative flex items-center px-1", isDarkMode ? "bg-sky-500" : "bg-slate-300")}
                    >
                      <motion.div 
                        animate={{ x: isDarkMode ? 24 : 0 }}
                        className="w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-500/5">
                    <span className="font-bold">Vista Lista/Griglia</span>
                    <div className="flex gap-2">
                       <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400")}><Grid className="w-5 h-5" /></button>
                       <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400")}><List className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full mt-10 py-4 bg-sky-500 text-white font-black rounded-3xl shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition-transform"
                >
                  SALVA E CHIUDI
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
