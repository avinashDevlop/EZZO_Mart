import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  IndianRupee, 
  Headphones,
  BarChart3,
  Eye,
  Plus,
  FolderOpen,
  Shield,
  UserCheck,
  UserX,
  Database,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSideNav = ({ isOpen }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const navStructure = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      subItems: [
        { label: 'Analytics', path: '/admin/dashboard/analytics', icon: BarChart3 },
        { label: 'Overview', path: '/admin/dashboard/overview', icon: Eye }
      ]
    },
    {
      key: 'users',
      label: 'Users',
      icon: Users,
      subItems: [
        { label: 'Add User', path: '/admin/users/add', icon: Plus },
        { label: 'View Users', path: '/admin/users/view', icon: Eye },
        { label: 'User Roles', path: '/admin/users/roles', icon: UserCheck },
        { label: 'Blocked Users', path: '/admin/users/blocked', icon: UserX }
      ]
    },
    {
      key: 'system',
      label: 'System',
      icon: Settings,
      subItems: [
        { label: 'Configuration', path: '/admin/system/config', icon: Settings },
        { label: 'Database', path: '/admin/system/database', icon: Database },
        { label: 'Security', path: '/admin/system/security', icon: Shield }
      ]
    },
    {
      key: 'finance',
      label: 'Finance',
      icon: IndianRupee,
      subItems: [
        { label: 'Revenue Reports', path: '/admin/finance/revenue', icon: BarChart3 },
        { label: 'Payouts', path: '/admin/finance/payouts', icon: IndianRupee }
      ]
    },
    {
      key: 'support',
      label: 'Support',
      icon: Headphones,
      subItems: [
        { label: 'View Tickets', path: '/admin/support/tickets', icon: Eye },
        { label: 'FAQ Management', path: '/admin/support/faq', icon: Headphones }
      ]
    }
  ];

  const renderNavItem = (item) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedSections[item.key];

    if (!hasSubItems && item.path) {
      return (
        <li key={item.key}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-blue-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-50 transition-all duration-200 rounded-r-lg mx-1 ${
                isActive ? 'bg-gradient-to-r from-blue-200 to-indigo-100 font-medium border-l-3 border-blue-500 shadow-sm' : ''
              }`
            }
            aria-label={item.label}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
          </NavLink>
        </li>
      );
    }

    return (
      <li key={item.key}>
        <div
          className={`flex items-center px-4 py-3 text-blue-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-50 transition-all duration-200 cursor-pointer rounded-r-lg mx-1 ${
            isExpanded ? 'bg-gradient-to-r from-blue-150 to-indigo-75' : ''
          }`}
          onClick={() => isOpen && toggleSection(item.key)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              isOpen && toggleSection(item.key);
            }
          }}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {isOpen && (
            <>
              <span className="ml-3 text-sm font-medium flex-1 truncate">{item.label}</span>
              {hasSubItems && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </>
          )}
        </div>

        <AnimatePresence>
          {isOpen && isExpanded && hasSubItems && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden ml-1"
            >
              {item.subItems.map((subItem, subIndex) => (
                <li key={subIndex}>
                  <NavLink
                    to={subItem.path}
                    className={({ isActive }) =>
                      `flex items-center pl-8 pr-3 py-2 text-blue-700 text-sm hover:bg-gradient-to-r hover:from-white hover:to-blue-50 transition-all duration-200 rounded-r-lg ${
                        isActive ? 'bg-gradient-to-r from-white to-blue-100 font-medium border-l-2 border-blue-400 text-blue-900' : ''
                      }`
                    }
                    aria-label={subItem.label}
                  >
                    <subItem.icon className="w-4 h-4 flex-shrink-0 mr-2" />
                    <span className="truncate">{subItem.label}</span>
                  </NavLink>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <motion.nav
      initial={{ width: isOpen ? 220 : 50 }}
      animate={{ width: isOpen ? 220 : 50 }}
      transition={{ type: 'spring', stiffness: 120, damping: 25 }}
      className={`bg-gradient-to-b from-blue-50 via-indigo-50 to-blue-100 h-full shadow-lg flex flex-col border-r border-blue-200 ${
        isOpen ? 'w-[220px] sm:w-[240px] md:w-[270px]' : 'w-[50px] sm:w-[55px]'
      }`}
      role="navigation"
      aria-label="Admin Sidebar Navigation"
    >
      {/* Navigation Links */}
      <ul className="flex-1 py-3 space-y-1">
        {navStructure.map(renderNavItem)}
      </ul>

      {/* Compact Footer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-3 text-center border-t border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <p className="font-medium text-blue-800 text-sm">Admin Panel</p>
          <p className="text-blue-500 text-sm">v1.0</p>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default AdminSideNav;