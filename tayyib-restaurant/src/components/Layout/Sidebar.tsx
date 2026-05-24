import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const links = [
    { to: '/', label: 'Dashboard', roles: ['MD', 'Manager', 'NMD'] },
    { to: '/transactions', label: 'Transactions', roles: ['MD', 'Manager', 'NMD'] },
    { to: '/transactions/new', label: 'New Transaction', roles: ['MD', 'Manager'] },
    { to: '/users', label: 'User Management', roles: ['MD'] },
  ].filter(l => l.roles.includes(user?.role ?? ''));

  return (
    <>
      {open && <div className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" onClick={onClose} />}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-primary">Tayyib</h2>
        </div>
        <nav className="p-2 space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
