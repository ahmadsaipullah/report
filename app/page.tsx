'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number, d = 2) =>
  n.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n: number) => (n * 100).toFixed(1) + '%';
const achColor = (n: number) =>
  n >= 0.90 ? '#16A34A' : n >= 0.75 ? '#D97706' : n >= 0.60 ? '#EA580C' : '#DC2626';
const achBg = (n: number) =>
  n >= 0.90 ? '#DCFCE7' : n >= 0.75 ? '#FEF3C7' : n >= 0.60 ? '#FFF7ED' : '#FEF2F2';

// ─── Data ────────────────────────────────────────────────────────────────────
const NATIONAL = {
  blended: {
    w1: 1273.06, targetW1: 2044.32, achW1: 0.6227,
    mtd: 6425, achMtd: 0.1981,
    ytdReal: 47542.36, ytdTarget: 53840.47, ytdAch: 0.8830,
  },
  kum:  { w1: 278.78,  mtd: 2401, ytdReal: 11542.63, ytdTarget: 15470.82, ytdAch: 0.7461, dod: 85.99  },
  kur:  { w1: 994.28,  mtd: 4024, ytdReal: 35999.74, ytdTarget: 38369.65, ytdAch: 0.9382, dod: 301.99 },
  bd:   { actual: 107151.55, target: 109378, ach: 0.9796 },
};

const REGIONS = [
  { code:'R01', w1:143.60, tW1:185.50, achW1:0.7741, mtd:583,  ytdReal:4471.95,  ytdTarget:4997.10,  ytdAch:0.8949, bd:10810.61, bdTgt:10959, bdAch:0.9865 },
  { code:'R02', w1:206.20, tW1:321.36, achW1:0.6416, mtd:1010, ytdReal:8108.28,  ytdTarget:9045.32,  ytdAch:0.8964, bd:18858.22, bdTgt:18993, bdAch:0.9929 },
  { code:'R03', w1:48.57,  tW1:114.55, achW1:0.4240, mtd:360,  ytdReal:2050.31,  ytdTarget:2514.78,  ytdAch:0.8153, bd:4522.93,  bdTgt:4902,  bdAch:0.9227 },
  { code:'R04', w1:43.22,  tW1:75.09,  achW1:0.5756, mtd:236,  ytdReal:1551.46,  ytdTarget:1802.45,  ytdAch:0.8607, bd:3712.48,  bdTgt:3771,  bdAch:0.9845 },
  { code:'R05', w1:34.67,  tW1:87.82,  achW1:0.3948, mtd:276,  ytdReal:1709.14,  ytdTarget:2074.30,  ytdAch:0.8240, bd:3973.13,  bdTgt:4119,  bdAch:0.9646 },
  { code:'R06', w1:119.23, tW1:198.23, achW1:0.6015, mtd:623,  ytdReal:4673.94,  ytdTarget:5305.41,  ytdAch:0.8810, bd:10558.43, bdTgt:10841, bdAch:0.9739 },
  { code:'R07', w1:207.84, tW1:274.91, achW1:0.7560, mtd:864,  ytdReal:6747.66,  ytdTarget:7500.16,  ytdAch:0.8997, bd:14362.37, bdTgt:14641, bdAch:0.9810 },
  { code:'R08', w1:186.20, tW1:281.27, achW1:0.6620, mtd:884,  ytdReal:6737.40,  ytdTarget:7535.73,  ytdAch:0.8941, bd:14821.43, bdTgt:15006, bdAch:0.9877 },
  { code:'R09', w1:83.41,  tW1:133.64, achW1:0.6242, mtd:420,  ytdReal:3464.29,  ytdTarget:3794.57,  ytdAch:0.9130, bd:7288.74,  bdTgt:7437,  bdAch:0.9801 },
  { code:'R10', w1:110.36, tW1:199.50, achW1:0.5532, mtd:627,  ytdReal:4607.74,  ytdTarget:5199.65,  ytdAch:0.8862, bd:10440.23, bdTgt:10650, bdAch:0.9803 },
  { code:'R11', w1:75.13,  tW1:121.23, achW1:0.6197, mtd:381,  ytdReal:2772.27,  ytdTarget:3113.19,  ytdAch:0.8905, bd:6045.77,  bdTgt:6029,  bdAch:1.0028 },
  { code:'R12', w1:14.63,  tW1:51.23,  achW1:0.2856, mtd:161,  ytdReal:647.94,   ytdTarget:957.81,   ytdAch:0.6765, bd:1757.22,  bdTgt:2030,  bdAch:0.8656 },
];

const sortedW1  = [...REGIONS].sort((a, b) => b.achW1  - a.achW1);
const sortedYTD = [...REGIONS].sort((a, b) => b.ytdAch - a.ytdAch);
const sortedBD  = [...REGIONS].sort((a, b) => b.bdAch  - a.bdAch);

