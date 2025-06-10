import React from 'react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <header>Global Header Placeholder</header>
      <nav>Sidebar Placeholder</nav>
      <main>{children}</main>
      <footer>Global Footer Placeholder</footer>
    </div>
  );
};

export default MainLayout;
