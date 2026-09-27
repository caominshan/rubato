export function EditorialHeader({ active = "agent" }: { active?: "agent" | "insights" }) {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Hey Tablo 首页">Hey Tablo</a>
      <span className="brand-mode">AGENT</span>
      <nav className="topnav" aria-label="主导航">
        <a className={active === "agent" ? "is-active" : ""} href="/#agent">AGENT</a>
        <a className={active === "insights" ? "is-active" : ""} href="/insights">INSIGHTS</a>
        <a href="#saved">SAVE</a>
      </nav>
    </header>
  );
}
