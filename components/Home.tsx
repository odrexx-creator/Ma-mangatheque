
import React, { useState } from 'react';
import { Series } from '../types';

interface HomeProps {
  mangaList: Series[];
  onAddSeries: (title: string, author: string, nationality: string, imageUrl?: string) => void;
  onDeleteSeries: (id: string) => void;
  onSelectSeries: (id: string) => void;
  onOpenReport: () => void;
  onSuggestMetadata: (query: string) => Promise<Partial<Series> | null>;
  isSyncing: string | null;
}

const Home: React.FC<HomeProps> = ({ mangaList, onAddSeries, onDeleteSeries, onSelectSeries, onOpenReport, onSuggestMetadata, isSyncing }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newNationality, setNewNationality] = useState('Japonais');
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleSuggest = async () => {
    if (!newTitle.trim()) return;
    setIsSearching(true);
    const data = await onSuggestMetadata(newTitle);
    if (data) {
      if (data.title) setNewTitle(data.title);
      if (data.author) setNewAuthor(data.author);
      if (data.nationality) setNewNationality(data.nationality);
    }
    setIsSearching(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddSeries(newTitle, newAuthor, newNationality, newImageUrl);
      setNewTitle(''); 
      setNewAuthor(''); 
      setNewNationality('Japonais');
      setNewImageUrl('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 italic uppercase">Mes Collections</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={onOpenReport} className="flex-1 md:flex-none bg-white border-4 border-gray-800 px-4 py-2 rounded-xl font-black shadow-[4px_4px_0px_0px_#1f2937] hover:translate-y-1 hover:shadow-none transition-all text-sm uppercase">
            RAPPORT
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-yellow-400 border-4 border-gray-800 px-4 py-2 rounded-xl font-black shadow-[4px_4px_0px_0px_#1f2937] hover:translate-y-1 hover:shadow-none transition-all text-sm uppercase">
            + AJOUTER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8">
        {mangaList.map(series => {
          const owned = series.volumes.filter(v => v.owned).length;
          const isSync = isSyncing === series.id;

          return (
            <div 
              key={series.id}
              onClick={() => onSelectSeries(series.id)}
              className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden cursor-pointer border-4 border-gray-800 hover:-rotate-1 transition-transform group relative"
            >
              {isSync && (
                <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center">
                  <i className="fa-solid fa-magnifying-glass fa-bounce text-2xl text-blue-500 mb-2"></i>
                  <span className="font-black text-[8px] uppercase tracking-tighter">Mise à jour...</span>
                </div>
              )}

              {/* Delete button directly on card */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSeries(series.id);
                }}
                className="absolute top-2 right-2 z-10 bg-red-500 text-white w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                title="Supprimer la collection"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>

              <div className={`h-32 md:h-56 relative overflow-hidden ${series.color}`}>
                {series.imageUrl ? (
                  <img src={series.imageUrl} alt={series.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white text-center p-2">
                    <span className="text-4xl md:text-6xl font-black opacity-30 mb-1">{series.title[0]}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-black/20 px-1 rounded">Sans image</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black text-white text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded uppercase border border-white">
                    {series.nationality}
                  </span>
                </div>
              </div>

              <div className="p-3 md:p-6">
                <h3 className="text-sm md:text-xl font-black text-gray-800 truncate mb-0.5 uppercase italic leading-tight">{series.title}</h3>
                <p className="text-gray-400 font-bold text-[10px] md:text-xs mb-2 md:mb-4 truncate">{series.author}</p>
                
                <div className="bg-gray-100 rounded-xl md:rounded-2xl p-2 md:p-3 flex justify-between items-center border-2 border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase leading-none">Tomes</span>
                    <span className="text-sm md:text-xl font-black text-gray-800">
                      {owned} <span className="text-gray-400 text-[10px] md:text-sm">/ {series.totalAvailableInFrance || '?'}</span>
                    </span>
                  </div>
                  {series.totalAvailableInFrance && owned >= series.totalAvailableInFrance && (
                    <i className="fa-solid fa-crown text-yellow-500 text-sm md:text-xl"></i>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-md border-8 border-yellow-400 shadow-[10px_10px_0px_0px_#1f2937]">
            <h3 className="text-xl md:text-2xl font-black mb-6 text-gray-800 italic uppercase">Créer une collection</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  autoFocus 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder="Titre du manga..." 
                  className="w-full border-4 border-gray-100 rounded-2xl p-4 pr-16 focus:border-blue-400 outline-none font-black" 
                  required 
                />
                <button 
                  type="button"
                  onClick={handleSuggest}
                  disabled={isSearching || !newTitle}
                  className="absolute right-3 top-3 bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 disabled:opacity-50"
                  title="Auto-remplir via IA"
                >
                  <i className={`fa-solid ${isSearching ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                </button>
              </div>
              <input type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Auteur" className="w-full border-4 border-gray-100 rounded-2xl p-4 focus:border-blue-400 outline-none font-bold" />
              <input type="text" value={newNationality} onChange={e => setNewNationality(e.target.value)} placeholder="Nationalité (ex: Japonais)" className="w-full border-4 border-gray-100 rounded-2xl p-4 focus:border-blue-400 outline-none font-bold" />
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Image (depuis tes photos)</label>
                <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer bg-gray-100 border-4 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-200 transition">
                        {newImageUrl ? (
                             <img src={newImageUrl} className="h-16 w-16 object-cover rounded-xl border-2 border-white shadow-md mb-2" />
                        ) : (
                             <i className="fa-solid fa-cloud-arrow-up text-xl text-gray-400 mb-2"></i>
                        )}
                        <span className="text-[10px] font-black text-gray-500 uppercase">{newImageUrl ? 'Changer la photo' : 'Choisir une photo'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    {newImageUrl && (
                        <button type="button" onClick={() => setNewImageUrl('')} className="bg-red-100 text-red-500 p-3 rounded-xl hover:bg-red-200">
                             <i className="fa-solid fa-trash-can"></i>
                        </button>
                    )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black py-4 rounded-xl border-4 border-gray-200 uppercase text-sm">FERMER</button>
                <button type="submit" className="flex-1 bg-gray-800 text-white font-black py-4 rounded-xl shadow-[0_4px_0_0_#000] uppercase text-sm">C'EST PARTI !</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
