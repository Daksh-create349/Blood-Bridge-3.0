import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse, Activity, Share2, ShieldCheck, Zap, Globe, ChevronRight, Users, Radio } from 'lucide-react';
import { Button } from '../components/ui/UIComponents';

// Helper for Scroll Reveal Animation
const Reveal = ({ children, className = "", delay = 0 }: { children?: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
        observer.disconnect(); // Trigger once
      }
    }, { threshold: 0.15 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
    >
      {children}
    </div>
  );
};

interface FeatureSectionProps {
  title: string;
  description: string;
  img: string;
  icon: React.ElementType;
  reverse?: boolean;
  bullets?: string[];
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ title, description, img, icon: Icon, reverse = false, bullets = [] }) => {
  // Improved video detection
  const isVideo = img.toLowerCase().includes('.mp4');

  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 py-16 lg:py-24`}>
      <div className="flex-1 w-full">
         <Reveal>
           <div className="relative group w-full">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] border border-slate-800 bg-slate-900">
                 {isVideo ? (
                   <video 
                      src={img} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-105"
                   />
                 ) : (
                   <img src={img} alt={title} className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-105" />
                 )}
                 {/* Subtle inner border/shadow */}
                 <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
              </div>
           </div>
         </Reveal>
      </div>
      <div className="flex-1 space-y-8 w-full">
        <Reveal delay={200}>
          <div className="inline-flex items-center justify-center h-14 w-14 bg-slate-800 rounded-2xl text-red-500 mb-4 shadow-lg border border-slate-700">
            <Icon className="h-7 w-7" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">{title}</h2>
          <p className="text-lg text-slate-400 leading-relaxed">{description}</p>
          
          {bullets.length > 0 && (
            <ul className="space-y-4 pt-4">
              {bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1 h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                    <ShieldCheck className="h-3 w-3" />
                  </div>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </div>
  );
};

const Mission: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-red-500 selection:text-white overflow-x-hidden font-sans">
       
       {/* Navigation Overlay */}
       <nav className="fixed top-0 left-0 right-0 z-50 p-6 transition-all duration-300">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-6 py-3 shadow-xl">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tighter cursor-pointer group" onClick={() => navigate('/')}>
              <div className="h-9 w-9 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="group-hover:text-red-400 transition-colors text-white">Blood Bridge</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-300 hover:bg-slate-800 hover:text-white rounded-full px-4 h-9 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home 
            </Button>
          </div>
       </nav>

       {/* Hero Section */}
       <header className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-900/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto text-center relative">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-red-400 text-sm font-medium mb-8 shadow-sm">
                <Activity className="h-4 w-4 animate-pulse" /> Our Mission Statement
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white">
                Saving Lives at the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Speed of Data.</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                We are building the digital infrastructure for emergency blood logistics. 
                By connecting needs with verified donors instantly, we ensure no life is lost due to a lack of supply.
              </p>
            </Reveal>
          </div>
       </header>

       {/* Features Loop */}
       <div className="relative max-w-7xl mx-auto px-6 pb-32 space-y-12">
          
          <FeatureSection 
            title="Instant Response Network"
            description="When a critical request is broadcast, time is the enemy. Our platform geolocates the nearest compatible donors and notifies them via SMS and App alerts within seconds."
            img="https://cdn.pixabay.com/video/2022/06/10/119843-719443761_large.mp4"
            icon={Radio}
            bullets={[
              "Real-time geolocation based broadcasting",
              "Multi-channel alerts (SMS, Push, Email)",
              "Instant acceptance and navigation for donors"
            ]}
          />

          <FeatureSection 
            reverse
            title="AI-Powered Supply Intelligence"
            description="Blood Bridge doesn't just react—it predicts. Using Google's Gemini AI, we analyze consumption patterns to forecast shortages before they become emergencies."
            img="https://media.istockphoto.com/id/1491463133/video/illustrative-3d-animation-of-neural-network-concept-chatbot-artificial-intelligence-deep.mp4?s=mp4-640x640-is&k=20&c=GfH4iLh-gzyr0Ii2-LNoGFbzOdRspiD3pqzI9_oRgqg="
            icon={Zap}
            bullets={[
              "Predictive inventory analytics",
              "Automated restocking suggestions",
              "Smart distribution between hospital networks"
            ]}
          />

          <FeatureSection 
            title="Digital Donation Camps"
            description="We empower communities to organize transparent and efficient blood drives. From digital registration to generating participation certificates, we handle the logistics."
            img="https://cdn.pixabay.com/video/2020/09/13/49815-458438877_large.mp4"
            icon={Users}
            bullets={[
              "QR Code based check-ins",
              "Digital ID verification integration",
              "Instant digital certificates for volunteers"
            ]}
          />

          <FeatureSection 
            reverse
            title="A Verified Trust Protocol"
            description="Safety is paramount. We implement a rigorous vetting process for hospitals and a secure health screening protocol for donors to maintain the integrity of the blood supply chain."
            img="https://media.istockphoto.com/id/1010351356/video/policy-check-icon-animation.mp4?s=mp4-640x640-is&k=20&c=Alf2ot6UYNSq2BY2qDtiG7bdE_Czm5TWfqecWcOq-sY="
            icon={ShieldCheck}
            bullets={[
              "Hospital accreditation verification",
              "Secure donor health history storage",
              "Privacy-first data handling"
            ]}
          />

       </div>

       {/* Call to Action */}
       <section className="relative py-24 px-6 bg-slate-900 border-y border-slate-800">
          <div className="max-w-4xl mx-auto text-center">
             <Reveal>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to make a difference?</h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                  Whether you are a donor, a hospital administrator, or a volunteer, your contribution saves lives. Join the network today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="text-lg px-10 py-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/40 hover:scale-105 transition-transform" onClick={() => navigate('/dashboard')}>
                    Launch Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
             </Reveal>
          </div>
       </section>

       {/* Footer */}
       <footer className="bg-slate-950 py-12 px-6 border-t border-slate-900">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-slate-50">
              <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-white">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span>Blood Bridge</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 Blood Bridge Initiative. All rights reserved.</p>
            <div className="flex gap-6 text-slate-500">
              <Globe className="h-5 w-5 cursor-pointer hover:text-white transition-colors" />
              <Share2 className="h-5 w-5 cursor-pointer hover:text-white transition-colors" />
            </div>
         </div>
       </footer>

    </div>
  );
};

export default Mission;