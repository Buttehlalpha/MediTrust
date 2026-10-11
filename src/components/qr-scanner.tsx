import { useEffect, useRef, useState } from "react";
import { CameraOff, Loader2 } from "lucide-react";

interface Props {
  active: boolean;
  onResult: (text: string) => void;
}

export function QrScanner({ active, onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const handled = useRef(false);

  useEffect(() => {
    if (!active) return;
    handled.current = false;
    setError(null);
    setStarting(true);

    let controls: { stop: () => void } | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current ?? undefined,
          (result) => {
            if (result && !handled.current) {
              handled.current = true;
              onResult(result.getText());
            }
          },
        );
        if (cancelled) controls.stop();
        else setStarting(false);
      } catch {
        if (!cancelled) {
          setError("Camera unavailable. Grant camera permission or enter the code manually below.");
          setStarting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [active, onResult]);

  if (!active) return null;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-ink">
      <video ref={videoRef} className="size-full object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-8 rounded-2xl border-2 border-primary/70" />
        <div className="animate-scanline absolute inset-x-8 h-0.5 bg-primary shadow-glow" />
      </div>
      {(starting || error) && (
        <div className="absolute inset-0 grid place-items-center bg-ink/80 px-8 text-center text-sm text-ink-foreground">
          {error ? (
            <span className="flex flex-col items-center gap-3">
              <CameraOff className="size-6 text-destructive" />
              {error}
            </span>
          ) : (
            <span className="flex flex-col items-center gap-3">
              <Loader2 className="size-6 animate-spin text-primary" />
              Starting camera…
            </span>
          )}
        </div>
      )}
    </div>
  );
}
