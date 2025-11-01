
import React, { useState, useCallback } from 'react';
import { generateFoodImage } from '../services/geminiService';
import { ImageStyle, MenuItem } from '../types';
import { Spinner } from './Spinner';

const StyleButton: React.FC<{
  style: ImageStyle;
  currentStyle: ImageStyle;
  setStyle: (style: ImageStyle) => void;
}> = ({ style, currentStyle, setStyle }) => (
  <button
    onClick={() => setStyle(style)}
    className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
      currentStyle === style
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    {style}
  </button>
);

export const FoodPhotographer: React.FC = () => {
    const [menuText, setMenuText] = useState<string>('Margherita Pizza - Fresh mozzarella, San Marzano tomatoes, basil.\nClassic Beef Burger - 1/4 pound beef patty, cheddar cheese, lettuce, tomato, on a brioche bun.\nCaesar Salad - Romaine lettuce, croutons, parmesan cheese, and Caesar dressing.');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [style, setStyle] = useState<ImageStyle>(ImageStyle.BrightModern);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const parseAndGenerate = useCallback(async () => {
        if (!menuText.trim()) {
            setError("Menu cannot be empty.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const lines = menuText.trim().split('\n').filter(line => line.includes(' - '));
        const initialItems: MenuItem[] = lines.map((line, index) => {
            const parts = line.split(' - ');
            return {
                id: `${Date.now()}-${index}`,
                name: parts[0],
                description: parts.slice(1).join(' - '),
                imageUrl: `https://picsum.photos/seed/${Math.random()}/512`, // Placeholder
                isLoading: true,
            };
        });
        setMenuItems(initialItems);

        try {
            await Promise.all(
                initialItems.map(async (item, index) => {
                    const imageUrl = await generateFoodImage(item.name, item.description, style);
                    setMenuItems(prevItems => {
                        const newItems = [...prevItems];
                        newItems[index] = { ...newItems[index], imageUrl, isLoading: false };
                        return newItems;
                    });
                })
            );
        } catch (e) {
            console.error(e);
            setError("An error occurred while generating images. Please check your setup and try again.");
            // Set all items to not loading on error
             setMenuItems(prevItems => prevItems.map(item => ({...item, isLoading: false})));
        } finally {
            setIsLoading(false);
        }

    }, [menuText, style]);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-md border border-gray-700 space-y-6">
                <div>
                    <label htmlFor="menu" className="block text-lg font-medium text-gray-200 mb-2">1. Paste Your Menu</label>
                    <textarea
                        id="menu"
                        rows={6}
                        value={menuText}
                        onChange={(e) => setMenuText(e.target.value)}
                        placeholder="e.g., Dish Name - Description..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                    />
                     <p className="text-xs text-gray-400 mt-1">Enter each item on a new line, separated by ' - '. For example: "Margherita Pizza - Fresh mozzarella..."</p>
                </div>
                <div>
                    <h3 className="block text-lg font-medium text-gray-200 mb-3">2. Choose a Style</h3>
                    <div className="flex flex-wrap gap-3">
                        <StyleButton style={ImageStyle.BrightModern} currentStyle={style} setStyle={setStyle} />
                        <StyleButton style={ImageStyle.RusticDark} currentStyle={style} setStyle={setStyle} />
                        <StyleButton style={ImageStyle.SocialMedia} currentStyle={style} setStyle={setStyle} />
                    </div>
                </div>
                <div>
                    <button
                        onClick={parseAndGenerate}
                        disabled={isLoading}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center text-lg"
                    >
                        {isLoading ? <Spinner className="w-6 h-6 mr-3" /> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        }
                        {isLoading ? 'Generating Your Photos...' : '3. Generate Photos'}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            
            {menuItems.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Your Photographed Menu</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuItems.map((item) => (
                             <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 transform hover:-translate-y-1 transition-transform duration-300">
                                <div className="aspect-square w-full relative bg-gray-900">
                                    {item.isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                            <Spinner className="w-10 h-10" />
                                        </div>
                                    )}
                                    <img src={item.imageUrl} alt={item.name} className={`object-cover w-full h-full transition-opacity duration-500 ${item.isLoading ? 'opacity-30 blur-sm' : 'opacity-100'}`} />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-white">{item.name}</h3>
                                    <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
