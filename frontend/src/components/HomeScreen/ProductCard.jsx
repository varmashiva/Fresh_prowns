import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, addToCart, navigate }) => {
    const defaultSize = product.sizes?.find(s => s.size === 'Small') || product.sizes?.[0];
    const [selectedSize, setSelectedSize] = useState(defaultSize?.size);
    const [qty, setQty] = useState(0.5);
    const [isImgLoaded, setIsImgLoaded] = useState(false);

    const isOverallInStock = product.overallStockStatus === 'inStock';
    const selectedSizeData = product.sizes?.find(s => s.size === selectedSize);
    const activeImages = (selectedSizeData?.images && selectedSizeData.images.length > 0) ? selectedSizeData.images : (product.images || []);
    const currentImgSrc = activeImages[0]?.url || product.image;

    const handleQtyChange = (val) => {
        if (val < 0.5) val = 0.5;
        if (val > 25) val = 25;
        setQty(val);
    };

    const formatQty = (q) => {
        if (q === 0.5) return '500g';
        if (q % 1 !== 0) return `${Math.floor(q)}.5 kg`;
        return `${q} kg`;
    };

    const originalDisplayPrice = defaultSize ? defaultSize.price : 0;
    const discountedDisplayPrice = product.discount > 0 ? Math.round(originalDisplayPrice * (1 - product.discount / 100)) : originalDisplayPrice;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-[#0c0c0c] border border-[#222] rounded-[32px] p-5 md:p-6 lg:p-10 flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-16 hover:border-[#333] transition-colors duration-500 shadow-2xl relative items-center justify-between overflow-hidden group/card"
            style={{ fontFamily: 'Froople, sans-serif' }}
        >
            {/* Noise Texture */}
            <div className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Left Side: Product Image */}
            <div className="w-full md:w-[45%] lg:w-[40%] h-[250px] md:h-[350px] lg:h-[500px] relative z-10">
                <Link to={`/product/${product._id}`} className="block w-full h-full overflow-hidden rounded-[24px] border border-[#1a1a1a] bg-[#050505] relative group shadow-inner">
                    {!isImgLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-20">
                            <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin"></div>
                        </div>
                    )}
                    <img
                        src={currentImgSrc}
                        alt={product.name}
                        loading="lazy"
                        onLoad={() => setIsImgLoaded(true)}
                        className={`w-full h-full object-cover object-center grayscale-[10%] group-hover:grayscale-0 transition-opacity duration-700 group-hover:scale-105 ${isImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                </Link>
            </div>

            {/* Right Side: Product Details */}
            <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col h-full md:py-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 md:mb-6">
                    <Link to={`/product/${product._id}`}>
                        <h3 className="text-3xl md:text-[48px] lg:text-[56px] font-[700] text-white tracking-tight leading-none capitalize">{product.name}</h3>
                    </Link>
                    <div className="flex flex-col items-start sm:items-end text-left sm:text-right flex-shrink-0">
                        <span className="text-[#777] text-[10px] md:text-[11px] font-[600] uppercase tracking-widest mb-1">Starting At</span>
                        <div className="flex items-baseline gap-1 md:gap-2">
                            <span className="text-white font-[800] text-2xl md:text-[32px] lg:text-[42px] tracking-tighter leading-none">₹{discountedDisplayPrice}</span>
                            {product.discount > 0 && (
                                <span className="text-[#555] font-[600] text-sm md:text-lg lg:text-xl line-through">₹{originalDisplayPrice}</span>
                            )}
                            <span className="text-[#777] text-xs md:text-sm lg:text-base font-[600] tracking-normal uppercase">/ kg</span>
                        </div>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#222] mb-10 relative">
                    <div className="absolute left-0 -top-[5px] text-[#444] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[5px] text-[#444] text-[10px] font-mono">+</div>
                </div>

                {product.sizes && product.sizes.length > 0 ? (
                    <div className="flex flex-col gap-y-4 md:gap-y-6 mb-8 md:mb-12">
                        {product.sizes.map((sizeObj, idx) => {
                            const isSelectedSize = selectedSize === sizeObj.size;
                            const outOfStock = sizeObj.stockStatus !== 'inStock';

                            return (
                                <div
                                    key={idx}
                                    onClick={() => !outOfStock && setSelectedSize(sizeObj.size)}
                                    className={`flex flex-col p-3 rounded-xl border transition-all duration-300 group/size ${outOfStock ? 'opacity-40 cursor-not-allowed border-transparent' : isSelectedSize ? 'bg-white/5 border-white/20 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'border-transparent hover:border-white/10 cursor-pointer'}`}
                                >
                                    <div className="flex items-center text-[#eaeaea] text-[15px] lg:text-[17px] font-[600] tracking-wide mb-0.5">
                                        <div className={`mr-3 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelectedSize ? 'border-white bg-white' : 'border-white/30 bg-transparent group-hover/size:border-white/50'}`}>
                                            {isSelectedSize && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                                        </div>
                                        <span className={isSelectedSize ? 'text-white' : 'text-white/70'}>{sizeObj.size}</span>
                                        <div className="ml-auto flex items-baseline gap-2">
                                            <span className={`font-mono ${isSelectedSize ? 'text-green-400' : 'text-white/60'}`}>₹{product.discount > 0 ? Math.round(sizeObj.price * (1 - product.discount / 100)) : sizeObj.price}</span>
                                            {product.discount > 0 && (
                                                <span className="text-[#555] font-mono text-[11px] line-through">₹{sizeObj.price}</span>
                                            )}
                                            <span className="text-[10px] font-sans opacity-60 ml-0.5">/kg</span>
                                        </div>
                                    </div>
                                    <div className={`pl-7 text-[11px] font-[600] tracking-widest uppercase ${outOfStock ? 'text-red-500/80' : isSelectedSize ? 'text-white/60' : 'text-white/30'}`}>
                                        {outOfStock ? 'Sold Out' : isSelectedSize ? 'Cleaned & Ready' : 'Select Variant'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center text-[#aaaaaa] text-[16px] font-[500] tracking-wide mb-16">
                        <span className="mr-4 text-white text-[10px] opacity-70">⊕</span>
                        <span className={`${isOverallInStock ? 'text-white' : 'text-red-400'}`}>
                            {isOverallInStock ? 'In Stock & Ready' : 'Out of Stock'}
                        </span>
                    </div>
                )}

                <div className="w-full py-3 text-center text-[#888] text-[10px] md:text-[11px] font-semibold tracking-widest uppercase">
                    <p className="leading-relaxed">
                        <span className="text-[13px] mr-1.5 inline-block -translate-y-[1px]">⚠️</span>
                        For bulk orders please contact
                        <a href="tel:+918884143699" className="text-white hover:text-green-400 transition-colors ml-1 whitespace-nowrap">+91 8884143699</a>
                    </p>
                </div>

                <div className="mt-auto w-full flex flex-col sm:flex-row items-center gap-4 border-t border-[#1a1a1a] pt-6 md:pt-8 bg-transparent relative z-10">
                    <div className="flex items-center justify-center bg-[#111] border border-[#222] rounded-[16px] px-4 py-1 h-[48px] md:h-[56px] w-full sm:w-auto flex-shrink-0">
                        <button onClick={() => handleQtyChange(qty - 0.5)} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xl">−</button>
                        <input type="text" value={formatQty(qty)} readOnly className="bg-transparent text-center w-20 font-bold font-mono text-white text-[13px]" />
                        <button onClick={() => handleQtyChange(qty + 0.5)} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xl">+</button>
                    </div>

                    <div className="w-full">
                        {isOverallInStock ? (
                            <button
                                onClick={async () => {
                                    const basePrice = selectedSizeData ? selectedSizeData.price : 0;
                                    const finalPrice = product.discount > 0 ? Math.round(basePrice * (1 - product.discount / 100)) : basePrice;
                                    const success = await addToCart(product, selectedSize, finalPrice, qty);
                                    if (success) navigate('/cart');
                                    else navigate('/login');
                                }}
                                className="w-full bg-white hover:bg-[#f0f0f0] text-[#111] font-[900] py-[14px] md:py-[18px] rounded-[16px] text-center transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.35)] flex items-center justify-center gap-2 tracking-[0.15em] uppercase text-[11px] md:text-[13px]"
                            >
                                <span>Add To Cart</span>
                                <span className="opacity-30">|</span>
                                <span className="font-mono">
                                    ₹{Math.round((selectedSizeData ? (product.discount > 0 ? selectedSizeData.price * (1 - product.discount / 100) : selectedSizeData.price) : 0) * qty)}
                                </span>
                            </button>
                        ) : (
                            <button disabled className="w-full bg-[#1a1a1a] text-[#555] font-[900] py-[12px] md:py-[18px] rounded-[16px] text-center cursor-not-allowed uppercase tracking-[0.15em] text-[11px] md:text-[13px] border border-[#222]">Sold Out</button>
                        )}
                    </div>

                    <div className="w-full mt-6 px-2 text-center">
                        <p className="text-[10px] md:text-[11px] text-[#888] font-bold tracking-widest uppercase leading-relaxed">
                            📍 Currently, we are serving selected communities in <span className="text-white">LB Nagar</span>,
                            <br className="hidden sm:block" /> while bulk orders are delivered across <span className="text-white">Hyderabad</span>.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
