import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* Fotos optimizadas (WebP) — generadas por `bun run optimize:images` a partir de
   los originales en `src/assets/raw/`. No editar a mano: corre el script. */
import bestiesSm from "~/assets/besties-320.webp";
import bestiesLg from "~/assets/besties-480.webp";
import duoLg from "~/assets/duo-together-1024.webp";
import duoSm from "~/assets/duo-together-700.webp";
import heroLg from "~/assets/hero-reformer-1400.webp";
import heroSm from "~/assets/hero-reformer-800.webp";
/* Marca oficial DUO (generada por scripts/brand-logos.mjs desde el manual). */
import isoCream from "~/assets/isotipo-cream.webp";
import isoDuo from "~/assets/isotipo-duo.webp";
import logoCream from "~/assets/logo-cream.webp";
import logoDuo from "~/assets/logo-duo.webp";

/* ═══════════════════════════════════════════════════════════════════════════
   PLACEHOLDER — número de WhatsApp.
   El owner lo reemplaza aquí (una sola constante): formato internacional,
   sin "+", sin espacios y sin guiones. Ej: 593991234567
   ═══════════════════════════════════════════════════════════════════════════ */
const WHATSAPP_NUMBER = "593993714411";
/** URL pública del sitio. Solo se usa para el og:image absoluto (preview al
 *  compartir por WhatsApp): tiene que ser el dominio real, no una ruta. */
const SITE_URL = "https://a33bc727c580d488a6c5a729cd455f22.ctonew.app";
/** Número tal como se muestra en pantalla (formato internacional legible). */
const WHATSAPP_DISPLAY = "+593 99 371 4411";

const INSTAGRAM_HANDLE = "@duo_pilatesstudio";
const INSTAGRAM_URL = "https://instagram.com/duo_pilatesstudio";
const ADDRESS = "Quito – Monteserrín (Corvo Plaza)";
const MAPS_QUERY = "Corvo Plaza, Monteserrín, Quito";
const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&output=embed`;
const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAPS_QUERY)}`;

const GENERAL_MESSAGE = "Hola Duo! Quiero reservar mi primera clase.";

/** Arma el link de WhatsApp con el mensaje ya urlencoded. */
const waLink = (message: string = GENERAL_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* ────────────────────────────── contenido ────────────────────────────── */

const NAV_LINKS = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#paquetes", label: "Paquetes" },
  { href: "#horarios", label: "Horarios" },
  { href: "#ubicacion", label: "Ubicación" },
];

type Tone = "morning" | "spicy" | "duo" | "warmup";

const PACKAGES: {
  name: string;
  price: string;
  detail: string;
  cadence: string;
  blurb: string;
  blurbExtra?: string;
  tone: Tone;
  rotate: string;
}[] = [
  {
    name: "KEEP IT CASUAL",
    price: "$80",
    detail: "4 clases",
    cadence: "1x semana",
    blurb: "Go at your own pace. Sin culpas, sin presión.",
    blurbExtra: "Ideal para empezar o complementar tu rutina.",
    tone: "morning",
    rotate: "-rotate-[1.6deg]",
  },
  {
    name: "DUO FLOW",
    price: "$140",
    detail: "8 clases",
    cadence: "2x semana",
    blurb: "Encuentra tu ritmo y haz del movimiento parte de tu semana.",
    blurbExtra: "Para crear una rutina que se sienta bien.",
    tone: "spicy",
    rotate: "rotate-[1.4deg]",
  },
  {
    name: "OBSESSED",
    price: "$180",
    detail: "12 clases",
    cadence: "3x semana",
    blurb: "Tres veces por semana. Más fuerza, más control, más tú.",
    blurbExtra: "Para quienes ya encontraron su ritmo.",
    tone: "duo",
    rotate: "-rotate-[1.2deg]",
  },
  {
    name: "BESTIE STATUS",
    price: "$280",
    detail: "20 clases",
    cadence: "5x semana",
    blurb: "La constancia se nota y se siente. Make DUO your thing.",
    blurbExtra: "Para hacer del movimiento parte de tu día a día.",
    tone: "morning",
    rotate: "rotate-[1.6deg]",
  },
  {
    name: "JUST YOU & ME",
    price: "$25",
    detail: "1 clase personalizada",
    cadence: "tu horario, tu ritmo",
    blurb: "All eyes on you.",
    tone: "spicy",
    rotate: "-rotate-[1.4deg]",
  },
];

