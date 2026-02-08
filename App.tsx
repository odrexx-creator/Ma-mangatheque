
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Series, Volume, View } from './types';
import Home from './components/Home';
import SeriesDetail from './components/SeriesDetail';
import Report from './components/Report';

const RANDOM_COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400', 
  'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 
  'bg-yellow-400', 'bg-teal-400'
];

const App: React.FC = () => {
  const [mangaList, setMangaList] = useState<Series[]>(() => {
    const saved = localStorage.getItem('mangatheque_v3_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState<View>('home');
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('mangatheque_v3_data', JSON.stringify(mangaList));
  }, [mangaList]);

  const suggestMangaMetadata = async (query: string): Promise<Partial<Series> | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Donne-moi les infos réelles pour le manga "${query}" au format JSON:
        - title (le titre officiel complet)
        - author (le nom de l'auteur)
        - nationality (Japonais, Français, Coréen...)`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Erreur suggestion:", error);
      return null;
    }
  };

  const fetchMangaDetails = async (seriesId: string, title: string) => {
    setIsSyncing(seriesId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Recherche web pour le manga "${title}":
        Donne-moi le nombre EXACT de tomes actuellement commercialisés/sortis en France (format papier).
        Réponds uniquement au format JSON: { "totalVolumesFrance": number }`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text);
      
      setMangaList(prev => prev.map(s => s.id === seriesId ? {
        ...s,
        totalAvailableInFrance: data.totalVolumesFrance || s.totalAvailableInFrance
      } : s));
    } catch (error) {
      console.error("Erreur sync:", error);
    } finally {
      setIsSyncing(null);
    }
  };

  const addSeries = async (title: string, author: string, nationality: string, imageUrl?: string) => {
    const id = Date.now().toString();
    const newSeries: Series = {
      id,
      title,
      author,
      nationality,
      imageUrl,
      color: RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)],
      volumes: []
    };
    setMangaList(prev => [...prev, newSeries]);
    fetchMangaDetails(id, title);
  };

  const updateSeriesImage = (id: string, url: string) => {
    setMangaList(prev => prev.map(s => s.id === id ? { ...s, imageUrl: url } : s));
  };

  const deleteSeries = (id: string) => {
    const series = mangaList.find(s => s.id === id);
    if (window.confirm(`Es-tu sûr de vouloir supprimer TOUTE la collection "${series?.title}" ? Cette action est définitive.`)) {
      setMangaList(prev => prev.filter(s => s.id !== id));
      if (activeSeriesId === id) {
        setCurrentView('home');
        setActiveSeriesId(null);
      }
    }
  };

  const addVolume = (seriesId: string, volumeNumber: number) => {
    setMangaList(prev => prev.map(series => {
      if (series.id === seriesId) {
        if (series.volumes.find(v => v.number === volumeNumber)) return series;
        const newVolume: Volume = {
          id: Math.random().toString(36).substr(2, 9),
          number: volumeNumber,
          owned: false
        };
        return { ...series, volumes: [...series.volumes, newVolume].sort((a, b) => a.number - b.number) };
      }
      return series;
    }));
  };

  const toggleVolumeOwned = (seriesId: string, volumeId: string) => {
    setMangaList(prev => prev.map(series => {
      if (series.id === seriesId) {
        return { ...series, volumes: series.volumes.map(v => v.id === volumeId ? { ...v, owned: !v.owned } : v) };
      }
      return series;
    }));
  };

  const deleteVolume = (seriesId: string, volumeId: string) => {
    setMangaList(prev => prev.map(series => {
      if (series.id === seriesId) {
        return { ...series, volumes: series.volumes.filter(v => v.id !== volumeId) };
      }
      return series;
    }));
  };

  const activeSeries = mangaList.find(s => s.id === activeSeriesId);

  return (
    <div className="min-h-screen pb-12 bg-[#fdfcf0]">
      <header className="bg-yellow-400 p-6 shadow-md mb-8 text-center border-b-8 border-gray-800">
        <h1 className="text-4xl font-black text-gray-800 flex items-center justify-center gap-3 italic">
          <i className="fa-solid fa-bolt text-blue-600"></i>
          MA MANGATHÈQUE
        </h1>
        <p className="text-gray-800 font-bold mt-1 uppercase text-sm tracking-widest">Le repaire des otakus</p>
      </header>

      <main className="container mx-auto px-4">
        {currentView === 'home' && (
          <Home 
            mangaList={mangaList} 
            onAddSeries={addSeries} 
            onDeleteSeries={deleteSeries}
            onSelectSeries={(id) => { setActiveSeriesId(id); setCurrentView('detail'); }}
            onOpenReport={() => setCurrentView('report')}
            onSuggestMetadata={suggestMangaMetadata}
            isSyncing={isSyncing}
          />
        )}

        {currentView === 'detail' && activeSeries && (
          <SeriesDetail 
            series={activeSeries} 
            onBack={() => setCurrentView('home')} 
            onAddVolume={(num) => addVolume(activeSeries.id, num)}
            onToggleVolume={(volId) => toggleVolumeOwned(activeSeries.id, volId)}
            onDeleteVolume={(volId) => deleteVolume(activeSeries.id, volId)}
            onDeleteSeries={() => deleteSeries(activeSeries.id)}
            onRefresh={() => fetchMangaDetails(activeSeries.id, activeSeries.title)}
            onUpdateImage={(url) => updateSeriesImage(activeSeries.id, url)}
            isSyncing={isSyncing === activeSeries.id}
          />
        )}

        {currentView === 'report' && (
          <Report mangaList={mangaList} onBack={() => setCurrentView('home')} />
        )}
      </main>
    </div>
  );
};

export default App;
