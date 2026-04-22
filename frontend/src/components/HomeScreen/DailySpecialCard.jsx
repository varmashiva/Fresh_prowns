import { useState } from 'react';
import { Link } from 'react-router-dom';

const DailySpecialCard = ({ item, handleAddItemToCart }) => {
    const [selectedWeight, setSelectedWeight] = useState('500g');

    const weightMultiplier = selectedWeight === '500g' ? 0.5 : 1;
    const salePrice = Math.round(item.marketPrice * weightMultiplier);
    const oldPrice = Math.round(salePrice * 1.3);

    return (
        <div className="bg-[#0c0c0c] border border-[#222] rounded-[18px] md:rounded-[24px] p-3 md:p-4 flex flex-col hover:border-[#444] transition-colors duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden group/item">
            
            {/* Image container */}
            <div className="w-full aspect-[4/5] relative rounded-[16px] overflow-hidden mb-5 border border-[#1a1a1a]">
                <Link to={`/product/${item._id}`} className="block w-full h-full relative z-10">
                    <img 
                        src={item.images?.[0]?.url} 
                        alt={item.name} 
                        loading="lazy"
                        className="w-full h-full object-cover object-center grayscale-[15%] group-hover/item:grayscale-0 transition-all duration-700 group-hover/item:scale-[1.03]" 
                    />
                </Link>
                
                {/* Top Left Tag */}
                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 bg-[#eaeaea] text-black text-[9px] md:text-[11px] font-[900] px-2.5 md:px-3 py-1 md:py-1.5 rounded-[4px] md:rounded-[6px] uppercase tracking-widest shadow-xl pointer-events-none">
                    FRESH CATCH
                </div>
                
                {/* Floating Cart Button */}
                <button
                    onClick={() => handleAddItemToCart(item, selectedWeight)}
                    className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20 w-9 md:w-12 h-9 md:h-12 bg-[#eaeaea] text-black rounded-full flex items-center justify-center hover:scale-110 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all shadow-xl"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-5 md:h-5">
                        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    </svg>
                </button>
            </div>

            {/* Info section */}
            <div className="flex flex-col px-2 flex-grow">
                <Link to={`/product/${item._id}`}>
                    <h3 className="text-[19px] md:text-[18px] font-[800] text-white tracking-wide leading-[1.3] capitalize mb-3 md:mb-3 line-clamp-2 hover:text-gray-300 transition-colors">
                        {item.name}
                    </h3>
                </Link>

                {/* Size selector */}
                <div className="flex items-center gap-2 md:gap-2 mb-4 md:mb-4">
                    {['500g', '1kg'].map(w => (
                        <button
                            key={w}
                            onClick={() => setSelectedWeight(w)}
                            className={`px-3 md:px-3 py-1.5 md:py-1.5 rounded-[6px] md:rounded-[6px] text-[11px] md:text-[11px] font-[800] uppercase tracking-widest border transition-all ${
                                selectedWeight === w
                                    ? 'bg-[#eaeaea] text-black border-[#eaeaea]'
                                    : 'bg-transparent text-[#666] border-[#333] hover:border-[#555] hover:text-[#aaa]'
                            }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>

                {/* Bottom Price elements */}
                <div className="flex items-center gap-3 md:gap-3 mt-auto pt-2 border-t border-[#1a1a1a]">
                    <span className="text-white font-[800] text-[24px] md:text-[24px] tracking-tight">₹{salePrice}</span>
                    <span className="text-[#555] font-[600] text-[14px] md:text-[15px] line-through">₹{oldPrice}</span>
                </div>
            </div>
        </div>
    );
};

export default DailySpecialCard;
