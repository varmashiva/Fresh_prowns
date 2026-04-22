import { motion, useTransform } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = ({ isVideoLoaded, bgVideo, videoY, videoOpacity, setIsVideoLoaded, containerVariants, titleText, letterVariants, fadeUpVariants }) => {
    return (
        <div className="relative h-screen min-h-screen w-full flex flex-col items-center justify-center overflow-hidden z-0 bg-black">
            <AnimatePresence>
                {!isVideoLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505]"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-white/10 border-t-white/80 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 m-auto w-6 h-6 bg-white/20 rounded-full animate-pulse blur-[2px]"></div>
                        </div>
                        <span className="mt-6 text-white/50 tracking-[0.3em] text-[10px] uppercase font-semibold animate-pulse">Loading Experience</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.video
                autoPlay
                loop
                muted
                playsInline
                onCanPlayThrough={() => setIsVideoLoaded(true)}
                style={{ y: videoY, opacity: videoOpacity }}
                className="absolute inset-0 w-full h-full object-cover z-0 origin-center"
            >
                <source src={bgVideo} type="video/mp4" />
            </motion.video>
            <div className="absolute inset-0 bg-black/30 z-10 transition-opacity"></div>

            <div className="relative z-20 w-full h-full flex flex-col justify-center px-6 md:px-16 container mx-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUpVariants}
                    className="absolute top-1/2 left-6 md:left-16 -translate-y-1/2 hidden lg:flex flex-col gap-3 text-sm font-extrabold tracking-[0.2em] text-white/90 drop-shadow-md"
                >
                    <a href="#products" className="hover:text-white transition-colors">FRESH FROM POND (CHERUVULU)</a>
                    <a href="#products" className="hover:text-white transition-colors">NO PRESERVATIVES</a>
                    <a href="#products" className="hover:text-white transition-colors">NO CHEMICALS</a>
                    <a href="#products" className="hover:text-white transition-colors">ONLY FRESH SEAFOOD</a>
                </motion.div>

                <div className="flex-grow flex flex-col justify-center items-start md:items-end max-w-5xl md:ml-auto w-full text-left md:text-right mt-16 md:mt-24 overflow-hidden pt-10">
                    <motion.h1
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-[15vw] md:text-[10vw] font-bold text-white leading-[0.85] tracking-tighter drop-shadow-2xl uppercase flex flex-col items-start md:items-end"
                    >
                        {titleText.split('\n').map((line, lineIndex) => (
                            <div key={lineIndex} className="flex overflow-hidden pb-2 -mb-2">
                                {line.split('').map((char, charIndex) => (
                                    <motion.span key={`${lineIndex}-${charIndex}`} variants={letterVariants}>
                                        {char === ' ' ? '\u00A0' : char}
                                    </motion.span>
                                ))}
                            </div>
                        ))}
                    </motion.h1>

                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                        className="text-lg md:text-2xl text-white/90 font-medium mt-8 max-w-3xl drop-shadow-lg leading-relaxed"
                    >
                        Farmed in freshwater ponds by local aqua farmers and packed fresh to deliver clean, high-quality prawns straight to your kitchen.
                    </motion.p>
                </div>

                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-16 right-6 md:right-16 flex justify-between items-center w-[calc(100%-48px)] md:w-[calc(100%-128px)] z-20 pointer-events-none">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                        className="flex flex-col gap-1 text-[10px] md:text-sm font-semibold tracking-wider text-white pointer-events-auto"
                    >
                        <p className="opacity-70">CONTACT US - +91 8884143699</p>
                        <p className="opacity-70">FSSAI REG NO: 23626028001682</p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                        className="pointer-events-auto"
                    >
                        <Link to="/product/69a6619514974541e40c97ae" className="bg-white text-black text-[11px] md:text-sm font-bold py-2 md:py-3 px-4 md:px-6 rounded flex items-center gap-2 hover:bg-gray-200 transition-all shadow-xl tracking-wider">
                            Catch Some Prawns
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
