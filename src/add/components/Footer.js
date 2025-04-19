import React from "react";
import "../css/footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <p>
        © 2019-{currentYear} Designed by{" "}
        <a href="https://jasurlive.uz">jasurlive.uz</a>
      </p>
    </footer>
  );
};

export default Footer;
