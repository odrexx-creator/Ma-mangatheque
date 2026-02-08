
import React, { useState } from 'react';
import { Series } from '../types';

interface SeriesDetailProps {
  series: Series;
  onBack: () => void;
  onAddVolume: (number: number) => void;
  onToggleVolume: (id: string) => void;
  onDeleteVolume: (id: string) => void;
  onDeleteSeries: () => void;
  onRefresh: () => void;
  onUpdateImage: (url: string) => void;
  isSyncing: boolean;
}

const SeriesDetail: React.FC<SeriesDetailProps> = ({ 
  series, onBack, onAddVolume, onToggleVolume, onDeleteVolume, onDeleteSeries, onRefresh, onUpdateImage, isSyncing 
}) => {
  const [newVolNum, setNewVolNum] = useState<string>('');

  const handleAddVolume = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newVolNum);
    if (!isNaN(num)) { onAddVolume(num); setNewVolNum(''); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdateImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const ownedCount = series.volumes.filter(v => v.owned).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center px-2">
        <button onClick={onBack} className="bg-white border-4 border-gray-800 px-6 py-2 rounded-2xl font-black hover:bg-gray-800 hover:text-white transition-all shadow-[4px_4px_0_0_#1f2937] hover:translate-x-1 hover:shadow-none">
          <i className="fa-solid fa-arrow-left mr-2"></i>RETOUR
        </button>
        <div className="text-[10px] font-black uppercase text-gray-400 bg-white border-2 border-gray-100 px-3 py-1 rounded-lg">
          {series.nationality}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-gray-800 overflow-hidden">
        <div className={`relative h-48 md:h-72 ${series.color}`}>
          {series.imageUrl && <img src={series.imageUrl} className="w-full h-full object-cover mix-blend-multiply opacity-60" />}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 md:p-6 text-center">
            <h2 className="text-3xl md:text-6xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mb-2 italic uppercase leading-tight">{series.title}</h2>
            <div className="bg-black/40 backdrop-blur-sm px-4 md:px-6 py-1 md:py-2 rounded-full border-2 border-white/20">
              <p className="text-sm md:text-lg font-black uppercase tracking-widest">{series.author}</p>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <label className="bg-white text-gray-800 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform border-4 border-gray-100 cursor-pointer" title="Changer l'image">
                <i className="fa-solid fa-camera text-sm md:text-base"></i>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="bg-blue-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-blue-500 shadow-[4px_4px_0_0_#3b82f6] md:shadow-[6px_6px_0_0_#3b82f6]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase">MA COLLECTION</p>
                  <p className="text-2xl md:text-4xl font-black text-blue-600">
                    {ownedCount} <span className="text-blue-300 text-lg md:text-xl">tomes</span>
                  </p>
                </div>
                <i className="fa-solid fa-book-open text-2xl md:text-3xl text-blue-200"></i>
              </div>
            </div>

            <div className="bg-green-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-green-500 shadow-[4px_4px_0_0_#22c55e] md:shadow-[6px_6px_0_0_#22c55e] relative">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-green-400 uppercase">SORTIS EN FRANCE</p>
                  <p className="text-2xl md:text-4xl font-black text-green-600">
                    {series.totalAvailableInFrance || '?'} <span className="text-green-200 text-lg md:text-xl">tomes</span>
                  </p>
                </div>
                <button 
                  onClick={onRefresh} 
                  disabled={isSyncing}
                  className="bg-white text-gray-800 w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform border-4 border-gray-100 disabled:opacity-50"
                  title="Mettre à jour via IA"
                >
                  <i className={`fa-solid fa-arrows-rotate text-sm md:text-xl ${isSyncing ? 'fa-spin' : ''}`}></i>
                  <span className="text-[6px] md:text-[8px] font-black mt-1 uppercase leading-none hidden md:inline">Mise à jour</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-gray-800 italic uppercase">Mes Tomes</h3>
            <form onSubmit={handleAddVolume} className="flex gap-2 w-full md:w-auto">
              <input 
                type="number" 
                value={newVolNum} 
                onChange={e => setNewVolNum(e.target.value)} 
                placeholder="N°..." 
                className="flex-1 md:w-36 border-4 border-gray-100 rounded-[1rem] md:rounded-[1.5rem] px-4 md:px-6 py-2 md:py-3 font-black outline-none focus:border-blue-400 shadow-inner text-sm md:text-base" 
              />
              <button type="submit" className="bg-blue-500 text-white font-black px-6 md:px-8 py-2 md:py-3 rounded-[1rem] md:rounded-[1.5rem] shadow-[0_4px_0_0_#1e3a8a] md:shadow-[0_6px_0_0_#1e3a8a] active:translate-y-1 active:shadow-none transition-all text-sm md:text-base">
                AJOUTER
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-5">
            {series.volumes.map(vol => (
              <div 
                key={vol.id} 
                className={`
                  relative group p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-4 transition-all hover:-translate-y-1
                  ${vol.owned 
                    ? 'bg-green-50 border-green-500 shadow-[3px_3px_0_0_#22c55e] md:shadow-[4px_4px_0_0_#22c55e]' 
                    : 'bg-red-50 border-red-500 shadow-[3px_3px_0_0_#ef4444] md:shadow-[4px_4px_0_0_#ef4444]'}
                `}
              >
                <div className="text-center">
                  <span className="block text-2xl md:text-3xl font-black mb-1 md:mb-3">#{vol.number}</span>
                  <button 
                    onClick={() => onToggleVolume(vol.id)}
                    className={`
                      w-full py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-inner
                      ${vol.owned ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                    `}
                  >
                    {vol.owned ? 'OUI !' : 'NON'}
                  </button>
                </div>
                <button 
                  onClick={() => onDeleteVolume(vol.id)} 
                  className="absolute -top-2 -right-2 bg-gray-800 text-white w-6 h-6 md:w-8 md:h-8 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity border-2 md:border-4 border-white flex items-center justify-center shadow-md"
                >
                  <i className="fa-solid fa-trash-can text-[8px] md:text-[10px]"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
