import { useAuth } from '../../context/AuthContext';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
      <button onClick={onMenuClick} className="md:hidden p-1">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg font-semibold text-primary">Tayyib</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.full_name}</span>
        <button onClick={signOut} className="text-gray-500 hover:text-red-500" title="Sign out">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
