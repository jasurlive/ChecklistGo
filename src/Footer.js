import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <p>
        © 2019-{currentYear} Designed by <a href="https://jasurlive.uz" target="_blank" rel="noopener noreferrer">@jasurjacob</a>
      </p>
    </footer>
  );
};

export default Footer;
