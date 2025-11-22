import { useEffect, useState } from 'react';
import AgentDashboard from './AgentDashboard';
import AgentDashboardMobile from './AgentDashboardMobile';

export default function AgentDashboardResponsive() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <AgentDashboardMobile /> : <AgentDashboard />;
}
