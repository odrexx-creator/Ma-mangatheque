
import React, { useMemo, useState } from 'react';
import { Series } from '../types';

interface ReportProps {
  mangaList: Series[];
  onBack: () => void;
}

const Report: React.FC<ReportProps> = ({ mangaList, onBack }) => {
  const [copied, setCopied] = useState(false);

  const reportText = useMemo(() => {
    if (mangaList.length === 0) return "Ta bibliothèque est vide !";

    return mangaList.map(series => {
      const ownedVolumesList = series.volumes
        .filter(v => v.owned)
        .map(v => v.number)
        .sort((a, b) => a - b);

      const ownedCount = ownedVolumesList.length;
      const totalAvailable = series.totalAvailableInFrance || 0;

      // Déterminer les tomes "à acheter" :
      // Ce sont les tomes sortis en France mais que nous n'avons pas encore marqués comme possédés.
      const toBuy: number[] = [];
      
      if (totalAvailable > 0) {
        for (let i = 1; i <= totalAvailable; i++) {
          if (!ownedVolumesList.includes(i)) {
            toBuy.push(i);
          }
        }
      }
      
      toBuy.sort((a, b) => a - b);

      return `📖 Série : ${series.title.toUpperCase()}
📚 Tomes en mangathèque : ${ownedCount} sur ${totalAvailable || '?'}
✅ Tomes possédés : ${ownedVolumesList.join(', ') || 'aucun'}
❌ Tomes à acheter : ${toBuy.join(', ') || 'aucun'}`;
    }).join('\n\n---------------------------------\n\n');
  }, [mangaList]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack} className="bg-gray-800 text-white font-black px-6 py-2 rounded-xl text-sm">
        <i className="fa-solid fa-chevron-left mr-2"></i>RETOUR
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border-8 border-blue-400">
        <h2 className="text-3xl font-black text-gray-800 mb-6 italic uppercase flex items-center gap-4">
          <i className="fa-solid fa-file-invoice text-blue-500"></i>
          Mon Rapport Manga
        </h2>
        
        <div className="relative">
          <textarea 
            readOnly
            className="w-full h-96 bg-gray-50 border-4 border-gray-100 rounded-3xl p-6 font-mono text-sm focus:outline-none resize-none shadow-inner"
            value={reportText}
          />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleCopy}
            className={`
              flex-1 py-4 rounded-2xl font-black text-white shadow-[0_6px_0_0_#1e3a8a] transition transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2
              ${copied ? 'bg-green-500 shadow-[0_6px_0_0_#166534]' : 'bg-blue-600'}
            `}
          >
            <i className={copied ? "fa-solid fa-check-double" : "fa-solid fa-copy"}></i>
            {copied ? 'COPIÉ !' : 'COPIER LE TEXTE'}
          </button>
          <a 
            href={`mailto:?subject=Ma Mangathèque&body=${encodeURIComponent(reportText)}`}
            className="flex-1 bg-yellow-400 text-gray-800 py-4 rounded-2xl font-black shadow-[0_6px_0_0_#a16207] transition transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-share-nodes"></i>
            PARTAGER PAR EMAIL
          </a>
        </div>
      </div>
    </div>
  );
};

export default Report;
