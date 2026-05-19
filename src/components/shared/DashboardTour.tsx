"use client";

import Cookies from "js-cookie";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getRolesFromUser, isTenantAdmin } from "@/utils/permissions";
import { markDashboardTourComplete, isDashboardTourComplete } from "@/lib/dashboard-tour-storage";

type TourStep = {
  id: string;
  title: string;
  body: string;
  /** null = centered intro / outro without a spotlight target */
  targetSelector: string | null;
  /** Run before measuring the target (e.g. open mobile drawer) */
  prepare?: (ctx: { isLg: boolean; openMobileMenu: () => void }) => void | Promise<void>;
};

function parseUserFromCookie(): unknown {
  const raw = Cookies.get("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function buildSteps(isAdmin: boolean, isLg: boolean): TourStep[] {
  const steps: TourStep[] = [
    {
      id: "welcome",
      title: "Welcome to LociCare",
      body: "This short guide highlights the main areas of your dashboard. You can skip anytime — we will not show it again once you finish or dismiss.",
      targetSelector: null,
    },
  ];

  if (!isLg) {
    steps.push({
      id: "mobile-menu",
      title: "Mobile navigation",
      body: "On smaller screens the sidebar is hidden. Use this menu button to open and close navigation at any time.",
      targetSelector: '[data-dashboard-tour="mobile-menu"]',
    });
  }

  steps.push({
    id: "sidebar",
    title: "Sidebar navigation",
    body: isLg
      ? "Jump between Dashboard, Departments, Patients, Appointments, Schedules, Reports, Notifications, and Settings. Items you see depend on your role."
      : "All main sections live here. Tap a link to move around the app; tap outside or the close control to hide this menu.",
    targetSelector: isLg
      ? '[data-dashboard-tour="sidebar-desktop"]'
      : '[data-dashboard-tour="sidebar-mobile-drawer"]',
    prepare: ({ isLg: large, openMobileMenu }) => {
      if (!large) openMobileMenu();
    },
  });

  steps.push({
    id: "search",
    title: "Global search",
    body: "Search across departments, patients, schedules, and appointments (and employees for admins) from anywhere in the dashboard.",
    targetSelector: '[data-dashboard-tour="global-search"]',
  });

  if (isAdmin) {
    steps.push({
      id: "notifications",
      title: "Notifications",
      body: "Admins can open recent alerts here or go to the full notifications area to read and manage everything.",
      targetSelector: '[data-dashboard-tour="notifications"]',
    });
  }

  steps.push(
    {
      id: "settings",
      title: "Settings",
      body: "Open workspace settings — preferences, organization options, and other configuration live here.",
      targetSelector: '[data-dashboard-tour="header-settings"]',
    },
    {
      id: "profile",
      title: "Your profile",
      body: "Open your account menu for profile (admins), settings shortcuts, and logout.",
      targetSelector: '[data-dashboard-tour="user-profile"]',
    },
    {
      id: "main",
      title: "Main workspace",
      body: "Each page loads here — lists, forms, charts, and actions for the area you selected in the sidebar.",
      targetSelector: '[data-dashboard-tour="main-content"]',
    },
    {
      id: "done",
      title: "You are all set",
      body: "Explore the sidebar to dive into each area. You can always contact your administrator if you need access to more features.",
      targetSelector: null,
    }
  );

  return steps;
}

type DashboardTourProps = {
  openMobileMenu: () => void;
};

export default function DashboardTour({ openMobileMenu }: DashboardTourProps) {
  const [mounted, setMounted] = useState(false);
  const [isLg, setIsLg] = useState<boolean | null>(null);
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [holeRect, setHoleRect] = useState<DOMRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number; maxWidth: number } | null>(null);

  const isAdmin = useMemo(() => {
    const user = parseUserFromCookie() as { roles?: string[]; role?: string } | null;
    return isTenantAdmin(getRolesFromUser(user));
  }, [mounted]);

  const steps = useMemo(() => {
    if (isLg === null) return [];
    return buildSteps(isAdmin, isLg);
  }, [isAdmin, isLg]);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsLg(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!mounted || isLg === null) return;
    if (isDashboardTourComplete()) return;
    const t = window.setTimeout(() => setRunTour(true), 400);
    return () => window.clearTimeout(t);
  }, [mounted, isLg]);

  useEffect(() => {
    if (steps.length === 0) return;
    setStepIndex((i) => Math.min(i, steps.length - 1));
  }, [steps.length]);

  const finishTour = useCallback(() => {
    markDashboardTourComplete();
    setRunTour(false);
  }, []);

  const measureStep = useCallback(async () => {
    const step = steps[stepIndex];
    if (!step || isLg === null) return;
    const layoutIsLg = isLg;

    if (step.prepare) {
      await step.prepare({ isLg: layoutIsLg, openMobileMenu });
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => setTimeout(r, layoutIsLg ? 0 : 320));
    }

    if (!step.targetSelector) {
      setHoleRect(null);
      setCardPos({
        top: Math.max(24, window.innerHeight / 2 - 120),
        left: Math.max(16, window.innerWidth / 2 - 180),
        maxWidth: Math.min(360, window.innerWidth - 32),
      });
      return;
    }

    const el = document.querySelector(step.targetSelector) as HTMLElement | null;
    if (!el) {
      setHoleRect(null);
      setCardPos({
        top: Math.max(24, window.innerHeight / 2 - 100),
        left: Math.max(16, window.innerWidth / 2 - 180),
        maxWidth: Math.min(360, window.innerWidth - 32),
      });
      return;
    }

    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const rect = el.getBoundingClientRect();
    const pad = 10;
    setHoleRect(
      new DOMRect(rect.left - pad, rect.top - pad, rect.width + pad * 2, rect.height + pad * 2)
    );

    const cardW = Math.min(340, window.innerWidth - 32);
    let left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - cardW - 16));

    const below = rect.bottom + 16 + 200;
    let top: number;
    if (below < window.innerHeight) {
      top = rect.bottom + 16;
    } else {
      top = Math.max(16, rect.top - 16 - 200);
    }
    setCardPos({ top, left, maxWidth: cardW });
  }, [stepIndex, steps, isLg, openMobileMenu]);

  useEffect(() => {
    if (!runTour) return;
    let cancelled = false;
    (async () => {
      await measureStep();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [runTour, measureStep]);

  useEffect(() => {
    if (!runTour) return;
    const onResize = () => {
      measureStep();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [runTour, measureStep]);

  useEffect(() => {
    if (!runTour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runTour, finishTour]);

  if (!mounted || !runTour) return null;

  const step = steps[stepIndex];
  if (!step) return null;

  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= steps.length - 1;
  const goPrevious = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () => {
    if (isLast) {
      finishTour();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  return (
    <div className="fixed inset-0 z-[300] pointer-events-auto" role="dialog" aria-modal="true" aria-labelledby="dashboard-tour-title">
      {/* Dim overlay — spotlight uses box-shadow on the hole frame */}
      {holeRect ? (
        <div
          className="absolute rounded-xl transition-all duration-300 ease-out pointer-events-none ring-2 ring-white/90 shadow-[0_0_0_9999px_rgba(0,20,40,0.72)]"
          style={{
            top: holeRect.top,
            left: holeRect.left,
            width: holeRect.width,
            height: holeRect.height,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(0,20,40,0.72)]" />
      )}

      {/* Tooltip card */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl border border-[#E4E8F2] p-5 text-[#003465] pointer-events-auto"
        style={
          cardPos
            ? {
                top: cardPos.top,
                left: cardPos.left,
                maxWidth: cardPos.maxWidth,
                width: cardPos.maxWidth,
              }
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)", maxWidth: 360, width: "min(360px, calc(100vw - 32px))" }
        }
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#737373] mb-1">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h2 id="dashboard-tour-title" className="text-lg font-bold text-[#003465] mb-2">
          {step.title}
        </h2>
        <p className="text-sm text-[#595959] leading-relaxed mb-5">{step.body}</p>
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <button
            type="button"
            disabled={isFirst}
            className="px-4 py-2 text-sm font-medium text-[#003465] hover:bg-[#003465]/10 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-transparent"
            onClick={goPrevious}
          >
            Previous
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-[#595959] hover:bg-gray-100 rounded-lg transition-colors"
              onClick={finishTour}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#003465] hover:bg-[#003465]/90 rounded-lg transition-colors"
              onClick={goNext}
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
