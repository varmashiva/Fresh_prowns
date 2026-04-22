import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const ParallaxImageBlock = ({ imageSrc, id, title, description }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const imageParallaxY = useTransform(scrollYProgress, [0, 1], ['-25%', '25%']);

    return (
        <div ref={ref} id={id} className="mx-auto w-[95%] md:w-full max-w-[1400px] relative aspect-[19/23] md:aspect-[21/10] overflow-hidden rounded-md mb-8 md:mb-16 last:mb-0">
            <motion.img
                src={imageSrc}
                alt="Cinematic Prawns"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center scale-[1.5] origin-center pointer-events-none"
                style={{ y: imageParallaxY }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 mix-blend-multiply pointer-events-none"></div>

            <div className="absolute inset-x-6 inset-y-6 md:inset-x-12 md:inset-y-12 z-10 flex flex-col pointer-events-none">
                <div className="flex justify-between items-start w-full">
                    <div className="flex flex-col items-start text-left md:hidden max-w-[90%] pointer-events-auto">
                        <h2 className="text-4xl font-bold tracking-tighter text-white mb-2 drop-shadow-xl">{title || 'SIGNATURE'}</h2>
                        <p className="text-white/80 text-xs font-medium tracking-wide">Wild Caught / Jumbo Grade / Ethical / Fresh</p>
                    </div>

                    <div className="hidden md:block w-full max-w-[340px] ml-auto text-left pointer-events-auto">
                        <p className="text-white/90 text-base lg:text-lg font-medium leading-relaxed drop-shadow-md">
                            {description || 'Cinematic Prawns Sourced from pristine deep waters.'}
                        </p>
                    </div>
                </div>

                <div className="md:hidden w-full max-w-[90%] my-auto pointer-events-auto pt-6 pb-6">
                    <p className="text-white/90 text-sm font-medium leading-relaxed drop-shadow-md">
                        {description || 'Cinematic Prawns Sourced from pristine deep waters.'}
                    </p>
                </div>

                <div className="flex justify-start md:justify-between items-end w-full mt-auto md:mt-auto pointer-events-none">
                    <div className="hidden md:flex flex-col items-start text-left pointer-events-auto">
                        <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-3 drop-shadow-xl">{title || 'SIGNATURE'}</h2>
                        <p className="text-white/80 text-sm lg:text-[15px] font-medium tracking-wide">Wild Caught / Jumbo Grade / Ethical / Fresh</p>
                    </div>

                    <div className="w-fit md:w-full md:max-w-[200px] flex justify-start md:justify-start pointer-events-auto">
                        <Link to="/product/69a6619514974541e40c97ae" className="bg-white text-black text-[12px] md:text-sm font-bold py-3 md:py-3 px-6 md:px-6 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-xl tracking-wider">
                            Catch Some Prawns
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParallaxImageBlock;