// ─── Reusable UI ─────────────────────────────────────────────────────────────
function SlideHeader({ num, title, sub }: { num: number; title: string; sub?: string }) {
  return (
    <div className="mb-3 md:mb-5 shrink-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#E5451F' }}>
            Slide {String(num).padStart(2, '0')}
          </p>
          <h2 className="text-base md:text-xl lg:text-2xl font-bold tracking-tight leading-tight"
              style={{ color: '#002855' }}>{title}</h2>
          {sub && (
            <p className="hidden sm:block text-xs md:text-sm mt-0.5 leading-snug" style={{ color: '#64748B' }}>{sub}</p>
          )}
        </div>
        <div className="hidden md:block text-right text-xs shrink-0" style={{ color: '#94A3B8' }}>
          <div className="font-semibold">Daily Run Rate</div>
          <div>Micro Productive · Nov 2026</div>
        </div>
      </div>
      <div className="mt-2 h-px"
           style={{ background: 'linear-gradient(90deg, #E5451F 80px, #E2E8F0 80px)' }} />
    </div>
  );
}

function AchBadge({ val }: { val: number }) {
  return (
    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ color: achColor(val), backgroundColor: achBg(val) }}>
      {pct(val)}
    </span>
  );
}

function RadialGauge({ val, size = 100, label }: { val: number; size?: number; label?: string }) {
  const r = 42, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const fill = circ * Math.min(val, 1);
  const color = achColor(val);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth="9" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="50" y="47" textAnchor="middle" fontSize="15" fontWeight="700"
              fill="#111827">{(val * 100).toFixed(1)}%</text>
        <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#64748B">ach</text>
      </svg>
      {label && <span className="text-xs font-semibold text-slate-600">{label}</span>}
    </div>
  );
}

