"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

const playbackQueries = ["(min-width: 1024px)", "(prefers-reduced-motion: reduce)"];
function subscribePlayback(callback: () => void) {
  const queries = playbackQueries.map(query => window.matchMedia(query));
  queries.forEach(query => query.addEventListener("change", callback));
  return () => queries.forEach(query => query.removeEventListener("change", callback));
}
function canAutoplay() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia(playbackQueries[0]).matches &&
    !window.matchMedia(playbackQueries[1]).matches && !connection?.saveData;
}

export function LoginShowcase() {
  const autoplay = useSyncExternalStore(subscribePlayback, canAutoplay, () => false);
  const video = useRef<HTMLVideoElement>(null);
  const [manualStart, setManualStart] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const enabled = !unavailable && (autoplay || manualStart);

  async function togglePlayback() {
    if (playing) {
      video.current?.pause();
      setPaused(true);
    } else {
      setManualStart(true);
      setPaused(false);
      try { await video.current?.play(); } catch { setPlaying(false); }
    }
  }

  return (
    <figure className="relative overflow-hidden rounded-xl border border-blue-200/20 bg-[#0c1f3d]">
      {enabled ? (
        <video
          ref={video}
          className="aspect-[8/5] w-full object-contain"
          poster="/login/cover-v2.png"
          src="/login/presentation-v2.mp4"
          autoPlay={!paused}
          muted loop playsInline preload="none"
          aria-label="Apresentação do Assistente IA, consulta ao CNJ e agenda do sistema"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => { setUnavailable(true); setPlaying(false); }}
        />
      ) : (
        <Image src="/login/cover-v2.png" width={1280} height={800}
          alt="Apresentação da interface do sistema Davino Neves Advocacia"
          className="aspect-[8/5] w-full object-contain" priority />
      )}
      <figcaption className="flex items-center justify-between gap-3 border-t border-blue-200/15 px-4 py-3">
        <p className="text-xs text-blue-100">Conheça seu espaço de trabalho</p>
        {!unavailable && <button type="button" onClick={togglePlayback}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200 active:bg-white/15"
          aria-label={playing ? "Pausar apresentação" : "Reproduzir apresentação"}>
          {playing ? <Pause aria-hidden className="h-3.5 w-3.5" /> : <Play aria-hidden className="h-3.5 w-3.5" />}
          {playing ? "Pausar" : "Reproduzir"}
        </button>}
      </figcaption>
    </figure>
  );
}
