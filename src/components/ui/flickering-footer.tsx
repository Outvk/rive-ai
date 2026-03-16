"use client";

import { ChevronRightIcon } from "@radix-ui/react-icons";
import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
// We use framer-motion here instead of motion/react because the project uses framer-motion based on package.json
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Info, Mail, BookOpen, Bookmark, Image as ImageIcon, Type, Mic, Code, CreditCard, LifeBuoy, Shield, FileText } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRGBA = (
  cssColor: React.CSSProperties["color"],
  fallback: string = "rgba(180, 180, 180)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;

  try {
    if (typeof cssColor === "string" && cssColor.startsWith("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return Color.formatRGBA(Color.parse(computedColor));
    }
    return Color.formatRGBA(Color.parse(cssColor));
  } catch (e) {
    console.error("Color parsing failed:", e);
    return fallback;
  }
};

export const colorWithOpacity = (color: string, opacity: number): string => {
  if (!color.startsWith("rgb")) return color;
  return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

export const Icons = {
  logo: ({ className }: { className?: string }) => (
    <svg
      width="42"
      height="24"
      viewBox="0 0 42 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 fill-[var(--secondary)]", className)}
    >
      <g clipPath="url(#clip0_322_9172)">
        <path
          d="M22.3546 0.96832C22.9097 0.390834 23.6636 0.0664062 24.4487 0.0664062C27.9806 0.0664062 31.3091 0.066408 34.587 0.0664146C41.1797 0.0664284 44.481 8.35854 39.8193 13.2082L29.6649 23.7718C29.1987 24.2568 28.4016 23.9133 28.4016 23.2274V13.9234L29.5751 12.7025C30.5075 11.7326 29.8472 10.0742 28.5286 10.0742H13.6016L22.3546 0.96832Z"
          fill="current"
        />
        <path
          d="M19.6469 23.0305C19.0919 23.608 18.338 23.9324 17.5529 23.9324C14.021 23.9324 10.6925 23.9324 7.41462 23.9324C0.821896 23.9324 -2.47942 15.6403 2.18232 10.7906L12.3367 0.227022C12.8029 -0.257945 13.6 0.0855283 13.6 0.771372L13.6 10.0754L12.4265 11.2963C11.4941 12.2662 12.1544 13.9246 13.473 13.9246L28.4001 13.9246L19.6469 23.0305Z"
          fill="current"
        />
      </g>
      <defs>
        <clipPath id="clip0_322_9172">
          <rect width="42" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
  soc2: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" className={cn("size-4", className)}>
      <g>
        <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="#2d2d3a" />
        <g>
          <rect x="6.15784" y="4.021" width="33.6842" height="33.6842" rx="16.8421" fill="#1e1e24" />
          <path d="M15.0475 29.6233C13.7506 29.6233 12.9548 28.8938 12.8738 27.8033L13.8464 27.7443..." fill="#a1a1aa" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="bold">SOC 2</text>
        </g>
      </g>
    </svg>
  ),
  soc2Dark: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" className={cn("size-4", className)}>
      <g>
        <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="#2d2d3a" />
        <g>
          <rect x="6.1579" y="4.021" width="33.6842" height="33.6842" rx="16.8421" fill="#1e1e24" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="bold">SOC 2</text>
        </g>
      </g>
    </svg>
  ),
  hipaa: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" className={className}>
      <g>
        <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="#2d2d3a" />
        <g>
          <rect x="6.15784" y="4.021" width="33.6842" height="33.6842" rx="16.8421" fill="#1e1e24" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="bold">HIPAA</text>
        </g>
      </g>
    </svg>
  ),
  hipaaDark: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" className={className}>
      <g>
        <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="#2d2d3a" />
        <g>
          <rect x="6.15784" y="4.021" width="33.6842" height="33.6842" rx="16.8421" fill="#1e1e24" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="bold">HIPAA</text>
        </g>
      </g>
    </svg>
  ),
  gdpr: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" className={cn("size-4", className)}>
      <g>
        <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="#2d2d3a" />
        <g>
          <rect x="6.15784" y="4.021" width="33.6842" height="33.6842" rx="16.8421" fill="#1e1e24" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="bold">GDPR</text>
        </g>
      </g>
    </svg>
  ),
  gdprDark: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" className={cn("size-4", className)}>
      <g>
        <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="#2d2d3a" />
        <g>
          <rect x="6.15784" y="4.021" width="33.6842" height="33.6842" rx="16.8421" fill="#1e1e24" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="bold">GDPR</text>
        </g>
      </g>
    </svg>
  ),
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 3,
  gridGap = 3,
  flickerChance = 0.2,
  color = "#B4B4B4",
  width,
  height,
  className,
  maxOpacity = 0.15,
  text = "",
  fontSize = 140,
  fontWeight = 600,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    return getRGBA(color);
  }, [color]);

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!maskCtx) return;

      if (text) {
        maskCtx.save();
        maskCtx.scale(dpr, dpr);
        maskCtx.fillStyle = "white";
        maskCtx.font = `${fontWeight} ${fontSize}px "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        maskCtx.textAlign = "center";
        maskCtx.textBaseline = "middle";
        maskCtx.fillText(text, width / (2 * dpr), height / (2 * dpr));
        maskCtx.restore();
      }

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * (squareSize + gridGap) * dpr;
          const y = j * (squareSize + gridGap) * dpr;
          const squareWidth = squareSize * dpr;
          const squareHeight = squareSize * dpr;

          const maskData = maskCtx.getImageData(
            x,
            y,
            squareWidth,
            squareHeight,
          ).data;
          const hasText = maskData.some(
            (value, index) => index % 4 === 0 && value > 0,
          );

          const opacity = squares[i * rows + j];
          const finalOpacity = hasText
            ? Math.min(1, opacity * 3 + 0.4)
            : opacity;

          ctx.fillStyle = colorWithOpacity(memoizedColor, finalOpacity);
          ctx.fillRect(x, y, squareWidth, squareHeight);
        }
      }
    },
    [memoizedColor, squareSize, gridGap, text, fontSize, fontWeight],
  );

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.ceil(width / (squareSize + gridGap));
      const rows = Math.ceil(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div
      ref={containerRef}
      className={cn(`h-full w-full ${className}`)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function checkQuery() {
      const result = window.matchMedia(query);
      setValue(result.matches);
    }
    checkQuery();
    window.addEventListener("resize", checkQuery);

    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", checkQuery);
    return () => {
      window.removeEventListener("resize", checkQuery);
      mediaQuery.removeEventListener("change", checkQuery);
    };
  }, [query]);

  return value;
}

export const siteConfig = {
  hero: {
    description: "Contact us at support@rive.ai for any inquiries.",
  },
  footerLinks: [
    {
      title: "Company",
      links: [
        { id: 1, title: "About", url: "/dashboard", icon: Info },
        { id: 2, title: "Contact", url: "/dashboard", icon: Mail },
        { id: 3, title: "Blog", url: "/dashboard", icon: BookOpen },
        { id: 4, title: "Story", url: "/dashboard", icon: Bookmark },
      ],
    },
    {
      title: "Products",
      links: [
        { id: 5, title: "Image Generation", url: "/dashboard/image-prompt", icon: ImageIcon },
        { id: 6, title: "Text Generation", url: "/dashboard/text", icon: Type },
        { id: 7, title: "Voice Studio", url: "/dashboard/text-to-speech", icon: Mic },
        { id: 8, title: "API", url: "/dashboard/docs", icon: Code },
      ],
    },
    {
      title: "Resources",
      links: [
        { id: 9, title: "Pricing", url: "/dashboard/pricing", icon: CreditCard },
        { id: 10, title: "Help Center", url: "/dashboard", icon: LifeBuoy },
        { id: 11, title: "Privacy", url: "/dashboard/privacy", icon: Shield },
        { id: 12, title: "Terms", url: "/dashboard/terms", icon: FileText },
      ],
    },
  ],
};

export const FlickeringFooter = () => {
  const tablet = useMediaQuery("(max-width: 1024px)");

  return (
    <footer id="footer" className="w-full pb-0 bg-[#030303] text-zinc-200 border-t border-white/5 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between p-5 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-start justify-start gap-y-5 max-w-xs mx-0">
      
          <a 
            href="https://mail.google.com/mail/u/0/#inbox?compose=new"
            className="tracking-tight text-zinc-400 font-medium hover:text-[#7405FF] transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            chouainkhezrouni0007@gmail.com
          </a>
      
        </div>
        <div className="pt-10 md:pt-0 md:w-1/2">
          <div className="flex flex-col items-start justify-start md:flex-row md:items-start md:justify-between gap-y-10 lg:pl-10">
            {siteConfig.footerLinks.map((column, columnIndex) => (
              <ul key={columnIndex} className="flex flex-col gap-y-3">
                <li className="mb-2 text-sm font-semibold text-white">
                  {column.title}
                </li>
                {column.links.map((link) => (
                  <li
                    key={link.id}
                    className="group inline-flex cursor-pointer items-center justify-start gap-2 text-[15px]/snug text-zinc-400 hover:text-white transition-colors"
                  >
                    <link.icon className="w-4 h-4 text-zinc-500 group-hover:text-[#7405FF] transition-colors" />
                    <Link href={link.url}>{link.title}</Link>
                    <div className="flex size-4 items-center justify-center border border-white/10 rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100 group-hover:border-violet-500">
                      <ChevronRightIcon className="h-3 w-3 text-violet-400" />
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-48 md:h-64 relative mt-12 z-0 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent z-10 from-5%" />
        <div className="absolute inset-0 mx-6">
          <FlickeringGrid
            text={tablet ? "Rive AI" : "-MADE BY RIVER-"}
            fontSize={tablet ? 80 : 120}
            className="h-full w-full"
            squareSize={3}
            gridGap={tablet ? 2 : 3}
            color="#8725ffff"
            maxOpacity={0.4}
            flickerChance={0.2}
          />
        </div>
      </div>
    </footer>
  );
};
