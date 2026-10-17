export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">SkillConnect</span>
          <span className="footer-tagline">
            Empowering talent. Connecting opportunities.
          </span>
        </div>

        <div className="footer-meta">
          <span className="system-status">
            <span className="status-dot" aria-hidden="true"></span>
            System Operational
          </span>
          <p className="copyright">
            © {currentYear} Skill Connect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
