import Image from 'next/image';

export default function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-orange-400 via-red-400 to-slate-400 overflow-hidden">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-black/5"></div>

      {/* Full Screen Smoke Effect - Behind Content */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {/* Full Screen Smoke Video Container */}
        <div className="absolute inset-0 overflow-hidden">

          {/* Smoke Video Effect - Full Screen */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
            style={{ 
              filter: 'contrast(1.2) brightness(1.1)',
              transform: 'scale(1.1)', // Slight scale to ensure no gaps
              opacity: 0.5,
              animation: 'smokeFade 10s ease-in-out infinite',
              maskImage: `
                linear-gradient(to right, transparent 0px, black 20vw),
                linear-gradient(to left, transparent 0px, black 20vw),
                linear-gradient(to bottom, transparent 0px, black 15vh),
                linear-gradient(to top, transparent 0px, black 15vh),
                radial-gradient(circle at top left, transparent 0%, black 70%),
                radial-gradient(circle at top right, transparent 0%, black 70%),
                radial-gradient(circle at bottom left, transparent 0%, black 70%),
                radial-gradient(circle at bottom right, transparent 0%, black 70%)
              `,
              maskComposite: 'intersect',
              WebkitMaskImage: `
                linear-gradient(to right, transparent 0px, black 20vw),
                linear-gradient(to left, transparent 0px, black 20vw),
                linear-gradient(to bottom, transparent 0px, black 15vh),
                linear-gradient(to top, transparent 0px, black 15vh),
                radial-gradient(circle at top left, transparent 0%, black 70%),
                radial-gradient(circle at top right, transparent 0%, black 70%),
                radial-gradient(circle at bottom left, transparent 0%, black 70%),
                radial-gradient(circle at bottom right, transparent 0%, black 70%)
              `,
              WebkitMaskComposite: 'intersect'
            }}
          >
            <source src="/effects/dissipating-smoke.mp4" type="video/mp4" />
          </video>

          {/* Add CSS keyframes for smoke fade animation */}
          <style jsx>{`
            @keyframes smokeFade {
              0% { opacity: 0; }
              15% { opacity: 0.5; }
              85% { opacity: 0.5; }
              100% { opacity: 0; }
            }
          `}</style>          {/* Floating Particles for Enhanced Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Animated floating particles */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/2 left-1/2 w-3 h-3 bg-white/15 rounded-full animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/25 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>
            <div className="absolute top-2/3 left-3/4 w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-1/3 right-2/3 w-2 h-2 bg-white/15 rounded-full animate-ping" style={{ animationDuration: '3.8s', animationDelay: '0.8s' }}></div>
          </div>
        </div>
      </div>

      {/* Main Hero Content - Above Smoke */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 h-full items-center">

          {/* Left Side - Text Content with Opaque Background */}
          <div className="text-left space-y-8 py-16 lg:py-0 relative z-20">
            <div className="space-y-6">
              {/* Brutalist Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-none tracking-tight text-slate-900 relative z-20">
                <span className="block">SHOP</span>
                <span className="block">SMART.</span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">SHOP INVISIBLE.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-800 font-medium max-w-lg leading-relaxed relative z-20">
                The best products aren&apos;t seen. They&apos;re <span className="font-bold text-slate-900">felt</span>.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-20">
              <button
                onClick={scrollToProducts}
                className="group relative px-8 py-4 bg-transparent border-3 border-slate-900 rounded-2xl font-bold text-lg text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-none"
              >
                <span className="relative z-10">EXPLORE PRODUCTS</span>
                <div className="absolute inset-0 bg-slate-900 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>

              <button className="group relative px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl font-semibold text-lg text-slate-900 hover:bg-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105">
                <span className="relative z-10">LEARN MORE</span>
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="flex flex-wrap gap-6 pt-8 relative z-20">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                <span className="text-slate-800 font-semibold">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                <span className="text-slate-800 font-semibold">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                <span className="text-slate-800 font-semibold">24/7 Support</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToProducts}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:animate-none transition-all duration-300 hover:scale-110 cursor-pointer group"
      >
        <div className="w-6 h-10 border-2 border-slate-800 group-hover:border-brand-orange rounded-full flex justify-center transition-colors duration-300">
          <div className="w-1 h-3 bg-slate-800 group-hover:bg-brand-orange rounded-full mt-2 animate-pulse transition-colors duration-300"></div>
        </div>
      </button>
    </div>
  );
}
