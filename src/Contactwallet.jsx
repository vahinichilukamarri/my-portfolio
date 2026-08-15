import "./ContactWallet.css";

const CARDS = [
  {
    cls: "cw-email",
    label: "Email",
    sub: "Reach me at",
    handle: "vahinivenkatac@gmail.com",
    href: "mailto:vahinivenkatac@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
    ),
  },
  {
    cls: "cw-github",
    label: "GitHub",
    sub: "Find me on",
    handle: "@vahinichilukamarri",
    href: "https://github.com/vahinichilukamarri",
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.42.36.79 1.08.79 2.18v3.23c0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"/></svg>
    ),
  },
  {
    cls: "cw-linkedin",
    label: "LinkedIn",
    sub: "Connect on",
    handle: "in/venkata-vahini-chilukamarri",
    href: "https://www.linkedin.com/in/venkata-vahini-chilukamarri-2b5064314/",
    icon: (
      <svg viewBox="0 0 24 24"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
    ),
  },
  {
    cls: "cw-phone",
    label: "Phone",
    sub: "Call or text",
    handle: "+91 8790261823",
    href: "tel:+918790261823",
    icon: (
      <svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg>
    ),
  },
];

export default function ContactWallet() {
  return (
    <div className="cw-wallet">
      <div className="cw-wallet-back" />
      {CARDS.map(c => (
        <a
          key={c.cls}
          href={c.href}
          target={c.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className={`cw-card ${c.cls}`}
        >
          <div className="cw-card-inner">
            <div className="cw-card-top">
              <span>{c.label}</span>
              <span className="cw-chip">{c.icon}</span>
            </div>
            <div className="cw-card-bottom">
              <div>
                <span className="cw-label">{c.sub}</span>
              </div>
              <div className="cw-handle-wrapper">
                <div className="cw-hidden-stars">••••••••</div>
                <div className="cw-handle">{c.handle}</div>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}