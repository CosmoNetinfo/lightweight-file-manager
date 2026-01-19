// COMPONENTI MODALI E UI PER LE NUOVE FEATURES
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Palette, Check, FileText, BarChart3, Image, Video, Music, FileArchive, Code, File, Folder, HardDrive } from 'lucide-react';

export function QuickPreviewModal({ item, isDarkMode, onClose }) {
  if (!item) return null;

  const isImage = item.preview || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(item.ext);
  const isVideo = ['mp4', 'avi', 'mov', 'mkv'].includes(item.ext);
  const isText = ['txt', 'md', 'json', 'js', 'jsx', 'html', 'css'].includes(item.ext);
  const isDrive = item.type === 'drive';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-w-4xl max-h-[90vh] w-full mx-4 rounded-3xl overflow-hidden shadow-2xl ${
          isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
          <h3 className="font-bold text-lg truncate">{item.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[70vh]">
          {isImage && item.preview && (
            <img src={item.preview} alt={item.name} className="w-full h-auto rounded-xl shadow-2xl" />
          )}
          {isVideo && (
            <video controls className="w-full rounded-xl shadow-2xl">
              <source src={`file:///${item.fullPath.replace(/\\/g, '/')}`} />
            </video>
          )}
          {isDrive && (
             <div className="text-center py-10">
                <HardDrive className="w-24 h-24 mx-auto text-slate-500 mb-4" />
                <h2 className="text-3xl font-black mb-2">{item.name}</h2>
                <div className="w-full max-w-md mx-auto mt-6 px-4">
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-2 relative">
                     <div className="absolute inset-0 bg-slate-700/50"></div>
                     <div 
                       className={`h-full ${item.usedPercent > 90 ? "bg-rose-500" : "bg-sky-500"}`} 
                       style={{ width: `${item.usedPercent}%` }} 
                     />
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-400">
                    <span>{item.usedPercent}% Usato</span>
                    <span>Libero: {item.freeSize}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Capacità Totale: {item.totalSize}</p>
                </div>
             </div>
          )}
          {!isImage && !isVideo && !isDrive && (
            <div className="text-center py-20">
              <FileText className="w-24 h-24 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-500">Anteprima non disponibile per questo tipo di file</p>
              <p className="text-sm text-slate-600 mt-2">Premi Invio per aprire</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-6 py-4 border-t border-slate-800/50 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold">Tipo</p>
            <p className="font-semibold">{item.type === 'folder' ? 'Cartella' : item.type === 'drive' ? 'Disco Locale' : item.ext?.toUpperCase() || 'File'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold">Dimensione</p>
            <p className="font-semibold">{item.type === 'drive' ? item.totalSize : (item.size || '--')}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold">{item.type === 'drive' ? 'Spazio Libero' : 'Modificato'}</p>
            <p className="font-semibold">{item.type === 'drive' ? item.freeSize : item.date}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FolderStatsModal({ stats, isDarkMode, onClose }) {
  if (!stats) return null;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const typeData = [
    { name: 'Immagini', icon: Image, ...stats.byType.images, color: 'text-pink-500' },
    { name: 'Video', icon: Video, ...stats.byType.videos, color: 'text-purple-500' },
    { name: 'Documenti', icon: FileText, ...stats.byType.documents, color: 'text-blue-500' },
    { name: 'Musica', icon: Music, ...stats.byType.music, color: 'text-orange-500' },
    { name: 'Archivi', icon: FileArchive, ...stats.byType.archives, color: 'text-yellow-500' },
    { name: 'Codice', icon: Code, ...stats.byType.code, color: 'text-green-500' },
    { name: 'Altri', icon: File, ...stats.byType.others, color: 'text-slate-500' },
  ].filter(type => type.count > 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-w-2xl w-full mx-4 rounded-3xl p-8 shadow-2xl ${
          isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/20 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Statistiche Cartella</h2>
              <p className="text-sm text-slate-500">Analisi dello spazio occupato</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Totale File</p>
            <p className="text-3xl font-black text-sky-500">{stats.totalFiles}</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cartelle</p>
            <p className="text-3xl font-black text-purple-500">{stats.totalFolders}</p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Dimensione</p>
            <p className="text-3xl font-black text-emerald-500">{formatBytes(stats.totalSize)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Per Tipologia</h3>
          {typeData.map((type, i) => {
            const percentage = stats.totalSize > 0 ? (type.size / stats.totalSize) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-4">
                <type.icon className={`w-5 h-5 ${type.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">{type.name}</span>
                    <span className="text-xs text-slate-500">{type.count} file • {formatBytes(type.size)}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${type.color.replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BulkRenameModal({ items, pattern, setPattern, onApply, onClose, isDarkMode }) {
  const previewNewNames = () => {
    return items.slice(0, 5).map((item, index) => {
      const ext = item.type === 'file' ? '.' + item.name.split('.').pop() : '';
      const newName = pattern
        .replace('{n}', (index + 1).toString())
        .replace('{name}', item.name.replace(ext, ''))
        .replace('{date}', new Date().toISOString().split('T')[0]) + ext;
      return { old: item.name, new: newName };
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-w-2xl w-full mx-4 rounded-3xl p-8 shadow-2xl ${
          isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">Rinomina Multipla</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Pattern di Rinomina</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="es: File_{n}_{date} oppure {name}_nuovo"
            className={`w-full px-4 py-3 rounded-xl border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            } focus:ring-2 focus:ring-sky-500 outline-none`}
          />
          <p className="text-xs text-slate-500 mt-2">
            Usa: <code className="bg-slate-800 px-2 py-1 rounded">{'{n}'}</code> per numero,{' '}
            <code className="bg-slate-800 px-2 py-1 rounded">{'{name}'}</code> per nome originale,{' '}
            <code className="bg-slate-800 px-2 py-1 rounded">{'{date}'}</code> per data
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3">Anteprima (primi 5 file):</h3>
          <div className="space-y-2">
            {previewNewNames().map((preview, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-400 flex-1 truncate">{preview.old}</span>
                <span className="text-sky-500">→</span>
                <span className="text-sm font-bold text-sky-500 flex-1 truncate">{preview.new}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-bold"
          >
            Annulla
          </button>
          <button
            onClick={() => { onApply(); onClose(); }}
            disabled={!pattern}
            className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Applica a {items.length} file
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
