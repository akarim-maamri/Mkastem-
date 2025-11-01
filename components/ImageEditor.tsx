
import React, { useState, useCallback, useRef } from 'react';
import { editImageWithPrompt } from '../services/geminiService';
import { Spinner } from './Spinner';

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const ImageEditor: React.FC = () => {
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setOriginalImageFile(file);
            setOriginalImageUrl(URL.createObjectURL(file));
            setEditedImageUrl(null);
            setError(null);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleSubmit = useCallback(async () => {
        if (!originalImageFile || !prompt) {
            setError("Please upload an image and provide an editing prompt.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImageUrl(null);
        try {
            const resultUrl = await editImageWithPrompt(originalImageFile, prompt);
            setEditedImageUrl(resultUrl);
        } catch (e) {
            console.error(e);
            setError("Failed to edit image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [originalImageFile, prompt]);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-md border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {!originalImageUrl && (
                        <div 
                            onClick={triggerFileSelect}
                            className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-gray-800 transition-all cursor-pointer"
                        >
                            <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
                            <p className="text-lg font-semibold">Click to upload an image</p>
                            <p className="text-gray-400">PNG, JPG, or WEBP</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        </div>
                    )}

                    {originalImageUrl && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-center text-gray-300">Original Image</h3>
                            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
                                <img src={originalImageUrl} alt="Original" className="object-contain max-h-full max-w-full" />
                            </div>
                             <button 
                                onClick={triggerFileSelect}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                                <UploadIcon className="w-5 h-5 mr-2" />
                                Change Image
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        </div>
                    )}

                    {originalImageUrl && (
                         <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-center text-gray-300">Edited Image</h3>
                            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
                                {isLoading ? (
                                    <div className="flex flex-col items-center">
                                        <Spinner className="w-12 h-12" />
                                        <p className="mt-4 text-gray-400">Editing in progress...</p>
                                    </div>
                                ) : editedImageUrl ? (
                                    <img src={editedImageUrl} alt="Edited" className="object-contain max-h-full max-w-full" />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <p>Your edited image will appear here.</p>
                                    </div>
                                )}
                            </div>
                             <button
                                onClick={handleSubmit}
                                disabled={isLoading || !prompt}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                                {isLoading ? <Spinner className="w-5 h-5 mr-2" /> : 
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                }
                                {isLoading ? 'Generating...' : 'Apply Edit'}
                            </button>
                        </div>
                    )}
                </div>

                {originalImageUrl && (
                    <div className="mt-6">
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Editing Prompt</label>
                        <textarea
                            id="prompt"
                            rows={2}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'add a retro filter', 'make the hair blue', 'remove the background'"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-white"
                        />
                    </div>
                )}
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};
