import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          <li>
            <a href="#" className="block px-4 py-2 text-gray-700 bg-gray-200 rounded">
              Products
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;