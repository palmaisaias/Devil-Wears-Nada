import React, { useEffect, useRef, useState } from "react";

// Minimal, stylish VIDEO player
// - Paste an external MP4/WebM URL and hit Load
// - Custom controls (play/pause, seek, time, volume, speed, fullscreen, PiP)
// - Saves last URL, volume, and speed
// - No external deps; Tailwind only
// - Dispatches "start-movie" on play to pause background music

export default function Movie() {
  const videoRef = useRef(null);
  const shellRef = useRef(null);

  const [tempUrl, setTempUrl] = useState(() => localStorage.getItem("mv:videoSrc") || "");
  const [src, setSrc] = useState(() => localStorage.getItem("mv:videoSrc") || "");
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(() => {
    const v = Number(localStorage.getItem("mv:videoVol"));
    return Number.isFinite(v) ? clamp(v, 0, 1) : 0.9;
  });
  const [rate, setRate] = useState(() => {
    const r = Number(localStorage.getItem("mv:videoRate"));
    return [0.5, 0.75, 1, 1.25, 1.5, 2].includes(r) ? r : 1;
  });
  const [error, setError] = useState("");

  // Persist prefs
  useEffect(() => localStorage.setItem("mv:videoVol", String(volume)), [volume]);
  useEffect(() => localStorage.setItem("mv:videoRate", String(rate)), [rate]);
  useEffect(() => localStorage.setItem("mv:videoSrc", src), [src]);

  // Apply volume/rate to element
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    v.volume = volume; v.playbackRate = rate;
  }, [volume, rate]);

  function loadSource() {
    if (!tempUrl) return;
    setError("");
    setSrc(tempUrl.trim());
    setPlaying(false);
    setCurrent(0);
    // reset element
    const v = videoRef.current; if (v) { v.pause(); v.currentTime = 0; }
  }

  async function togglePlay() {
    const v = videoRef.current; if (!v) return;
    if (v.paused) {
      try { 
        await v.play(); 
        setPlaying(true); 
        // tell MusicController to stop background audio
        window.dispatchEvent(new Event("start-movie"));
      } catch (_) {}
    } else { 
      v.pause(); 
      setPlaying(false); 
    }
  }

  function onLoadedMeta() {
    const v = videoRef.current; if (!v) return;
    setDuration(v.duration || 0);
  }

  function onTimeUpdate() {
    const v = videoRef.current; if (!v) return;
    setCurrent(v.currentTime || 0);
  }

  function seekPct(p) {
    const v = videoRef.current; if (!v || !duration) return;
    const t = clamp((p / 100) * duration, 0, duration);
    v.currentTime = t; setCurrent(t);
  }

  function nudge(sec) {
    const v = videoRef.current; if (!v) return;
    v.currentTime = clamp(v.currentTime + sec, 0, duration || v.duration || 0);
  }

  function toggleMute() {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted;
  }

  async function toggleFS() {
    const el = shellRef.current; if (!el) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el.requestFullscreen().catch(() => {});
  }

  async function togglePiP() {
    const v = videoRef.current; if (!v || !document || !("pictureInPictureEnabled" in document)) return;
    try {
      // @ts-ignore
      if (document.pictureInPictureElement) { /* @ts-ignore */ await document.exitPictureInPicture(); }
      else if (v.requestPictureInPicture) { await v.requestPictureInPicture(); }
    } catch {}
  }

  function onError() {
    setError("Couldn’t load that video. Check the URL or CORS.");
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.key === "ArrowRight") nudge(5);
      else if (e.key === "ArrowLeft") nudge(-5);
      else if (e.key === "ArrowUp") setVolume((v) => clamp(v + 0.05, 0, 1));
      else if (e.key === "ArrowDown") setVolume((v) => clamp(v - 0.05, 0, 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [duration]);

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <section className="section">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Movie Player</h2>
            <p className="text-slate-300 mt-1">Click PLAY MOVIE</p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <input
              type="url"
              inputMode="url"
              placeholder="https://gentle-giants.sfo3.cdn.digitaloceanspaces.com/prada.mp4"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadSource()}
              className="flex-1 sm:w-[28rem] rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 px-3 py-2 focus:outline-none"
            />
            <button onClick={loadSource} className="px-3 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Load</button>
          </div>
        </header>

        {/* Player shell */}
        <div ref={shellRef} className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/30 p-3 sm:p-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            {src ? (
              <video
                ref={videoRef}
                src={src}
                className="h-full w-full"
                playsInline
                onLoadedMetadata={onLoadedMeta}
                onTimeUpdate={onTimeUpdate}
                onError={onError}
                onPlay={() => { 
                  setPlaying(true); 
                  // signal background music to stop immediately
                  window.dispatchEvent(new Event("start-movie")); 
                }}
                onPause={() => setPlaying(false)}
                controls={false}
                preload="metadata"
                crossOrigin="anonymous"
              />
            ) : (
              <EmptyState onUseSample={() => { setTempUrl(SAMPLE_URL); setSrc(SAMPLE_URL); }} />
            )}

            {/* Big center play button overlay */}
            {src && !playing && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-white/10 backdrop-blur border border-white/20 grid place-items-center hover:bg-white/20"
                aria-label="Play"
                title="Play"
              >
                <PlayIcon className="h-8 w-8 text-white" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="mt-3 grid gap-3">
            {/* Seek */}
            <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
              <Time value={current} />
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={pct}
                onChange={(e) => seekPct(Number(e.target.value))}
                className="w-full accent-sky-500"
                aria-label="Seek"
              />
              <Time value={duration} />
            </div>

            {/* Transport */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconBtn onClick={() => nudge(-10)} title="Back 10s"><BackIcon /></IconBtn>
                <IconBtn onClick={togglePlay} big title={playing ? "Pause" : "Play"}>
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </IconBtn>
                <IconBtn onClick={() => nudge(10)} title="Forward 10s"><FwdIcon /></IconBtn>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-slate-200 text-sm">
                  <span className="hidden sm:inline">Speed</span>
                  <select
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="rounded-lg bg-white/10 border border-white/20 text-white px-2 py-1 text-sm focus:outline-none"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((o) => (
                      <option key={o} value={o} className="text-black">{o}x</option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-slate-200 text-sm">
                  <VolIcon className="h-5 w-5" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-28 accent-sky-500"
                    aria-label="Volume"
                  />
                  <button onClick={toggleMute} className="text-xs text-slate-300 underline hover:text-white">mute</button>
                </label>

                <IconBtn onClick={togglePiP} title="Picture in Picture"><PiPIcon /></IconBtn>
                <IconBtn onClick={toggleFS} title="Fullscreen"><FSIcon /></IconBtn>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-300">{error}</p>
            )}
          </div>
        </div>

        {/* Helper bar */}
        <div className="mt-3 text-xs text-slate-400">
          <button
            className="underline hover:text-slate-200"
            onClick={() => {
              setTempUrl(SAMPLE_URL);
              setSrc(SAMPLE_URL);
            }}
          >PLAY MOVIE</button>
          <span className="mx-2">•</span>
          <span>Space = play/pause, ←/→ = ±5s, ↑/↓ = volume</span>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Empty state ----------------------------- */
function EmptyState({ onUseSample }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="text-center text-slate-300">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full border border-white/20 grid place-items-center bg-white/5">
          <PlayIcon className="h-7 w-7 text-white/80" />
        </div>
        <p className="max-w-sm mx-auto">
          ⬇ <span className="font-semibold text-white">Load</span> — PLAY MOVIE.
        </p>
        <button
          onClick={onUseSample}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15"
        >
          PLAY HERE!
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Helpers ----------------------------- */
const SAMPLE_URL = "https://gentle-giants.sfo3.cdn.digitaloceanspaces.com/prada.mp4";

function Time({ value }) {
  return <span className="tabular-nums text-sm text-slate-200">{fmtTime(value)}</span>;
}
function IconBtn({ children, onClick, title, big }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cx(
        "inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white",
        big ? "h-12 w-12" : "h-10 w-10"
      )}
    >
      <span className={cx("h-5 w-5", big && "scale-110")}>{children}</span>
    </button>
  );
}
function cx(...c) { return c.filter(Boolean).join(" "); }
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function fmtTime(t) {
  if (!Number.isFinite(t) || t <= 0) return "0:00";
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  const m = Math.floor(t / 60);
  return `${m}:${s}`;
}

/* ------------------------------ Icons ------------------------------ */
function PlayIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cx("h-full w-full", className)}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cx("h-full w-full", className)}>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M5 12l9-6v12l-9-6z" />
    </svg>
  );
}
function FwdIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M10 6l9 6-9 6V6z" />
    </svg>
  );
}
function VolIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cx("h-full w-full", className)}>
      <path d="M3 10v4h4l5 4V6L7 10H3z" />
      <path d="M16 7a5 5 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function PiPIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M3 5h18v14H3z" opacity=".4" />
      <path d="M13 9h8v6h-8z" />
    </svg>
  );
}
function FSIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M3 9V3h6v2H5v4H3zm16-4h-4V3h6v6h-2V5zM5 15h4v2H3v-6h2v4zm14 0v-4h2v6h-6v-2h4z" />
    </svg>
  );
}
