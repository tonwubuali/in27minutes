import React, { useState } from "react";
import { useStore } from "./store.jsx";
import { Logo, Badge, Button, ToastHost } from "./components/ui.jsx";
import Login from "./auth/Login.jsx";
import CustomerApp from "./customer/CustomerApp.jsx";
import AgentApp from "./agent/AgentApp.jsx";
import AdminConsole from "./admin/AdminConsole.jsx";
import RecruitSite from "./recruit/RecruitSite.jsx";
import Onboarding, { needsOnboarding } from "./onboarding/Onboarding.jsx";

const ROLE_LABEL = {
  customer: "Customer",
  agent: "Field Agent",
  admin: "Admin",
};

export default function App() {
  const { user, booting, logout } = useStore();
  // Public recruitment view is reachable without logging in.
  const [showRecruit, setShowRecruit] = useState(false);
  const [onboard, setOnboard] = useState(needsOnboarding());

  if (booting) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="h-4 w-4 animate-ping rounded-full bg-brand-orange" />
          Starting in27minutes…
        </div>
      </div>
    );
  }

  // Not logged in: show login, with an escape hatch to the public recruit site.
  if (!user) {
    if (showRecruit) {
      return (
        <Shell onLogoClick={() => setShowRecruit(false)}>
          <button
            onClick={() => setShowRecruit(false)}
            className="mb-4 text-sm font-semibold text-slate-500 hover:text-brand-ink"
          >
            ← Back to sign in
          </button>
          <RecruitSite />
        </Shell>
      );
    }
    return <Login onBecomeAgent={() => setShowRecruit(true)} />;
  }

  return (
    <>
    {user.role === "customer" && onboard && <Onboarding onDone={() => setOnboard(false)} />}
    <Shell
      right={
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold leading-tight">{user.name}</p>
            <p className="text-xs text-slate-400">{ROLE_LABEL[user.role]}</p>
          </div>
          <Badge tone="green">● Online</Badge>
          <Button variant="outline" className="!px-3 !py-1.5 text-xs" onClick={logout}>
            Sign out
          </Button>
        </div>
      }
    >
      <div key={user.role} className="animate-fade-in">
        {user.role === "customer" && <CustomerApp />}
        {user.role === "agent" && <AgentApp />}
        {user.role === "admin" && <AdminConsole />}
      </div>
    </Shell>
    </>
  );
}

function Shell({ children, right, onLogoClick }) {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b border-brand-line/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <button onClick={onLogoClick} className="cursor-pointer">
            <Logo />
          </button>
          {right}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-slate-400">
        in27minutes · launching at MOUAU, Umudike · AI-native hyperlocal commerce
      </footer>
      <ToastHost />
    </div>
  );
}