function BarRow({
  label, val, maxVal, ach, detail, highlight = false,
}: {
  label: string; val: number; maxVal: number; ach: number; detail?: string; highlight?: boolean;
}) {
  const w = Math.min((val / maxVal) * 100, 100);
  const color = achColor(ach);
  return (
    <div className={`flex items-center gap-1.5 md:gap-3 py-0.5 md:py-1 px-1.5 md:px-2 rounded ${highlight ? 'bg-blue-50' : ''}`}>
      <span className="w-8 md:w-10 shrink-0 text-right text-xs font-bold" style={{ color: '#334155' }}>
        {label}
      </span>
      <div className="flex-1 h-3.5 md:h-4 rounded overflow-hidden" style={{ background: '#F1F5F9' }}>
        <div className="h-full rounded"
             style={{ width: `${w}%`, backgroundColor: color, opacity: 0.82,
                      transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <span className="w-14 md:w-16 shrink-0 text-right text-xs" style={{ color: '#64748B' }}>
        {detail ?? `${fmt(val, 1)} M`}
      </span>
      <span className="w-10 md:w-14 shrink-0 text-right text-xs font-bold" style={{ color }}>
        {pct(ach)}
      </span>
    </div>
  );
}

// ─── Slide 1: Cover ──────────────────────────────────────────────────────────
function SlideCover() {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: '#002855' }}>
      {/* Diagonal line pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `repeating-linear-gradient(-45deg,transparent,transparent 48px,rgba(255,255,255,0.025) 48px,rgba(255,255,255,0.025) 50px)`,
      }} />

      {/* Working-day header bar */}
      <div className="relative z-10 px-4 md:px-8 py-2.5 md:py-3 flex flex-wrap items-center justify-between gap-2"
           style={{ background: 'rgba(0,0,0,0.45)', borderBottom: '2px solid #E5451F' }}>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className="text-sm md:text-base font-black text-white">Hari Kerja ke 04</span>
          <span className="hidden sm:inline text-white/30 text-lg leading-none">|</span>
          <span className="hidden sm:inline text-xs md:text-sm font-medium" style={{ color: '#93C5FD' }}>
            Sisa 18 Hari Kerja di bulan Oktober 2026
          </span>
        </div>
        <span className="text-xs font-bold tracking-widest px-2 py-0.5 rounded"
              style={{ background: 'rgba(229,69,31,0.2)', color: '#FCA5A5', border: '1px solid rgba(229,69,31,0.3)' }}>
          RAHASIA · INTERNAL MANDIRI
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-16 text-center gap-4 md:gap-5">
        <p className="text-xs tracking-[0.3em] md:tracking-[0.4em] font-semibold uppercase"
           style={{ color: '#64748B' }}>
          Bank Mandiri · Divisi Bisnis Mikro
        </p>

        <div>
          <p className="text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase mb-1.5"
             style={{ color: '#E5451F' }}>Daily Run Rate</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
            MICRO PRODUCTIVE
          </h1>
          <p className="mt-2 text-sm md:text-lg font-light tracking-wide" style={{ color: '#7DD3FC' }}>
            Monitoring Realisasi Booking
          </p>
        </div>

        <div className="w-12 h-0.5 rounded" style={{ background: '#E5451F' }} />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 w-full max-w-2xl">
          {([
            { label: 'Booking W1 Blended', val: 'Rp 1.273 M',   sub: '62,3% dari Target W1',  hi: false },
            { label: 'Baki Debet Nasional', val: 'Rp 107.152 M', sub: '97,96% dari Target',    hi: true  },
            { label: 'YTD Blended',         val: 'Rp 47.542 M',  sub: '88,3% dari Target YTD', hi: false },
          ] as { label: string; val: string; sub: string; hi: boolean }[]).map(({ label, val, sub, hi }) => (
            <div key={label} className="rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-center"
                 style={{
                   background: hi ? 'rgba(229,69,31,0.12)' : 'rgba(255,255,255,0.05)',
                   border: `1px solid ${hi ? 'rgba(229,69,31,0.35)' : 'rgba(255,255,255,0.08)'}`,
                 }}>
              <p className="text-xs mb-1" style={{ color: '#64748B' }}>{label}</p>
              <p className="text-lg md:text-xl font-black text-white">{val}</p>
              <p className="text-xs mt-0.5" style={{ color: hi ? '#FCA5A5' : '#475569' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stripe */}
      <div className="relative z-10 h-1.5 w-full"
           style={{ background: 'linear-gradient(90deg,#E5451F 0%,#FBBF24 50%,#E5451F 100%)' }} />
    </div>
  );
}

// ─── Slide 2: Trend Daily Booking + DoD ──────────────────────────────────────
function SlideTrend() {
  const CW = 480, CH = 180;
  const P = { t: 12, r: 16, b: 30, l: 44 };
  const pW = CW - P.l - P.r;
  const pH = CH - P.t - P.b;
  const maxY = 7000, hkTotal = 22;
  const toX = (hk: number) => P.l + (hk / hkTotal) * pW;
  const toY = (v: number) => P.t + pH - Math.min(v / maxY, 1) * pH;

  const linePath = (monthly: number, maxHK = hkTotal) =>
    Array.from({ length: maxHK + 1 }, (_, i) =>
      `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY((i / hkTotal) * monthly).toFixed(1)}`
    ).join(' ');

  const oct26Path = `M${toX(0)},${toY(0)} L${toX(4).toFixed(1)},${toY(1273.06).toFixed(1)}`;

  const dodData = [
    { label: 'KUM',     val: 85.9948,                    color: '#1D4ED8' },
    { label: 'KUR',     val: 301.9881,                   color: '#16A34A' },
    { label: 'Blended', val: 85.9948 + 301.9881,         color: '#E5451F' },
  ];
  const dodMax = dodData[2].val;

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Title bar */}
      <div className="px-4 md:px-8 py-2 md:py-3 flex flex-wrap items-center justify-between gap-2 shrink-0"
           style={{ background: '#002855' }}>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className="text-sm font-black text-white">Hari Kerja ke 04</span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span className="hidden sm:inline text-xs md:text-sm text-white/70">
            Sisa 18 HK · Oktober 2026
          </span>
        </div>
        <span className="text-xs" style={{ color: '#475569' }}>Slide 02 · Daily Run Rate</span>
      </div>

      {/* Chart area — stacks vertically on mobile */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

        {/* LEFT — Trend line chart */}
        <div className="flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r"
             style={{ borderColor: '#E2E8F0' }}>
          <div className="px-3 md:px-5 py-1.5 md:py-2 flex flex-wrap items-center justify-between gap-2 shrink-0"
               style={{ background: '#1E293B' }}>
            <span className="text-xs md:text-sm font-bold text-white">
              Trend Daily Booking – <span style={{ color: '#FBBF24' }}>Blended</span>
              <span className="text-xs font-normal text-white/50 ml-1">(Rp M)</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' }}>
              MoM: –Rp50,2 M (–3,79%)
            </span>
          </div>

          {/* Legend */}
          <div className="px-3 md:px-5 py-1 flex flex-wrap items-center gap-3 md:gap-5 shrink-0"
               style={{ borderBottom: '1px solid #F1F5F9' }}>
            {[
              { color: '#CBD5E1', label: 'Okt-25' },
              { color: '#FBBF24', label: 'Sep-26' },
              { color: '#22C55E', label: 'Okt-26 ✦' },
              { color: '#E5451F', label: 'Target MtD', dash: true },
            ].map(({ color, label, dash }) => (
              <span key={label} className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
                <svg width="18" height="8" style={{ display: 'inline' }}>
                  <line x1="0" y1="4" x2="18" y2="4" stroke={color} strokeWidth="2"
                        strokeDasharray={dash ? '5,3' : undefined} />
                </svg>
                {label}
              </span>
            ))}
          </div>

          {/* SVG chart — responsive */}
          <div className="flex-1 p-2 min-h-0" style={{ minHeight: 100 }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="xMidYMid meet">
              {[0, 1500, 3000, 4500, 6000].map(v => (
                <g key={v}>
                  <line x1={P.l} y1={toY(v)} x2={CW - P.r} y2={toY(v)}
                        stroke={v === 0 ? '#CBD5E1' : '#F1F5F9'} strokeWidth={v === 0 ? 1 : 0.6} />
                  <text x={P.l - 3} y={toY(v)} textAnchor="end" fontSize="8.5" fill="#94A3B8"
                        dominantBaseline="middle">{v === 0 ? '0' : `${v / 1000}K`}</text>
                </g>
              ))}
              {[1, 5, 10, 15, 22].map(hk => (
                <text key={hk} x={toX(hk)} y={CH - P.b + 10} textAnchor="middle" fontSize="8" fill="#94A3B8">{hk}</text>
              ))}
              <text x={P.l + pW / 2} y={CH - 1} textAnchor="middle" fontSize="7.5" fill="#CBD5E1">Hari Kerja</text>

              <path d={linePath(1249.09)} fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
              <path d={linePath(1323.28)} fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeOpacity="0.8" />
              <path d={linePath(6425)}    fill="none" stroke="#E5451F" strokeWidth="1.5" strokeDasharray="7,4" />

              <line x1={toX(0)} y1={toY(2044.32)} x2={toX(5)} y2={toY(2044.32)}
                    stroke="#E5451F" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.5" />
              <text x={toX(5.2)} y={toY(2044.32)} fontSize="7.5" fill="#E5451F" dominantBaseline="middle">Target W1</text>

              <path d={oct26Path} fill="none" stroke="#22C55E" strokeWidth="2.5" />
              <circle cx={toX(4)} cy={toY(1273.06)} r="5" fill="#22C55E" />
              <rect x={toX(4) - 34} y={toY(1273.06) - 21} width="68" height="16" rx="3" fill="#002855" />
              <text x={toX(4)} y={toY(1273.06) - 13} textAnchor="middle" fontSize="8.5" fill="white" fontWeight="700">
                1.273,06 M
              </text>
              <text x={toX(4) + 8} y={toY(1273.06) + 13} fontSize="8" fill="#16A34A" fontWeight="600">
                62,27% to Target W1
              </text>
              <text x={toX(4) + 8} y={toY(1273.06) + 23} fontSize="8" fill="#D97706">
                19,81% to Target MtD
              </text>
            </svg>
          </div>
        </div>

        {/* RIGHT — DoD booking */}
        <div className="shrink-0 flex flex-col md:w-56" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-3 md:px-4 py-1.5 md:py-2 shrink-0" style={{ background: '#1E293B' }}>
            <span className="text-xs md:text-sm font-bold text-white">
              DoD Booking – <span style={{ color: '#22C55E' }}>Blended</span>
            </span>
          </div>
          <div className="px-3 md:px-4 py-1 shrink-0 flex items-center gap-2"
               style={{ borderBottom: '1px solid #F1F5F9' }}>
            <span className="text-xs" style={{ color: '#64748B' }}>MoM Avg Daily:</span>
            <span className="text-xs font-bold" style={{ color: '#EF4444' }}>–Rp7,2 M</span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-3 md:gap-4 p-3 md:p-4">
            {dodData.map(({ label, val, color }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold" style={{ color: '#334155' }}>{label}</span>
                  <span className="text-xs font-black" style={{ color }}>{fmt(val, 2)} M</span>
                </div>
                <div className="h-5 rounded overflow-hidden" style={{ background: '#F1F5F9' }}>
                  <div className="h-full rounded flex items-center pl-1.5"
                       style={{ width: `${(val / dodMax) * 100}%`, background: color, opacity: 0.85 }} />
                </div>
              </div>
            ))}
            <div className="mt-1 p-2 rounded" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <p className="text-xs text-slate-400 mb-0.5">Avg Book / HK (W1)</p>
              <p className="text-sm font-black" style={{ color: '#002855' }}>
                {fmt((85.9948 + 301.9881) / 4, 2)} M
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Run rate MtD: {fmt(((85.9948 + 301.9881) / 4) * 22, 0)} M
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 3: National KPIs ───────────────────────────────────────────────────
function SlideNational() {
  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 lg:p-10 bg-white overflow-y-auto">
      <SlideHeader num={3} title="Ringkasan Nasional"
        sub="Realisasi booking per 9 November 2026 · Week 1 (4 dari 22 Hari Kerja)" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-3 md:mb-5">
        {/* BLENDED */}
        {[
          {
            tag: 'Blended', sub: 'KUM + KUR', color: '#002855',
            main: { label: 'Booking W1', val: fmt(NATIONAL.blended.w1) + ' M', big: true },
            rows: [
              { label: 'Target W1',  val: fmt(NATIONAL.blended.targetW1) + ' M' },
              { label: 'Target MTD', val: fmt(NATIONAL.blended.mtd, 0) + ' M'  },
            ],
            ytd: NATIONAL.blended.ytdAch, gauge: NATIONAL.blended.achW1,
          },
          {
            tag: 'KUM', sub: 'Kredit Usaha Mikro', color: '#1D4ED8',
            main: { label: 'DoD Booking', val: fmt(NATIONAL.kum.dod) + ' M', big: true },
            rows: [
              { label: 'Booking W1', val: fmt(NATIONAL.kum.w1) + ' M'  },
              { label: 'Target MTD', val: fmt(NATIONAL.kum.mtd, 0) + ' M' },
            ],
            ytd: NATIONAL.kum.ytdAch, gauge: NATIONAL.kum.ytdAch,
          },
          {
            tag: 'KUR', sub: 'Kredit Usaha Rakyat', color: '#16A34A',
            main: { label: 'DoD Booking', val: fmt(NATIONAL.kur.dod) + ' M', big: true },
            rows: [
              { label: 'Booking W1', val: fmt(NATIONAL.kur.w1) + ' M'  },
              { label: 'Target MTD', val: fmt(NATIONAL.kur.mtd, 0) + ' M' },
            ],
            ytd: NATIONAL.kur.ytdAch, gauge: NATIONAL.kur.ytdAch,
          },
        ].map(({ tag, sub, color, main, rows, ytd, gauge }) => (
          <div key={tag} className="rounded-xl p-3 md:p-5 border-t-4 shadow-sm"
               style={{ background: '#F8FAFC', borderColor: color }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{tag}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
              <RadialGauge val={gauge} size={64} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline border-b border-slate-100 pb-1.5">
                <span className="text-xs text-slate-500">{main.label}</span>
                <span className="text-base md:text-lg font-bold" style={{ color }}>{main.val}</span>
              </div>
              {rows.map(r => (
                <div key={r.label} className="flex justify-between items-baseline border-b border-slate-100 pb-1.5">
                  <span className="text-xs text-slate-500">{r.label}</span>
                  <span className="text-xs md:text-sm font-semibold text-slate-700">{r.val}</span>
                </div>
              ))}
              <div className="flex justify-between items-baseline pt-0.5">
                <span className="text-xs text-slate-500">YTD Ach</span>
                <AchBadge val={ytd} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Baki Debet banner */}
      <div className="rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6"
           style={{ background: 'linear-gradient(135deg,#002855 0%,#003a7a 100%)' }}>
        <div className="shrink-0">
          <RadialGauge val={NATIONAL.bd.ach} size={72} />
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-6">
          <p className="text-xs font-bold tracking-widest uppercase text-white/60 mb-1">Baki Debet Nasional</p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-white">
              {fmt(NATIONAL.bd.actual, 0)} M
            </span>
            <span className="text-xs text-white/50">dari target {fmt(NATIONAL.bd.target, 0)} M</span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">Posisi Oktober 2026</p>
        </div>
        <div className="ml-auto grid grid-cols-2 gap-x-6 gap-y-1 text-right">
          <div>
            <p className="text-xs text-white/50">Gap BD</p>
            <p className="text-xs md:text-sm font-bold" style={{ color: '#FCA5A5' }}>
              {fmt(NATIONAL.bd.actual - NATIONAL.bd.target, 0)} M
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">YTD Blended</p>
            <p className="text-xs md:text-sm font-bold text-green-300">
              {fmt(NATIONAL.blended.ytdReal, 0)} M
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 4: Booking W1 by Region ────────────────────────────────────────────
function SlideW1() {
  const maxTarget = Math.max(...REGIONS.map(r => r.tW1));
  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 lg:p-10 bg-white overflow-y-auto">
      <SlideHeader num={4} title="Booking W1 — Per Regional Blended"
        sub="Achievement vs Target W1 · Diurutkan dari pencapaian tertinggi" />

      {/* National strip */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-3 md:mb-5 p-2.5 md:p-3 rounded-xl"
           style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <div className="text-center px-3 border-r border-slate-200">
          <p className="text-xs text-slate-500">Nasional W1</p>
          <p className="text-lg md:text-xl font-black" style={{ color: '#002855' }}>
            {fmt(NATIONAL.blended.w1, 0)} M
          </p>
        </div>
        <div className="text-center px-3 border-r border-slate-200">
          <p className="text-xs text-slate-500">Target W1</p>
          <p className="text-sm font-bold text-slate-600">{fmt(NATIONAL.blended.targetW1, 0)} M</p>
        </div>
        <div className="text-center px-3 border-r border-slate-200">
          <p className="text-xs text-slate-500">% Ach W1</p>
          <AchBadge val={NATIONAL.blended.achW1} />
        </div>
        <div className="flex-1 min-w-24 h-2.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
          <div className="h-full rounded-full"
               style={{ width: pct(NATIONAL.blended.achW1), background: 'linear-gradient(90deg,#E5451F,#FBBF24)' }} />
        </div>
        <div className="hidden sm:block text-center px-3">
          <p className="text-xs text-slate-500">Pace (4/22 HK)</p>
          <p className="text-sm font-bold text-slate-600">18,2%</p>
        </div>
      </div>

      {/* Bar chart — single col on mobile, 2 col on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 content-start">
        {sortedW1.map(r => (
          <BarRow key={r.code} label={r.code} val={r.w1} maxVal={maxTarget}
                  ach={r.achW1} detail={`${fmt(r.w1, 1)} M`}
                  highlight={r.code === 'R01' || r.code === 'R07'} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 md:gap-6 text-xs text-slate-400 shrink-0">
        {[
          { color: '#16A34A', label: '≥ 90%' },
          { color: '#D97706', label: '75–90%' },
          { color: '#EA580C', label: '60–75%' },
          { color: '#DC2626', label: '< 60%' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 5: YTD Performance ─────────────────────────────────────────────────
function SlideYTD() {
  const maxYtd = Math.max(...REGIONS.map(r => r.ytdReal));
  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 lg:p-10 bg-white overflow-y-auto">
      <SlideHeader num={5} title="Realisasi Booking YTD — Blended"
        sub="Pencapaian year-to-date s.d. 9 Agustus 2026 · Semua Regional" />

      {/* National headline */}
      <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-4 p-3 rounded-xl shrink-0"
           style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <RadialGauge val={NATIONAL.blended.ytdAch} size={72} label="Nasional" />
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'YTD Real',   val: fmt(NATIONAL.blended.ytdReal, 0) + ' M',   color: '#002855' },
            { label: 'YTD Target', val: fmt(NATIONAL.blended.ytdTarget, 0) + ' M', color: '#64748B' },
            { label: 'Gap YTD',    val: fmt(NATIONAL.blended.ytdReal - NATIONAL.blended.ytdTarget, 0) + ' M', color: '#DC2626' },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-lg p-2" style={{ background: '#fff' }}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-sm md:text-base font-black" style={{ color }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Regional bars */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-0.5 md:gap-0.5">
          {sortedYTD.map((r, i) => (
            <BarRow key={r.code} label={r.code}
                    val={r.ytdReal} maxVal={maxYtd}
                    ach={r.ytdAch} detail={`${fmt(r.ytdReal, 0)} M`}
                    highlight={i === 0} />
          ))}
        </div>

        {/* Summary sidebar — hidden on small mobile */}
        <div className="hidden sm:flex flex-col gap-3 w-full md:w-40 shrink-0 justify-center">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2 text-slate-400">Terbaik</p>
            {sortedYTD.slice(0, 3).map((r, i) => (
              <div key={r.code} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-black w-4"
                      style={{ color: ['#FFD700','#C0C0C0','#CD7F32'][i] }}>{i + 1}</span>
                <span className="text-xs font-bold text-slate-700">{r.code}</span>
                <AchBadge val={r.ytdAch} />
              </div>
            ))}
          </div>
          <div className="h-px" style={{ background: '#E2E8F0' }} />
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2 text-slate-400">Perhatian</p>
            {sortedYTD.slice(-3).reverse().map(r => (
              <div key={r.code} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-700">{r.code}</span>
                <AchBadge val={r.ytdAch} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 6: Baki Debet ──────────────────────────────────────────────────────
function SlideBD() {
  const maxBd = Math.max(...REGIONS.map(r => r.bd));
  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 lg:p-10 bg-white overflow-y-auto">
      <SlideHeader num={6} title="Baki Debet — Posisi Oktober 2026"
        sub="Outstanding balance per regional · Target Juli 2026 sebagai baseline" />

      {/* National BD */}
      <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-4 p-3 rounded-xl shrink-0"
           style={{ background: 'linear-gradient(135deg,#002855 0%,#003a7a 100%)' }}>
        <RadialGauge val={NATIONAL.bd.ach} size={72} />
        <div className="border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4">
          <p className="text-xs font-bold tracking-widest uppercase text-white/60 mb-1">Baki Debet Nasional</p>
          <span className="text-xl md:text-2xl font-black text-white">{fmt(NATIONAL.bd.actual, 0)} M</span>
          <span className="text-xs text-white/50 ml-2">target {fmt(NATIONAL.bd.target, 0)} M</span>
        </div>
        <div className="ml-auto flex flex-wrap gap-3">
          {sortedBD.filter(r => r.bdAch >= 1).map(r => (
            <div key={r.code} className="text-center px-2 py-1 rounded-lg" style={{ background: '#DCFCE7' }}>
              <p className="text-xs font-bold text-green-700">{r.code}</p>
              <p className="text-xs font-black text-green-600">{pct(r.bdAch)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-0.5">
          {sortedBD.map(r => (
            <BarRow key={r.code} label={r.code}
                    val={r.bd} maxVal={maxBd}
                    ach={r.bdAch} detail={`${fmt(r.bd, 0)} M`} />
          ))}
        </div>

        {/* Sidebar */}
        <div className="hidden sm:flex flex-col gap-3 w-full md:w-44 shrink-0 justify-center">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#16A34A' }}>Di Atas Target</p>
            {sortedBD.filter(r => r.bdAch >= 1).map(r => (
              <div key={r.code} className="flex items-center justify-between mb-1.5 p-2 rounded-lg" style={{ background: '#DCFCE7' }}>
                <span className="text-xs font-bold text-green-700">{r.code}</span>
                <span className="text-xs font-black text-green-600">{pct(r.bdAch)}</span>
              </div>
            ))}
          </div>
          <div className="h-px" style={{ background: '#E2E8F0' }} />
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2 text-slate-400">Butuh Perhatian</p>
            {sortedBD.slice(-3).reverse().map(r => (
              <div key={r.code} className="flex items-center justify-between mb-1.5 p-2 rounded-lg"
                   style={{ background: r.bdAch < 0.90 ? '#FEF2F2' : '#FFF7ED' }}>
                <span className="text-xs font-bold" style={{ color: achColor(r.bdAch) }}>{r.code}</span>
                <span className="text-xs font-black" style={{ color: achColor(r.bdAch) }}>{pct(r.bdAch)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 7: Rankings ────────────────────────────────────────────────────────
function SlideRanking() {
  return (
    <div className="w-full h-full flex flex-col p-3 md:p-6 lg:p-10 bg-white overflow-y-auto">
      <SlideHeader num={7} title="Performance Ranking — Semua Dimensi"
        sub="Perbandingan ranking W1 Booking vs YTD Booking per regional" />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 min-h-0">
        {/* W1 ranking */}
        <div className="flex flex-col min-h-0">
          <p className="text-xs md:text-sm font-bold mb-2 md:mb-3 flex items-center gap-2 shrink-0"
             style={{ color: '#002855' }}>
            <span className="inline-block w-2 h-5 rounded-sm" style={{ background: '#E5451F' }} />
            Ranking Booking W1 (Ach vs Target W1)
          </p>
          <div className="space-y-1.5 overflow-y-auto">
            {sortedW1.map((r, i) => (
              <div key={r.code} className="flex items-center gap-2 py-1 px-1.5 rounded-lg"
                   style={{ background: i < 3 ? '#F0FDF4' : i >= sortedW1.length - 3 ? '#FFF7F7' : '#FAFAFA' }}>
                <span className="w-5 text-center text-xs font-black"
                      style={{ color: i === 0 ? '#D97706' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#CBD5E1' }}>
                  {i + 1}
                </span>
                <span className="w-8 text-xs font-bold text-slate-700">{r.code}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: '#E2E8F0' }}>
                  <div className="h-full rounded-full"
                       style={{ width: pct(r.achW1), background: achColor(r.achW1) }} />
                </div>
                <span className="w-12 text-right text-xs font-bold" style={{ color: achColor(r.achW1) }}>
                  {pct(r.achW1)}
                </span>
                <span className="hidden sm:inline w-16 text-right text-xs text-slate-400">
                  {fmt(r.w1, 1)} M
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* YTD ranking */}
        <div className="flex flex-col min-h-0">
          <p className="text-xs md:text-sm font-bold mb-2 md:mb-3 flex items-center gap-2 shrink-0"
             style={{ color: '#002855' }}>
            <span className="inline-block w-2 h-5 rounded-sm" style={{ background: '#1D4ED8' }} />
            Ranking Booking YTD (% Ach YTD)
          </p>
          <div className="space-y-1.5 overflow-y-auto">
            {sortedYTD.map((r, i) => (
              <div key={r.code} className="flex items-center gap-2 py-1 px-1.5 rounded-lg"
                   style={{ background: i < 3 ? '#F0FDF4' : i >= sortedYTD.length - 3 ? '#FFF7F7' : '#FAFAFA' }}>
                <span className="w-5 text-center text-xs font-black"
                      style={{ color: i === 0 ? '#D97706' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#CBD5E1' }}>
                  {i + 1}
                </span>
                <span className="w-8 text-xs font-bold text-slate-700">{r.code}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: '#E2E8F0' }}>
                  <div className="h-full rounded-full"
                       style={{ width: pct(r.ytdAch), background: achColor(r.ytdAch) }} />
                </div>
                <span className="w-12 text-right text-xs font-bold" style={{ color: achColor(r.ytdAch) }}>
                  {pct(r.ytdAch)}
                </span>
                <span className="hidden sm:inline w-16 text-right text-xs text-slate-400">
                  {fmt(r.ytdReal, 0)} M
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom summary */}
      <div className="mt-3 p-2.5 md:p-3 rounded-xl flex flex-wrap items-center gap-3 md:gap-6 text-xs shrink-0"
           style={{ background: 'linear-gradient(135deg,#002855 0%,#003a7a 100%)', color: 'rgba(255,255,255,0.7)' }}>
        {[
          { label: 'Terbaik W1',       val: `${sortedW1[0].code} — ${pct(sortedW1[0].achW1)}`,                   ok: true  },
          { label: 'Terbaik YTD',      val: `${sortedYTD[0].code} — ${pct(sortedYTD[0].ytdAch)}`,               ok: true  },
          { label: 'Perlu Perhatian W1',  val: `${sortedW1.at(-1)!.code} — ${pct(sortedW1.at(-1)!.achW1)}`,      ok: false },
          { label: 'Perlu Perhatian YTD', val: `${sortedYTD.at(-1)!.code} — ${pct(sortedYTD.at(-1)!.ytdAch)}`, ok: false },
        ].map(({ label, val, ok }) => (
          <div key={label} className="text-center px-3 border-r border-white/10 last:border-r-0">
            <p className="text-white/50 mb-0.5">{label}</p>
            <p className="font-bold" style={{ color: ok ? '#86EFAC' : '#FCA5A5' }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Presentation ────────────────────────────────────────────────────────
const SLIDES = [
  { component: SlideCover,    label: 'Cover'       },
  { component: SlideTrend,    label: 'Trend & DoD' },
  { component: SlideNational, label: 'Nasional'    },
  { component: SlideW1,       label: 'Booking W1'  },
  { component: SlideYTD,      label: 'YTD'         },
  { component: SlideBD,       label: 'Baki Debet'  },
  { component: SlideRanking,  label: 'Ranking'     },
];

export default function Presentation() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= SLIDES.length) return;
    setCurrent(idx);
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goTo(current + 1);
      if (e.key === 'ArrowLeft')                   goTo(current - 1);
      if (e.key >= '1' && e.key <= '7')            goTo(Number(e.key) - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
    touchStartX.current = null;
  };

  const Slide = SLIDES[current].component;

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: '#0F172A', fontFamily: 'var(--font-geist-sans),system-ui,sans-serif' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide area */}
      <div className="absolute inset-0 bottom-12 md:bottom-14">
        <div key={current} style={{ width: '100%', height: '100%',
          animation: 'fadeSlide 0.28s ease forwards' }}>
          <Slide />
        </div>
      </div>

      {/* Nav bar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 md:h-14 flex items-center justify-between px-3 md:px-6"
           style={{ background: '#0F172A', borderTop: '1px solid #1E293B' }}>

        <button onClick={() => goTo(current - 1)} disabled={current === 0}
                className="flex items-center gap-1 md:gap-2 text-xs font-semibold px-2 md:px-3 py-1.5 rounded-lg disabled:opacity-30 transition-colors"
                style={{ color: '#94A3B8', background: current === 0 ? 'transparent' : '#1E293B' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto max-w-xs md:max-w-none px-1">
          {SLIDES.map((s, i) => (
            <button key={i} onClick={() => goTo(i)}
                    className="flex items-center gap-1 md:gap-1.5 transition-all shrink-0">
              <span className="rounded-full transition-all duration-300"
                    style={{
                      width:  i === current ? 20 : 7,
                      height: 7,
                      background: i === current ? '#E5451F' : '#334155',
                    }} />
              {i === current && (
                <span className="hidden md:inline text-xs font-semibold" style={{ color: '#E5451F' }}>
                  {s.label}
                </span>
              )}
            </button>
          ))}
        </div>

        <button onClick={() => goTo(current + 1)} disabled={current === SLIDES.length - 1}
                className="flex items-center gap-1 md:gap-2 text-xs font-semibold px-2 md:px-3 py-1.5 rounded-lg disabled:opacity-30 transition-colors"
                style={{ color: '#E5451F', background: current === SLIDES.length - 1 ? 'transparent' : '#1E293B' }}>
          <span className="hidden sm:inline">Next</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Counter */}
      <div className="absolute bottom-3.5 md:bottom-4 right-14 md:right-20 text-xs font-mono"
           style={{ color: '#334155' }}>
        {current + 1}/{SLIDES.length}
      </div>

      {/* Swipe hint (mobile, cover only) */}
      {current === 0 && (
        <div className="md:hidden absolute top-16 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full"
             style={{ background: 'rgba(255,255,255,0.08)', color: '#475569' }}>
          Swipe ← → untuk navigasi
        </div>
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
