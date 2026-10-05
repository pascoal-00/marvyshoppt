import { Link } from "@tanstack/react-router";

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <Link to="/" aria-label="M-SHOP — página inicial" className="inline-flex items-center">
      <img
        src="/logo.png"
        alt="M-SHOP"
        className={`${className} w-auto object-contain`}
        style={{ mixBlendMode: "screen" }}
      />
    </Link>
  );
}