const SCHEDULES: {
  id: string;
  label: string;
  days: string;
  times: string[];
  badge?: string;
  note?: string;
}[] = [
  {
    id: "am-lmv",
    label: "AM BESTIES",
    days: "Lun · Mié · Vie",
    times: ["7:00 AM", "8:00 AM", "9:00 AM"],
  },
  {
    id: "am-tj",
    label: "AM BESTIES",
    days: "Mar · Jue",
    times: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"],
  },
  {
    id: "pm-semana",
    label: "PM BESTIES",
    days: "Lun · Mié · Vie",
    times: ["4:00 PM", "5:00 PM", "6:00 PM"],
  },
  {
    id: "pm-tj",
    label: "PM BESTIES",
    days: "Mar · Jue",
    times: ["5:00 PM", "6:00 PM", "7:00 PM"],
  },
  {
    id: "weekend",
    label: "WEEKEND DUO",
    days: "Sábados",
    times: ["8:00 AM", "9:00 AM"],
    badge: "Besties Only",
  },
];

/* ────────────────────────────── route ────────────────────────────── */

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Duo Pilates Studio | Pilates Reformer en Quito" },
      {
        name: "description",
        content:
          "Pilates Reformer personalizado en Quito, Monteserrín (Corvo Plaza). Grupos reducidos, atención personalizada y reservas por WhatsApp. We know you. We've got you.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Duo Pilates Studio" },
      { property: "og:locale", content: "es_EC" },
      { property: "og:title", content: "Duo Pilates Studio | Pilates Reformer en Quito" },
      {
        property: "og:description",
        content:
          "Wanna find your Duo? Pilates Reformer personalizado en Quito. Grupos reducidos, besties incluidos y reservas 100% por WhatsApp.",
      },
      /* URL ABSOLUTA a propósito: WhatsApp no resuelve rutas relativas del bundle.
         El archivo vive en `public/og.jpg` (1200x630, recorte del hero). */
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: "Clase de Pilates Reformer en Duo Pilates Studio" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  useScrollReveal();

  return (
    <div className="relative overflow-x-clip bg-morning">
      <div className="grain-overlay" aria-hidden="true" />
      <Navbar />
      <main id="inicio">
        <Hero />
        <ThisIsDuo />
        <Packages />
        <Schedule />
        <Location />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

/* ────────────────────────────── hooks ────────────────────────────── */

function useScrollReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

/* ────────────────────────────── little pieces ────────────────────────────── */

/** Marca DUO. Isotipo para espacios reducidos (header) y marca principal
 *  (logotipo + "PILATES STUDIO") donde hay sitio. Los PNG ya traen el área de
 *  seguridad del manual (el tamaño del punto de la "o"), así que no hace falta
 *  recortarlos: se escala solo por alto y con object-contain (sin deformar). */
function DuoLogo({
  tone = "light",
  className = "h-14 w-auto sm:h-16",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <img
      src={tone === "light" ? logoCream : logoDuo}
      alt="Duo Pilates Studio"
      className={`${className} object-contain`}
      decoding="async"
    />
  );
}

/** Isotipo (marca reducida). */
function DuoIsotipo({
  tone = "light",
  className = "h-9 w-auto",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <img
      src={tone === "light" ? isoCream : isoDuo}
      alt="Duo Pilates Studio"
      className={`${className} object-contain`}
      decoding="async"
    />
  );
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.115-.198.057-.371-.058-.52-.115-.148-.66-1.585-.905-2.16-.239-.573-.48-.497-.66-.505-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.3" cy="6.8" r="1.25" fill="currentColor" />
    </svg>
  );
}

