
import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageEditor } from './components/ImageEditor';
import { FoodPhotographer } from './components/FoodPhotographer';

type Tab = 'photographer' | 'editor';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('photographer');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-center border-b border-gray-700 mb-8">
          <TabButton
            label="Virtual Food Photographer"
            isActive={activeTab === 'photographer'}
            onClick={() => setActiveTab('photographer')}
          />
          <TabButton
            label="AI Image Editor"
            isActive={activeTab === 'editor'}
            onClick={() => setActiveTab('editor')}
          />
        </div>

        <div className="transition-opacity duration-500">
          {activeTab === 'photographer' && <FoodPhotographer />}
          {activeTab === 'editor' && <ImageEditor />}
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm mt-8">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm md:text-base font-medium focus:outline-none transition-all duration-300 -mb-px border-b-2
        ${
          isActive
            ? 'border-indigo-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
        }`}
    >
      {label}
    </button>
  );
};

export default App;
