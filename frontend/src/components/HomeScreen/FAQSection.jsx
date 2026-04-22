import { motion, AnimatePresence } from 'framer-motion';

const FAQSection = ({ openFaqIndex, setOpenFaqIndex }) => {
    const faqs = [
        { q: "ARE THE PRAWNS FRESH OR FROZEN?", a: "We only deliver fresh prawns harvested from freshwater ponds on the same day. We do not sell frozen or chemically preserved seafood." },
        { q: "HOW ARE THE PRAWNS CLEANED?", a: "All prawns are cleaned using precision techniques and washed thoroughly under hygienic conditions to ensure they are ready for cooking directly from the pack." },
        { q: "WHERE DO YOU DELIVER?", a: "Currently, we serve specific communities in LB Nagar, Hyderabad for daily orders. Bulk orders can be delivered across Hyderabad with prior notice." },
        { q: "DO YOU OFFER BULK PRICING?", a: "Yes, for events, restaurants, or large family gatherings, we offer special bulk pricing. Contact us at +91 8884143699 for details." }
    ];

    return (
        <section className="bg-black text-[#ededed] pt-24 pb-24 md:pt-32 md:pb-32 px-6 md:px-16 w-full relative z-10">
            <div className="w-full max-w-7xl mx-auto flex flex-col">
                <div className="w-full flex pb-8 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-white/50 block mt-4 uppercase font-mono">(FAQ)</span>
                    </div>
                    <div className="w-full md:w-3/4 text-left overflow-hidden pt-4 -mt-4">
                        <motion.h2 
                            initial="hidden" 
                            whileInView="visible" 
                            viewport={{ once: true, margin: "-50px" }}
                            className="text-[50px] md:text-[80px] lg:text-[110px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase flex flex-col" style={{ fontFamily: 'Froople, sans-serif', fontWeight: 900 }}>
                            <div className="overflow-hidden pb-4 -mb-4"><motion.span variants={{ hidden: { y: "110%", opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">NEED</motion.span></div>
                            <div className="overflow-hidden pb-4 -mb-4"><motion.span variants={{ hidden: { y: "110%", opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">ANSWER</motion.span></div>
                        </motion.h2>
                    </div>
                </div>

                <div className="w-full relative border-t border-white/20 mb-12"></div>

                <div className="flex flex-col md:flex-row w-full">
                    <div className="hidden md:block md:w-1/4"></div>
                    <div className="w-full md:w-3/4 flex flex-col gap-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-white/10 pb-6">
                                <button 
                                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                    className="w-full flex justify-between items-center text-left"
                                >
                                    <span className="text-lg md:text-xl font-bold tracking-tight uppercase hover:text-white/70 transition-colors">{faq.q}</span>
                                    <span className={`text-2xl transition-transform duration-300 ${openFaqIndex === index ? 'rotate-45' : ''}`}>+</span>
                                </button>
                                <AnimatePresence>
                                    {openFaqIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pt-4 text-[#aaa] font-medium leading-relaxed max-w-2xl">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
