"use client";
import React, { useState } from 'react';
import { BiMap, BiX, BiCheck, BiSearch } from 'react-icons/bi';

interface Region {
  id: string;
  name: string;
  province: string;
}

interface RegionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (region: Region) => void;
  currentRegion?: Region;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  currentRegion = { id: 'jakarta', name: 'Jakarta', province: 'DKI Jakarta' }
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region>(currentRegion);
  
  // Demo regions data
  const regions: Region[] = [
    { id: 'jakarta', name: 'Jakarta', province: 'DKI Jakarta' },
    { id: 'bandung', name: 'Bandung', province: 'Jawa Barat' },
    { id: 'surabaya', name: 'Surabaya', province: 'Jawa Timur' },
    { id: 'medan', name: 'Medan', province: 'Sumatera Utara' },
    { id: 'makassar', name: 'Makassar', province: 'Sulawesi Selatan' },
    { id: 'semarang', name: 'Semarang', province: 'Jawa Tengah' },
    { id: 'palembang', name: 'Palembang', province: 'Sumatera Selatan' },
    { id: 'balikpapan', name: 'Balikpapan', province: 'Kalimantan Timur' },
    { id: 'denpasar', name: 'Denpasar', province: 'Bali' },
    { id: 'yogyakarta', name: 'Yogyakarta', province: 'DI Yogyakarta' },
  ];
  
  // Filter regions by search query
  const filteredRegions = regions.filter(region => 
    region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    region.province.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectRegion = (region: Region) => {
    setSelectedRegion(region);
  };
  
  const handleSubmit = () => {
    onSelect(selectedRegion);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <BiMap className="mr-2" /> Pilih Wilayah
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <BiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <BiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700"
              placeholder="Cari wilayah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
            {filteredRegions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Tidak ada wilayah yang sesuai dengan pencarian Anda
              </p>
            ) : (
              filteredRegions.map(region => (
                <button
                  key={region.id}
                  onClick={() => handleSelectRegion(region)}
                  className={`w-full flex items-center p-3 rounded-lg border transition-all ${
                    selectedRegion.id === region.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <p className="font-medium">{region.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{region.province}</p>
                  </div>
                  {selectedRegion.id === region.id && (
                    <BiCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  )}
                </button>
              ))
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-3 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center"
            >
              <BiCheck className="mr-1" /> Pilih
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;
