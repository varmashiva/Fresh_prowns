const Footer = () => {
    return (
        <footer className="w-full mt-auto py-6 flex items-center justify-center text-center text-[13px] opacity-80 backdrop-blur-sm bg-black/10 border-t border-white/10">
            <div className="container mx-auto px-4 tracking-wide">
                <p>&copy; {new Date().getFullYear()} Farm to Home</p>
            </div>
        </footer>
    );
};

export default Footer;
