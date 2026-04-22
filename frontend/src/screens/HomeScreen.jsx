import { useState, useEffect, useContext, memo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { CartContext } from '../context/CartContext';

// Components
import HeroSection from '../components/HomeScreen/HeroSection';
import DailySpecialCard from '../components/HomeScreen/DailySpecialCard';
import ProductCard from '../components/HomeScreen/ProductCard';
import ParallaxImageBlock from '../components/HomeScreen/ParallaxImageBlock';
import FAQSection from '../components/HomeScreen/FAQSection';

// Assets
import bgVideo from '../assets/media/bg_vedio.mp4';
import img1 from '../assets/media/xyz1.avif';
import img2 from '../assets/media/xyz2.avif';
import img3 from '../assets/media/xyz3.avif';
import img4 from '../assets/media/xyz4.avif';

const HomeScreen = () => {
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartToast, setCartToast] = useState(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    
    const { socket } = useContext(SocketContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    // Parallax Scroll setup (Hero Video)
    const { scrollY } = useScroll();
    const videoY = useTransform(scrollY, [0, 1000], ['0%', '20%']);
    const videoOpacity = useTransform(scrollY, [0, 500], [0.8, 0.2]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, itemsRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/items')
                ]);
                setProducts(productsRes.data);
                setItems(itemsRes.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('sizeStockUpdated', (data) => {
                setProducts((prev) => prev.map((p) => {
                    if (p._id === data.productId) {
                        return {
                            ...p,
                            overallStockStatus: data.overallStockStatus,
                            sizes: p.sizes.map(s => s.size === data.size ? {
                                ...s,
                                price: data.price,
                                stockStatus: data.stockStatus,
                                description: data.description
                            } : s)
                        };
                    }
                    return p;
                }));
            });
            socket.on('itemCreated', (newItem) => {
                setItems(prev => [...prev, newItem]);
            });
        }
        return () => {
            if (socket) {
                socket.off('sizeStockUpdated');
                socket.off('itemCreated');
            }
        };
    }, [socket]);

    const handleAddItemToCart = async (item, selectedLabel) => {
        const qty = selectedLabel === '500g' ? 0.5 : 1;
        const size = 'Standard';
        const price = item.marketPrice;
        const success = await addToCart(item, size, price, qty);
        if (!success) {
            navigate('/login');
        } else {
            setCartToast({ name: item.name, size });
            setTimeout(() => setCartToast(null), 3000);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl animate-pulse">Loading Farm to Home</div>;

    const titleText = "FARM\nTO HOME";
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
    };
    const letterVariants = {
        hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", damping: 12, stiffness: 100 } }
    };
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 1.5, ease: "easeOut" } }
    };

    return (
        <div className="bg-black min-h-screen">
            {/* Cart Success Toast */}
            <AnimatePresence>
                {cartToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 bg-[#0c0c0c] border border-[#2a2a2a] rounded-[14px] px-5 py-4 shadow-2xl min-w-[280px]"
                    >
                        <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" className="w-5 h-5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-white uppercase">{cartToast.name}</span>
                            <span className="text-[11px] text-[#888]">Added to cart successfully</span>
                        </div>
                        <motion.div initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 3, ease: 'linear' }} style={{ originX: 0 }} className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500" />
                    </motion.div>
                )}
            </AnimatePresence>

            <HeroSection 
                isVideoLoaded={isVideoLoaded} 
                bgVideo={bgVideo} 
                videoY={videoY} 
                videoOpacity={videoOpacity} 
                setIsVideoLoaded={setIsVideoLoaded} 
                containerVariants={containerVariants} 
                titleText={titleText} 
                letterVariants={letterVariants} 
                fadeUpVariants={fadeUpVariants} 
            />

            <section className="bg-black pt-36 pb-24 px-4 md:px-12 relative overflow-hidden">
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <div className="mb-16 md:mb-24 w-full">
                        <div className="flex flex-col md:flex-row items-start w-full">
                            <div className="w-full md:w-[25%] mb-6 md:mb-0">
                                <p className="text-[#666] text-[11px] md:text-sm tracking-widest uppercase font-mono mt-4">(Pricing)</p>
                            </div>
                            <div className="w-full md:w-[75%] flex flex-col items-start overflow-hidden">
                                <motion.h2 
                                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                                    className="text-[50px] md:text-[110px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontFamily: 'Froople, sans-serif' }}>
                                    <span className="block">FRESH CATCH</span>
                                    <span className="block">OF THE DAY</span>
                                </motion.h2>
                            </div>
                        </div>
                        <div className="w-full h-[1px] bg-[#333] my-10 relative">
                            <div className="absolute left-0 -top-[7px] text-[#666] text-xs font-mono">+</div>
                            <div className="absolute right-0 -top-[7px] text-[#666] text-xs font-mono">+</div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start w-full">
                            <div className="hidden md:block w-[25%]"></div>
                            <div className="w-full md:w-[75%]">
                                <p className="text-[#aaaaaa] text-base md:text-[20px] max-w-3xl leading-[1.6]" style={{ fontFamily: 'Froople, sans-serif' }}>
                                    Our prawns are responsibly farmed in traditional freshwater ponds (cheruvulu) across coastal Andhra Pradesh. Harvested fresh and packed the same day to preserve natural taste and quality.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto mb-20">
                        <div className="w-full flex items-center gap-4 mb-6">
                            <h2 className="text-[20px] md:text-[30px] font-black tracking-tighter text-[#eaeaea] uppercase">Daily Specials</h2>
                            <span className="h-[1px] flex-1 bg-[#333]"></span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {items.map(item => (
                                <DailySpecialCard key={item._id} item={item} handleAddItemToCart={handleAddItemToCart} />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-12 w-full max-w-[1400px] mx-auto mt-20">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} addToCart={addToCart} navigate={navigate} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#0a0a0a] text-[#ededed] py-24 px-6 md:px-16 relative z-10">
                <div className="w-full max-w-7xl mx-auto flex flex-col">
                    <div className="flex pb-8 md:pb-12 border-b border-white/20 mb-16">
                        <div className="hidden md:block w-1/4">
                            <span className="text-xs font-semibold tracking-wider text-white/50">(Selection)</span>
                        </div>
                        <div className="w-full md:w-3/4">
                            <h2 className="text-[11vw] md:text-[7.2vw] font-bold leading-[0.85] tracking-tighter uppercase text-white">
                                PREMIUM<br/>SELECTION
                            </h2>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="hidden md:block w-1/4"></div>
                        <div className="w-full md:w-3/4">
                            <p className="text-sm md:text-lg text-white/80 font-medium leading-[1.6] mb-16 max-w-[600px]">
                                At Farm To Home, we bring you prawns just the way they leave the farm—fresh, clean, and honest.
                            </p>
                            <div className="flex flex-col w-full">
                                {[
                                    { num: '01', title: 'HARVEST FRESH' },
                                    { num: '02', title: 'PRECISION CLEANING' },
                                    { num: '03', title: 'FRESHSEAL PACKING' },
                                    { num: '04', title: 'SWIFTDOOR DELIVERY' },
                                ].map((item, index) => (
                                    <div key={index} onClick={() => document.getElementById(`prawn-image-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="flex justify-between items-center py-5 border-b border-white/10 group cursor-pointer hover:bg-white/[0.02] transition-all">
                                        <span className="text-xs md:text-[13px] font-bold tracking-widest uppercase group-hover:pl-4 transition-all text-white/80">{item.title}</span>
                                        <span className="text-xs md:text-[13px] font-bold text-white/60">{item.num}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-black py-12 md:py-24 px-0 md:px-8">
                {[
                    { img: img1, title: 'HARVEST FRESH', description: 'Every prawn begins its journey in carefully maintained freshwater ponds.' },
                    { img: img2, title: 'PRECISION CLEANING', description: 'Right after harvest, the prawns go through a careful cleaning process.' },
                    { img: img3, title: 'FRESHSEAL PACKING', description: 'To lock in freshness, the prawns are immediately packed using hygienic packaging.' },
                    { img: img4, title: 'SWIFTDOOR DELIVERY', description: 'From the farm straight to your doorstep, our delivery system ensures speed.' }
                ].map((item, idx) => (
                    <ParallaxImageBlock key={idx} id={`prawn-image-${idx}`} imageSrc={item.img} title={item.title} description={item.description} />
                ))}
            </section>

            <FAQSection openFaqIndex={openFaqIndex} setOpenFaqIndex={setOpenFaqIndex} />
        </div>
    );
};

export default memo(HomeScreen);
