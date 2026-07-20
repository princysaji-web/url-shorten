"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

import { CopyButton } from "@/components/links/copy-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function QrCodeCard({
  shortUrl,
  shortCode,
}: {
  shortUrl: string;
  shortCode: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      QRCode.toDataURL(shortUrl, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: "M",
      }),
      QRCode.toString(shortUrl, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "M",
        width: 280,
      }),
    ])
      .then(([pngUrl, svg]) => {
        if (!cancelled) {
          setDataUrl(pngUrl);
          setSvgMarkup(svg);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
          setSvgMarkup(null);
          toast.error("Failed to generate QR code");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shortUrl]);

  function downloadPng() {
    if (!dataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `qr-${shortCode}.png`;
    anchor.click();
    toast.success("PNG downloaded");
  }

  function downloadSvg() {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `qr-${shortCode}.svg`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    toast.success("SVG downloaded");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
        <CardDescription>
          Encodes the short URL, not the original destination.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center rounded-lg border bg-white p-4">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`QR code for ${shortUrl}`}
              width={280}
              height={280}
            />
          ) : (
            <div className="flex h-[280px] w-[280px] items-center justify-center text-sm text-muted-foreground">
              Generating QR…
            </div>
          )}
        </div>

        <p className="break-all text-center text-sm text-muted-foreground">
          {shortUrl}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <CopyButton value={shortUrl} label="Copy Short URL" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadPng}
            disabled={!dataUrl}
          >
            <Download className="size-4" />
            Download PNG
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadSvg}
            disabled={!svgMarkup}
          >
            <Download className="size-4" />
            Download SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            <ExternalLink className="size-4" />
            Open Short URL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
