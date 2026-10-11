import { useEffect, useState } from "react";

interface Props {
  value: string;
  size?: number;
  className?: string;
}

/** Renders a QR code for a drug code as an inline data URL image. */
export function QrBadge({ value, size = 160, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#0d211c", light: "#ffffff" },
      });
      if (!cancelled) setSrc(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!src) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt={`QR code for ${value}`}
      width={size}
      height={size}
      loading="lazy"
      className={className}
    />
  );
}
