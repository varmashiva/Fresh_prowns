import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ProductScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(0.5);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('Medium');
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [isPremium, setIsPremium] = useState(true);
    const [relatedItems, setRelatedItems] = useState([]);

    const formatQty = (q) => {
        if (q === 0.5) return '500g';
        if (q % 1 !== 0) return `${Math.floor(q)}.5 kg`;
        return `${q} kg`;
    };

    const { socket } = useContext(SocketContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Step 1: Try to fetch as a Premium Product
                try {
                    const { data } = await api.get(`/products/${id}`);
                    setProduct(data);
                    setIsPremium(true);
                    
                    if (data.sizes && data.sizes.length > 0) {
                        const availableSize = data.sizes.find(s => s.stockStatus === 'inStock');
                        if (availableSize) {
                            setSelectedSize(availableSize.size);
                        } else {
                            setSelectedSize(data.sizes[0].size);
                        }
                    }
                } catch (prodErr) {
                    // Step 2: If not found, try to fetch as a Daily Special (Item)
                    const { data } = await api.get(`/items/${id}`);
                    setProduct(data);
                    setIsPremium(false);
                    setSelectedSize('Standard');
                    
                    // Fetch related items for comparison/upsell
                    const itemsRes = await api.get('/items');
                    setRelatedItems(itemsRes.data.filter(i => i._id !== id).slice(0, 4));
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch product/item:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (socket && isPremium) {
            socket.on('sizeStockUpdated', (data) => {
                if (data.productId === id) {
                    setProduct((prev) => {
                        if (!prev) return prev;
                        const newSizes = prev.sizes.map(s => s.size === data.size ? {
                            ...s,
                            price: data.price,
                            stockStatus: data.stockStatus,
                            description: data.description
                        } : s);

                        if (selectedSize === data.size && data.stockStatus === 'outOfStock') {
                            const newAvailable = newSizes.find(s => s.stockStatus === 'inStock' && s.size !== data.size);
                            if (newAvailable) setSelectedSize(newAvailable.size);
                        }

                        return {
                            ...prev,
                            overallStockStatus: data.overallStockStatus,
                            sizes: newSizes
                        };
                    });
                }
            });
        }
        return () => {
            if (socket) {
                socket.off('sizeStockUpdated');
            }
        };
    }, [socket, id, selectedSize, isPremium]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );
    
    if (!product) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <Link to="/" className="text-sm border-b border-white pb-1">Back to Home</Link>
        </div>
    );

    const getSelectedSizeData = () => {
        if (isPremium) {
            const sizeData = product.sizes?.find(s => s.size === selectedSize) || { price: 0, stockStatus: 'outOfStock', description: 'Description unavailable.' };
            const discount = product.discount || 0;
            return {
                ...sizeData,
                originalPrice: sizeData.price,
                price: discount > 0 ? Math.round(sizeData.price * (1 - discount / 100)) : sizeData.price,
                discount
            };
        } else {
            const discount = product.discount || 0;
            return {
                originalPrice: product.marketPrice,
                price: discount > 0 ? Math.round(product.marketPrice * (1 - discount / 100)) : product.marketPrice,
                stockStatus: 'inStock',
                description: product.description || '',
                discount
            };
        }
    };

    const currentSizeData = getSelectedSizeData();
    const stockStatus = currentSizeData.stockStatus;
    const isAvailable = stockStatus === 'inStock';
    const isOverallInStock = isPremium ? (product.overallStockStatus === 'inStock') : true;

    const addToCartHandler = async () => {
        const success = await addToCart(product, selectedSize, currentSizeData.price, qty);
        if (success) {
            navigate('/cart');
        } else {
            navigate('/login');
        }
    };

    const activeImages = (currentSizeData.images && currentSizeData.images.length > 0) ? currentSizeData.images : (product.images || []);
    const safeMainImageIndex = mainImageIndex < activeImages.length ? mainImageIndex : 0;

    // RENDER: Cinematic Layout for Daily Specials (Items)
    if (!isPremium) {
        return (
            <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
                {/* Cinematic Noise Overlay */}
                <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full">
                    
                    {/* Back Link */}
                    <Link to="/" className="inline-flex items-center gap-2 text-[10px] md:text-[12px] font-[600] tracking-widest text-[#777] uppercase font-mono mb-8 md:mb-12 hover:text-white transition-colors duration-300">
                        <span className="text-[16px] leading-none -mt-[2px]">&larr;</span> BACK TO COLLECTION
                    </Link>

                    <div className="w-full flex pb-6 md:pb-12 relative">
                        <div className="w-full md:w-1/4 hidden md:block">
                            <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-white/50 block mt-4 uppercase font-mono">
                                (Daily Special)
                            </span>
                        </div>
                        <div className="w-full md:w-3/4 text-left">
                            <h1 className="text-[45px] md:text-[70px] lg:text-[100px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                                {product.name}
                            </h1>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0">
                        <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                        <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    </div>

                    <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-20">
                        {/* Left: Image Container */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-4">
                            <div className="w-full aspect-square bg-[#0c0c0c] rounded-[16px] overflow-hidden relative group border border-[#1a1a1a]">
                                <img
                                    src={activeImages[safeMainImageIndex]?.url || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                />
                                {activeImages.length > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setMainImageIndex(prev => (prev === 0 ? activeImages.length - 1 : prev - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                                        >
                                            <FaChevronLeft size={14} />
                                        </button>
                                        <button 
                                            onClick={() => setMainImageIndex(prev => (prev === activeImages.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                                        >
                                            <FaChevronRight size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {activeImages.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {activeImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setMainImageIndex(idx)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-[8px] overflow-hidden transition-all duration-300 border ${safeMainImageIndex === idx ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        >
                                            <img src={img.url} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Info Section */}
                        <div className="w-full lg:w-1/2 flex flex-col">
                            <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-8 flex flex-col relative overflow-hidden">
                                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                                <div className="relative z-10">
                                    <div className="pb-10 border-b border-[#222]">
                                        <div className="flex items-center justify-between mb-5">
                                            <span className="text-[#777] font-[700] text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-mono">Weight Selection</span>
                                            <div className="h-[1px] flex-grow mx-4 bg-[#222]"></div>
                                        </div>
                                        <div className="flex gap-4">
                                            {['500g', '1kg'].map(w => (
                                                <button 
                                                    key={w}
                                                    onClick={() => setQty(w === '500g' ? 0.5 : 1)}
                                                    className={`px-8 py-3 rounded-[6px] text-[12px] md:text-[13px] font-[800] tracking-[0.05em] transition-all duration-300 border ${
                                                        (w === '500g' ? qty === 0.5 : qty === 1)
                                                        ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                                        : 'bg-[#121212] border-[#222] text-white/50 hover:border-white/30 hover:text-white'
                                                    }`}
                                                >
                                                    {w.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="py-8 border-b border-[#222] flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[#777] font-[700] text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-mono mb-3">Price Value</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-white font-[900] text-[40px] md:text-[52px] tracking-tighter leading-none">₹{Math.round(currentSizeData.price * qty)}</span>
                                                {currentSizeData.discount > 0 && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[#555] text-[14px] md:text-[16px] line-through font-mono leading-none mb-1">₹{Math.round(currentSizeData.originalPrice * qty)}</span>
                                                        <span className="text-green-500 text-[10px] font-bold tracking-widest uppercase">SAVE {currentSizeData.discount}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[#777] font-[700] text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-mono mb-3">Status</span>
                                            <span className="text-[10px] md:text-[11px] font-[800] uppercase tracking-[0.15em] px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-[4px] backdrop-blur-sm">DAILY CATCH</span>
                                        </div>
                                    </div>

                                    <div className="py-8">
                                        <button 
                                            onClick={addToCartHandler}
                                            className="w-full py-[20px] md:py-[24px] rounded-[10px] font-[900] text-[13px] md:text-[14px] uppercase tracking-[0.2em] bg-[#f0f0f0] text-black hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-4 group"
                                        >
                                            <FaShoppingCart className="group-hover:translate-x-1 transition-transform" />
                                            ADD {qty === 0.5 ? '500G' : '1KG'} TO CART
                                        </button>
                                    </div>

                                    {/* Product Specifications Section */}
                                    <div className="mt-8 space-y-0 border-t border-[#222]">
                                        {[
                                            { label: 'Product Description', value: product.description },
                                            { label: 'Usage & Preparation', value: product.usageInstructions },
                                            { label: 'Shelf Life & Storage', value: product.shelfLifeStorage }
                                        ].map((spec, i) => spec.value && (
                                            <div key={i} className="group border-b border-[#111] last:border-b-0 py-8 px-2 transition-all duration-300 hover:bg-white/[0.02]">
                                                <div className="flex items-start gap-6 border-l-2 border-[#333] pl-6 group-hover:border-white transition-colors duration-500">
                                                    <div className="flex flex-col gap-2">
                                                        <h3 className="text-[10px] md:text-[11px] font-[700] tracking-[0.25em] text-[#666] group-hover:text-[#aaa] uppercase font-mono transition-colors">{spec.label}</h3>
                                                        <p className="text-[#999] group-hover:text-[#eee] text-[14px] md:text-[16px] leading-relaxed font-[450] transition-colors">{spec.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bulk Order Contact */}
                                    <div className="w-full mt-12 py-8 text-center text-[#777] text-[10px] md:text-[11px] font-[700] tracking-[0.2em] uppercase border-t border-[#111] bg-gradient-to-b from-transparent to-white/[0.01]">
                                        <p className="leading-relaxed opacity-60 hover:opacity-100 transition-opacity duration-500">
                                            For bulk orders please contact
                                            <br className="sm:hidden" />
                                            <a href="tel:+918884143699" className="text-white hover:text-green-500 transition-colors ml-2 font-black border-b border-white/20 pb-0.5">+91 8884143699</a>
                                        </p>
                                    </div>

                                    {/* Delivery Area Info */}
                                    <div className="w-full mt-2 text-center pb-8 opacity-50 hover:opacity-100 transition-opacity duration-700">
                                        <p className="text-[9px] md:text-[10px] text-[#666] font-[800] tracking-[0.25em] uppercase leading-[2] max-w-[500px] mx-auto px-4">
                                            📍 Currently serving selected communities in <span className="text-white">LB Nagar</span>,
                                            <span className="inline-block mx-2 opacity-30">|</span> 
                                            Bulk orders delivered across <span className="text-white">Hyderabad</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products Section */}
                    {relatedItems.length > 0 && (
                        <div className="w-full mt-32">
                            <div className="flex items-center gap-4 mb-12">
                                <h2 className="text-[20px] md:text-[24px] font-black uppercase tracking-tighter text-white">Suggested Fresh Catch</h2>
                                <div className="flex-grow h-[1px] bg-[#222] relative">
                                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedItems.map(item => (
                                    <Link 
                                        to={`/product/${item._id}`} 
                                        key={item._id} 
                                        className="group flex flex-col bg-[#0c0c0c] border border-[#1a1a1a] rounded-[18px] p-4 hover:border-[#333] transition-all"
                                    >
                                        <div className="aspect-square rounded-[12px] overflow-hidden bg-black mb-4 relative">
                                            <img src={item.images?.[0]?.url || item.image} alt={item.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                                        </div>
                                        <h3 className="text-[15px] font-[800] text-white mb-3 uppercase tracking-tight truncate">{item.name}</h3>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-[18px] font-black text-white font-mono">₹{item.marketPrice}</span>
                                            <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                +
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // RENDER: Premium Cinematic Layout for Specialty Products
    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full">

                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-[10px] md:text-[12px] font-[600] tracking-widest text-[#777] uppercase font-mono mb-8 md:mb-12 hover:text-white transition-colors duration-300">
                    <span className="text-[16px] leading-none -mt-[2px]">&larr;</span> BACK TO COLLECTION
                </Link>

                <div className="w-full flex pb-6 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-white/50 block mt-4 uppercase font-mono">
                            (Product Details)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left">
                        <h1 className="text-[45px] md:text-[70px] lg:text-[100px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            {product.name}
                        </h1>
                        {!isOverallInStock && (
                            <div className="mt-4 inline-block px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[4px] text-[11px] font-[700] uppercase tracking-widest">
                                Entirely Sold Out
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>

                {/* Main Content Split */}
                <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left: Images */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="w-full aspect-square bg-[#0c0c0c] rounded-[16px] overflow-hidden relative group">
                            <img
                                src={activeImages[safeMainImageIndex]?.url || product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        </div>

                        {activeImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {activeImages.map((img, idx) => (
                                    <button
                                        key={img.publicId || idx}
                                        onClick={() => setMainImageIndex(idx)}
                                        className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-[8px] overflow-hidden transition-all duration-300 ${safeMainImageIndex === idx ? 'border-2 border-white opacity-100' : 'border border-transparent opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-12">

                        <div className="mb-10">
                            <p className="text-sm md:text-[18px] text-[#999] font-[400] leading-[1.6] max-w-[600px] min-h-[60px] transition-all duration-300">
                                {currentSizeData.description}
                            </p>
                        </div>

                        {/* Interactive Selection Block */}
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-8 flex flex-col relative overflow-hidden">
                            {/* Inner Noise */}
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <div className="relative z-10">
                                {/* Sizes */}
                                <div className="pb-8 border-b border-[#222]">
                                    <span className="block text-[#777] font-[600] text-[11px] mb-4 uppercase tracking-widest font-mono">Select Size</span>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes?.map(sizeItem => {
                                            const isSelected = selectedSize === sizeItem.size;
                                            const isOutOfStock = sizeItem.stockStatus === 'outOfStock';

                                            return (
                                                <button
                                                    key={sizeItem.size}
                                                    onClick={() => !isOutOfStock && setSelectedSize(sizeItem.size)}
                                                    disabled={isOutOfStock}
                                                    className={`
                                                        relative px-5 py-2.5 rounded-[4px] font-[600] text-[13px] tracking-wide transition-all overflow-hidden border
                                                        ${isSelected
                                                            ? 'bg-[#eaeaea] border-[#eaeaea] text-[#111]'
                                                            : 'bg-transparent border-[#333] text-white/70 hover:border-white/50 hover:bg-white/5'
                                                        }
                                                        ${isOutOfStock ? 'opacity-30 cursor-not-allowed saturate-0' : ''}
                                                    `}
                                                >
                                                    <span className="relative z-10">{sizeItem.size}</span>
                                                    {isOutOfStock && (
                                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#eaeaea] opacity-60 -translate-y-1/2 rotate-12 z-20 pointer-events-none"></div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dynamic Pricing & Status */}
                                <div className="py-6 border-b border-[#222] flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[#777] font-[600] text-[10px] uppercase tracking-widest font-mono mb-1">Price</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-white font-[800] text-[32px] md:text-[40px] tracking-tighter leading-none">₹{currentSizeData.price}</span>
                                            {currentSizeData.discount > 0 && (
                                                <span className="text-[#555] text-[16px] md:text-[18px] line-through font-mono">₹{currentSizeData.originalPrice}</span>
                                            )}
                                            <span className="text-[#777] text-sm font-[600] tracking-wider uppercase">/kg</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[#777] font-[600] text-[10px] uppercase tracking-widest font-mono mb-2">Status</span>
                                        <span className={`text-[12px] font-[600] uppercase tracking-widest px-3 py-1 rounded-[4px] border border-dashed ${isAvailable ? 'text-[#888] border-[#444] bg-[#111]' : 'text-red-500 border-red-500/30 bg-red-500/5'}`}>
                                            {isAvailable ? 'Ship Ready' : 'Sold Out'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-6 flex flex-col gap-4">
                                    {isAvailable && (
                                        <div className="flex justify-between items-center border border-[#333] rounded-[8px] p-2 bg-black/50">
                                            <span className="text-[#777] font-[600] text-[11px] uppercase tracking-widest pl-3 font-mono">Qty</span>
                                            <select
                                                value={qty}
                                                onChange={(e) => setQty(Number(e.target.value))}
                                                className="bg-[#111] border border-[#333] rounded-[4px] px-4 py-2 text-white text-[14px] font-[500] focus:outline-none focus:border-white/50 cursor-pointer"
                                            >
                                                {Array.from({ length: 50 }).map((_, i) => {
                                                    const val = (i + 1) * 0.5;
                                                    return (
                                                        <option key={val} value={val}>
                                                            {formatQty(val)}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}

                                    <button
                                        onClick={addToCartHandler}
                                        disabled={!isAvailable}
                                        className={`w-full py-[16px] md:py-[20px] rounded-[8px] font-[800] text-[13px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 ${isAvailable ? 'bg-[#dcdcdc] text-[#111] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#333]'} mt-2 flex items-center justify-center gap-2`}
                                    >
                                        <span>{isAvailable ? `Add ${selectedSize} to Cart` : 'Sold Out'}</span>
                                        {isAvailable && (
                                            <>
                                                <span className="opacity-30">|</span>
                                                <span className="font-mono">₹{currentSizeData.price * qty}</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Bulk Order Contact */}
                                    <div className="w-full mt-4 py-4 text-center text-[#888] text-[10px] md:text-[11px] font-semibold tracking-widest uppercase">
                                        <p className="leading-relaxed">
                                            <span className="text-[13px] mr-1.5 inline-block -translate-y-[1px]"></span>
                                            For bulk orders please contact
                                            <a href="tel:+918884143699" className="text-white hover:text-green-400 transition-colors ml-1 whitespace-nowrap">+91 8884143699</a>
                                        </p>
                                    </div>

                                    {/* Delivery Area Info */}
                                    <div className="w-full mt-2 text-center pb-6">
                                        <p className="text-[10px] md:text-[11px] text-[#888] font-bold tracking-widest uppercase leading-relaxed">
                                            📍 Currently, we are serving selected communities in <span className="text-white">LB Nagar</span>,
                                            <br className="hidden sm:block" /> while bulk orders are delivered across <span className="text-white">Hyderabad</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;
