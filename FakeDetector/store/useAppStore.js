import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Analysis state
  currentImage: null,
  isAnalyzing: false,
  analysisResult: null,
  
  // History state
  analysisHistory: [],
  
  // Settings state
  settings: {
    notificationsEnabled: true,
    autoSaveResults: true,
    darkMode: false,
  },

  // Actions
  setCurrentImage: (image) => set({ currentImage: image }),
  
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  
  setAnalysisResult: (result) => set({ analysisResult: result }),
  
  addToHistory: (analysisData) => set((state) => ({
    analysisHistory: [analysisData, ...state.analysisHistory].slice(0, 30) // Keep only last 30
  })),
  
  clearHistory: () => set({ analysisHistory: [] }),
  
  updateHistoryFeedback: (id, feedback) => set((state) => ({
    analysisHistory: state.analysisHistory.map(item =>
      item.id === id ? { ...item, userFeedback: feedback } : item
    )
  })),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  // Helper functions
  getHistoryCount: () => get().analysisHistory.length,
  
  getRecentAnalysis: (count = 5) => get().analysisHistory.slice(0, count),
}));

export default useAppStore; 