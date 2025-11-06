import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import Sidebar from './Sidebar';
import type { ViewType, AgentType, User } from '../types';

interface SidebarWrapperProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onAgentSelect: (agent: AgentType) => void;
  selectedAgent: AgentType | null;
  isAdmin: boolean;
}

export default function SidebarWrapper({ currentView, onViewChange, onAgentSelect, selectedAgent, isAdmin }: SidebarWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const mockUser: User = {
    name: user?.name || 'User',
    email: user?.email || 'user@email.com',
    avatar: 'https://i.pravatar.cc/150?u=' + user?.email,
    role: user?.role as 'admin' | 'user' || 'user',
    online: true
  };

  const [userState, setUserState] = useState<User>(mockUser);

  return (
    <Sidebar
      activeView={currentView}
      setActiveView={onViewChange}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      user={userState}
      setUser={setUserState}
      onLogout={logout}
    />
  );
}