/** Botón principal de WhatsApp. */
function WaButton({
  message,
  children,
  variant = "warmup",
  className = "",
}: {
  message?: string;
  children: ReactNode;
  variant?: "warmup" | "morning" | "outline";
  className?: string;
}) {
  const styles: Record<string, string> = {
    warmup: "bg-duo text-morning hover:bg-duo-deep border-duo",
    morning: "bg-morning text-duo hover:bg-warmup/35 border-morning",
    outline: "bg-transparent text-morning border-morning/60 hover:bg-morning/10",
  };
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`pill-shape inline-flex min-h-[48px] items-center justify-center gap-2.5 border-2 px-6 py-3 font-body text-sm font-semibold tracking-wide shadow-[5px_6px_0_rgba(35,40,26,0.18)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 ${styles[variant]} ${className}`}
    >
      <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
      <span>{children}</span>
    </a>
  );
}

function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block h-[46px] w-full sm:h-[70px] ${flip ? "rotate-180" : ""}`}
    >
      <path
        d="M0,52 C180,96 320,6 520,30 C720,54 840,96 1040,66 C1200,42 1320,16 1440,44 L1440,90 L0,90 Z"
        fill={fill}
      />
    </svg>
  );
}

/* ────────────────────────────── 1. navbar ────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  /* En móvil el menú se cierra al tocar fuera o con Escape (además del toque en
     un link, que ya lo cierra en el onClick). */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (headerRef.current && target && !headerRef.current.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Navegación principal"
        className="border-b border-morning/10 bg-duo/92 shadow-[0_4px_24px_rgba(35,40,26,0.28)] backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <a
            href="#inicio"
            aria-label="Duo Pilates Studio, ir al inicio"
            className="flex min-h-[44px] items-center py-1"
          >
            <DuoIsotipo className="h-9 w-auto md:hidden" />
            <DuoLogo className="hidden h-12 w-auto md:block" />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center rounded-full px-3.5 font-body text-sm font-medium text-morning/85 transition-colors hover:bg-morning/10 hover:text-morning"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-shape inline-flex min-h-[44px] items-center gap-2 border-2 border-duo bg-duo px-4 font-body text-sm font-semibold text-morning transition-colors hover:bg-duo-deep"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Reserva
            </a>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-morning/30 text-morning transition-colors hover:bg-morning/10 md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                {open ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div id="menu-movil" className="border-t border-morning/10 px-4 pb-4 pt-2 md:hidden">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[48px] items-center border-b border-morning/10 font-body text-base font-medium text-morning/90"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ────────────────────────────── 2. hero ────────────────────────────── */

function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-duo pb-22 pt-24 sm:items-center sm:pb-20 sm:pt-28">
      <img
        src={heroSm}
        srcSet={`${heroSm} 800w, ${heroLg} 1400w`}
        sizes="100vw"
        alt="Clase de Pilates Reformer en Duo Pilates Studio: tres alumnas practicando sobre reformers de madera con luz natural"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        fetchPriority="high"
        decoding="async"
      />
      <div className="absolute inset-0 -z-10 bg-duo/62" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-duo via-duo/45 to-duo/75"
        aria-hidden="true"
      />
      <div aria-hidden="true" className="wash-duo absolute inset-0 -z-10 opacity-70" />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-6">
        <div className="reveal max-w-2xl">
          <span className="pill-shape inline-flex items-center gap-2 border border-morning/35 bg-duo/45 px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-morning/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-warmup" aria-hidden="true" />
            Monteserrín · Corvo Plaza · Quito
          </span>

          <h1 className="mt-5 font-display text-[11vw] leading-[0.92] tracking-tight text-morning uppercase sm:text-6xl lg:text-7xl">
            Wanna find
            <br />
            your Duo<span className="text-morning/85">?</span>
          </h1>

          <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-morning/90 sm:text-lg">
            <span className="block">Pilates Reformer personalizado en Quito.</span>
            <span className="block font-semibold italic">We know you. We&apos;ve got you.</span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#paquetes"
              className="pill-shape inline-flex min-h-[52px] items-center justify-center border-2 border-morning bg-morning px-7 py-3 font-body text-sm font-bold uppercase tracking-[0.12em] text-duo shadow-[5px_6px_0_rgba(248,249,223,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Find your match
            </a>
            <WaButton variant="warmup" className="min-h-[52px]">
              Reserva por WhatsApp
            </WaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── 3. this is duo ────────────────────────────── */

const PILLARS = [
  {
    title: "Connection",
    text: "Empezamos por conocerte: tu ritmo, tus necesidades y cómo te sientes cada día. Porque creemos que el movimiento se disfruta más cuando se adapta a ti.",
    icon: (
      <>
        <circle cx="26" cy="30" r="10" />
        <path d="M26 44c-11 2-15 13-13 25 1 7 3 12 3 19" />
        <circle cx="74" cy="30" r="10" />
        <path d="M74 44c11 2 15 13 13 25-1 7-3 12-3 19" />
        <path d="M50 22c-4-5-12-2-12 4 0 5 6 9 12 13 6-4 12-8 12-13 0-6-8-9-12-4z" />
      </>
    ),
  },
  {
    title: "Movement",
    text: "Movimiento con intención: Clases de Pilates Reformer en grupos reducidos, con atención personalizada para desarrollar fuerza, movilidad, equilibrio y control, a tu propio ritmo.",
    icon: (
      <>
        <circle cx="40" cy="22" r="11" />
        <path d="M42 36c-13 1-18 12-16 24 2 12 10 18 10 28" />
        <path d="M29 48c-9 4-15 12-18 22" />
        <path d="M44 42c10 2 17 8 23 16" />
        <path d="M14 88h26" />
      </>
    ),
  },
  {
    title: "Togetherness",
    text: "Un espacio para moverte, conectar y compartir con personas que hacen match con tu energía. Aquí vienes a entrenar, pero también a sentirte parte de nuestra comunidad.",
    icon: (
      <>
        <circle cx="22" cy="27" r="9" />
        <path d="M22 39c-9 2-13 10-12 20 1 8 3 12 3 18" />
        <circle cx="50" cy="20" r="10" />
        <path d="M50 33c-10 2-15 11-14 22 1 9 3 13 3 19" />
        <circle cx="78" cy="27" r="9" />
        <path d="M78 39c9 2 13 10 12 20-1 8-3 12-3 18" />
        <path d="M12 80h76" />
      </>
    ),
  },
];

function ThisIsDuo() {
  return (
    <section
      id="nosotros"
      className="wash-sage relative scroll-mt-24 overflow-hidden bg-morning px-5 py-16 sm:px-6 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="blob-a floaty absolute -right-16 top-10 h-56 w-56 bg-warmup/20 blur-[2px]"
      />
      <div
        aria-hidden="true"
        className="blob-b absolute -left-20 bottom-24 h-64 w-64 bg-warmup/50"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div className="reveal">
            <h2 className="font-display text-4xl uppercase leading-[0.95] text-duo sm:text-5xl">
              This is Duo
            </h2>
            <p className="mt-5 font-body text-base leading-relaxed text-duo/90 sm:text-lg">
              Un espacio para moverte, conectar y compartir con personas que hacen match con tu
              energía.
            </p>
            <p className="mt-4 font-body text-base leading-relaxed text-duo/90">
              Somos un estudio boutique de Pilates Reformer en Quito, donde el movimiento se vive
              de forma más personal. Trabajamos con{" "}
              <strong className="font-semibold text-duo">grupos reducidos</strong> y{" "}
              <strong className="font-semibold text-duo">atención personalizada</strong> para
              conocerte por tu nombre, entender cómo te mueves y adaptar cada clase a tus
              necesidades y objetivos.
            </p>
            <p className="mt-4 font-body text-base font-semibold italic text-duo">
              We know you. We&apos;ve got you.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["Connection", "Movement", "Togetherness"].map((word) => (
                <span
                  key={word}
                  className="pill-shape border border-duo/15 bg-duo/[0.06] px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.16em] text-duo/90"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="reveal relative">
            <img
              src={duoSm}
              srcSet={`${duoSm} 700w, ${duoLg} 1024w`}
              sizes="(min-width: 1024px) 560px, 100vw"
              alt="Instructora de Pilates ajustando suavemente la postura de una alumna sobre el reformer"
              loading="lazy"
              decoding="async"
              className="blob-a h-64 w-full border-4 border-morning object-cover shadow-[10px_12px_0_rgba(156,157,113,0.32)] sm:h-80 lg:h-[420px]"
            />
            <img
              src={bestiesSm}
              srcSet={`${bestiesSm} 320w, ${bestiesLg} 480w`}
              sizes="(min-width: 640px) 160px, 128px"
              alt="Dos amigas riéndose juntas sentadas en los reformers del studio"
              loading="lazy"
              decoding="async"
              className="blob-b absolute -bottom-8 -left-2 h-32 w-32 border-4 border-morning object-cover shadow-[8px_8px_0_rgba(35,40,26,0.25)] sm:-left-6 sm:h-40 sm:w-40"
            />
            <span className="sticker-shape-sm absolute -right-1 -top-4 rotate-[8deg] border-2 border-morning bg-spicy px-2.5 py-1 kicker text-[10px] text-morning shadow-[3px_3px_0_rgba(35,40,26,0.25)]">
              besties only
            </span>
          </div>
        </div>

        <ul className="relative mt-16 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {PILLARS.map((pillar, index) => (
            <li
              key={pillar.title}
              className="reveal grain-local sticker-shape relative flex flex-col items-start gap-3 border-2 border-duo/10 bg-white/55 p-6 shadow-[6px_8px_0_rgba(35,40,26,0.1)]"
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warmup/20 text-duo">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-10 w-10"
                  aria-hidden="true"
                >
                  {pillar.icon}
                </svg>
              </span>
              <h3 className="font-display text-xl uppercase text-duo">{pillar.title}</h3>
              <p className="font-body text-sm leading-relaxed text-duo/90">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ────────────────────────────── 4. packages ────────────────────────────── */

const TONE_CLASSES: Record<Tone, string> = {
  morning: "bg-morning text-duo border-duo/12",
  warmup: "bg-warmup text-ink border-ink/25",
  spicy: "bg-spicy text-morning border-spicy",
  duo: "bg-duo text-morning border-warmup/50",
};

/** Botón "Make it official" adaptado al color de cada sticker. */
const TONE_BUTTON: Record<Tone, string> = {
  morning: "border-duo/35 bg-duo/[0.07] hover:bg-duo/15",
  warmup: "border-ink/35 bg-ink/[0.06] hover:bg-ink/15",
  /* sobre terracota el tinte crema aclaraba el fondo y bajaba el texto a 4.26:1;
     con tinte bosque queda 6.69:1 */
  spicy: "border-morning/50 bg-duo/20 hover:bg-duo/30",
  duo: "border-morning/45 bg-morning/15 hover:bg-morning/25",
};

function Packages() {
  return (
    <section
      id="paquetes"
      className="relative scroll-mt-24 overflow-hidden bg-duo px-5 py-16 sm:px-6 sm:py-24"
    >
      <div aria-hidden="true" className="wash-duo absolute inset-0 opacity-80" />
      <div
        aria-hidden="true"
        className="blob-b floaty absolute -left-24 top-24 h-72 w-72 bg-warmup/25"
      />

      <div className="relative mx-auto max-w-6xl">
        <header className="reveal text-center">
          <p className="kicker text-xs text-morning/85 sm:text-sm">
            Flexible… in more ways than one
          </p>
          <h2 className="mt-1 font-display text-4xl uppercase leading-[0.95] text-morning sm:text-5xl">
            Find your match
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed text-morning/85 sm:text-base">
            <span className="block">Tu próximo paso empieza aquí.</span>
            <span className="block">
              Elige tu paquete, escríbenos por WhatsApp y reserva tu lugar en DUO.
            </span>
            <span className="block">Así de fácil.</span>
          </p>
        </header>

        <ul className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-7">
          {PACKAGES.map((pack, index) => (
            <li
              key={pack.name}
              className="reveal w-full sm:w-[calc(50%-0.875rem)] lg:w-[calc(33.333%-1.1667rem)]"
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <article
                className={`wiggle-target grain-local sticker-shape relative flex h-full flex-col border-2 p-6 shadow-[9px_11px_0_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 ${pack.rotate} ${TONE_CLASSES[pack.tone]}`}
              >
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] opacity-90">
                  {pack.cadence}
                </p>
                <h3 className="mt-1.5 font-display text-2xl uppercase leading-tight">
                  {pack.name}
                </h3>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="wiggle inline-block font-sticker text-5xl leading-none">
                    {pack.price}
                  </span>
                  <span className="font-body text-sm opacity-90">/ {pack.detail}</span>
                </p>
                <p className="mt-3 font-body text-sm italic opacity-90">
                  {pack.blurb}
                  {pack.blurbExtra ? (
                    <span className="block">{pack.blurbExtra}</span>
                  ) : null}
                </p>

                <div className="flex-1" aria-hidden="true" />

                <a
                  href={waLink(`Hola Duo! Quiero el paquete ${pack.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Pedir el paquete ${pack.name} por WhatsApp`}
                  className={`pill-shape mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 border-2 px-5 py-3 font-body text-sm font-bold uppercase tracking-[0.1em] transition-colors ${TONE_BUTTON[pack.tone]}`}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Make it official
                </a>
              </article>
            </li>
          ))}
        </ul>

        <div className="reveal mt-16 text-center">
          <h3 className="font-display text-3xl uppercase leading-tight text-morning sm:text-5xl">
            Let&apos;s make this a thing
          </h3>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-morning/85">
            <span className="block">¿No sabes qué paquete es ideal para ti?</span>
            <span className="mt-2 block">
              Cuéntanos cómo es tu semana y qué buscas lograr. Te ayudamos a encontrar la opción que mejor
              se adapte a tu ritmo.
            </span>
          </p>
          <div className="mt-6 flex justify-center">
            <WaButton variant="morning">Wanna make it official?</WaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── 5. schedule ────────────────────────────── */

/* Inclinación de cada pestaña de horarios: se endereza y sube al pasar el mouse,
   igual que las tarjetas de paquetes. */
const TAB_TILT = [
  "-rotate-[1.2deg]",
  "rotate-[1.4deg]",
  "-rotate-[1.6deg]",
  "rotate-[1.2deg]",
  "-rotate-[1.4deg]",
];

function Schedule() {
  const [active, setActive] = useState(SCHEDULES[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = SCHEDULES.find((slot) => slot.id === active) ?? SCHEDULES[0];

  const focusTab = (index: number) => {
    const next = (index + SCHEDULES.length) % SCHEDULES.length;
    setActive(SCHEDULES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="horarios"
      className="wash-sage relative scroll-mt-24 overflow-hidden bg-morning px-5 py-16 sm:px-6 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="blob-a absolute -right-20 bottom-10 h-64 w-64 bg-warmup/15"
      />

      <div className="relative mx-auto max-w-5xl">
        <header className="reveal text-center">
          <h2 className="font-display text-4xl uppercase leading-[0.95] text-duo sm:text-5xl">
            So… when are we meeting?
          </h2>
        </header>

        <div className="reveal mt-10">
          <div
            role="tablist"
            aria-label="Horarios por bloque"
            className="flex flex-wrap justify-center gap-2.5"
          >
            {SCHEDULES.map((slot, index) => {
              const selected = slot.id === active;
              return (
                <button
                  key={slot.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${slot.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${slot.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(slot.id)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      focusTab(index + 1);
                    }
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      focusTab(index - 1);
                    }
                  }}
                  className={`pill-shape flex min-h-[56px] flex-col items-center justify-center border-2 px-5 py-2 text-center transition-[transform,color,background-color,border-color] duration-300 hover:-translate-y-1 hover:rotate-0 ${TAB_TILT[index % TAB_TILT.length]} ${
                    selected
                      ? "border-duo bg-duo text-morning"
                      : "border-duo/20 bg-white/50 text-duo hover:bg-white/80"
                  }`}
                >
                  <span className="font-body text-xs font-bold uppercase tracking-[0.14em]">
                    {slot.label}
                  </span>
                  <span className="font-body text-[11px] opacity-70">{slot.days}</span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`panel-${current.id}`}
            aria-labelledby={`tab-${current.id}`}
            tabIndex={0}
            className="grain-local sticker-shape relative mt-8 border-2 border-duo/12 bg-white/60 px-6 py-8 text-center shadow-[8px_10px_0_rgba(35,40,26,0.12)] sm:px-10 sm:py-10"
          >
            {current.badge && (
              <span className="sticker-shape-sm absolute -top-4 left-1/2 -translate-x-1/2 rotate-[-5deg] border-2 border-morning bg-duo px-3 py-1.5 font-sticker text-xs uppercase tracking-[0.14em] text-morning shadow-[3px_3px_0_rgba(35,40,26,0.25)]">
                {current.badge}
              </span>
            )}
            <h3 className="font-display text-3xl uppercase text-duo sm:text-4xl">
              {current.label}
            </h3>
            <p className="mt-1 font-body text-sm font-semibold uppercase tracking-[0.18em] text-duo">
              {current.days}
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-3">
              {current.times.map((time) => (
                <li
                  key={time}
                  className="pill-shape border-2 border-duo/15 bg-morning px-5 py-3 font-sticker text-lg tracking-wide text-duo"
                >
                  {time}
                </li>
              ))}
            </ul>
            {current.note && (
              <p className="mt-4 font-body text-sm font-semibold text-spicy">{current.note}</p>
            )}
            <p className="mt-6 font-body text-sm italic text-duo/90">
              Grupos reducidos: tu lugar se reserva por WhatsApp.
            </p>
          </div>
        </div>

        <div className="reveal mt-14 text-center">
          <h3 className="font-display text-3xl uppercase text-duo sm:text-4xl">
            Pick your match
          </h3>
          <div className="mt-5 flex justify-center">
            <WaButton>So… when are we meeting?</WaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── 6. location ────────────────────────────── */

function Location() {
  return (
    <section
      id="ubicacion"
      className="relative scroll-mt-24 overflow-hidden bg-warmup px-5 py-16 sm:px-6 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="blob-b absolute -left-24 top-16 h-64 w-64 bg-morning/60"
      />
      <div className="relative mx-auto max-w-5xl">
        <header className="reveal text-center">
          <p className="kicker text-xs text-ink sm:text-sm">
            Nos vemos en el reformer
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-[1.02] text-ink sm:text-5xl">
            {ADDRESS}
          </h2>
        </header>

        <div className="reveal grain-local sticker-shape relative mt-10 overflow-hidden border-4 border-morning shadow-[10px_12px_0_rgba(35,40,26,0.18)]">
          <iframe
            title="Mapa de Corvo Plaza, Monteserrín, Quito"
            src={MAPS_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block h-[280px] w-full border-0 sm:h-[400px]"
          />
        </div>

        <div className="reveal mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={MAPS_DIRECTIONS}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-shape inline-flex min-h-[48px] items-center justify-center gap-2 border-2 border-duo bg-duo px-6 py-3 font-body text-sm font-bold uppercase tracking-[0.1em] text-morning shadow-[5px_6px_0_rgba(35,40,26,0.2)] transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
              <path d="M12 2a7.5 7.5 0 0 0-7.5 7.5C4.5 15.4 12 22 12 22s7.5-6.6 7.5-12.5A7.5 7.5 0 0 0 12 2Zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" />
            </svg>
            Cómo llegar
          </a>
          <WaButton variant="morning" className="border-duo/20">
            Reserva por WhatsApp
          </WaButton>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── 7. final cta ────────────────────────────── */

function FinalCta() {
  return (
    <section aria-label="Reserva tu primera clase" className="relative overflow-hidden bg-duo">
      <div aria-hidden="true" className="wash-duo absolute inset-0 opacity-90" />
      <div
        aria-hidden="true"
        className="blob-a floaty absolute -right-16 -top-10 h-64 w-64 bg-warmup/25"
      />
      <div className="relative mx-auto max-w-3xl px-5 py-16 text-center sm:px-6 sm:py-24">
        <p className="reveal kicker text-xs text-morning/85 sm:text-sm">Better together</p>
        <h2 className="reveal mt-2 font-display text-4xl uppercase leading-[0.95] text-morning sm:text-6xl">
          ¿Lista para tu primera clase?
        </h2>
        <p className="reveal mt-5 font-body text-base text-morning/85">
          <span className="block font-semibold text-morning">Estamos aquí para ti.</span>
          <span className="mt-2 block">
            Escríbenos y te ayudamos con todo: horarios, disponibilidad y cómo llegar a DUO.
          </span>
        </p>
        <div className="reveal mt-8 flex justify-center">
          <WaButton variant="morning" className="min-h-[52px]">
            Reserva por WhatsApp
          </WaButton>
        </div>
        <p className="reveal mt-4 font-body text-xs uppercase tracking-[0.2em] text-morning/85">
          Respuesta rápida · {WHATSAPP_DISPLAY}
        </p>
      </div>
      <WaveDivider fill="#F8F9DF" />
    </section>
  );
}

/* ────────────────────────────── 8. footer ────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-morning px-5 pb-32 pt-10 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 border-b border-duo/12 pb-8 sm:grid-cols-3">
          <div>
            <DuoLogo tone="dark" />
            <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-duo/90">
              <span className="block">Pilates Reformer, a tu ritmo y a tu medida.</span>
              <span className="mt-1.5 block">
                Grupos reducidos, atención personalizada y besties incluidos
              </span>
            </p>
          </div>

          <div>
            <h3 className="font-body text-xs font-bold uppercase tracking-[0.2em] text-duo/90">
              Siguenos
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Duo Pilates Studio"
                  className="inline-flex min-h-[44px] items-center gap-2.5 font-body text-sm font-medium text-duo transition-colors hover:text-spicy"
                >
                  <InstagramIcon className="h-5 w-5" />
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
              <li>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Escribir a Duo Pilates Studio por WhatsApp"
                  className="inline-flex min-h-[44px] items-center gap-2.5 font-body text-sm font-medium text-duo transition-colors hover:text-spicy"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-body text-xs font-bold uppercase tracking-[0.2em] text-duo/90">
              Dónde
            </h3>
            <p className="mt-4 font-body text-sm leading-relaxed text-duo/90">
              {ADDRESS}
              <br />
              Quito, Ecuador
            </p>
            <a
              href={MAPS_DIRECTIONS}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-[44px] items-center font-body text-sm font-semibold text-spicy underline decoration-spicy/40 underline-offset-4"
            >
              Cómo llegar
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 pt-6 text-center">
          <p className="kicker text-[11px] text-duo">we know you. we&apos;ve got you.</p>
          <p className="font-body text-xs text-duo/90">
            © Duo Pilates Studio · Quito, Ecuador
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────── floating whatsapp ────────────────────────────── */

function FloatingWhatsApp() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Duo Pilates Studio por WhatsApp"
      className="wa-float fixed z-[60] flex h-14 w-14 items-center justify-center rounded-full border-2 border-morning bg-[#25D366] text-white shadow-[0_8px_22px_rgba(35,40,26,0.35)] transition-transform duration-200 hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
