import React, { useState, useEffect } from 'react';
import { getGeminiApiKey, setGeminiApiKey } from '../lib/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      const savedKey = getGeminiApiKey();
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [isOpen]);
  
  const handleSave = () => {
    setGeminiApiKey(apiKey);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Gemini API Key</h3>
        <p className="py-4">
          Enter your Gemini API key to enable AI caption enhancement. 
          You can get a free API key from the 
          <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="link link-primary"> Google AI Studio</a>.
        </p>
        <div className="form-control">
          <label className="label">
            <span className="label-text">API Key</span>
          </label>
          <input
            type="password"
            placeholder="Enter your Gemini API key"
            className="input input-bordered w-full"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
