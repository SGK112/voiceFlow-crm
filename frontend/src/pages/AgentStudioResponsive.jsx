import { useState, useEffect } from 'react';
import VisualAgentBuilder from '../components/VisualAgentBuilder';
import MobileAgentBuilder from '../components/MobileAgentBuilder';

/**
 * Responsive Agent Studio
 * Shows Mobile Builder on mobile (< 768px)
 * Shows Visual Builder on desktop (>= 768px)
 */

export default function AgentStudioResponsive() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show mobile builder on small screens, visual builder on large screens
  return isMobile ? <MobileAgentBuilder /> : <VisualAgentBuilder />;
}
