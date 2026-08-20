import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.asset.json";

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <Link to="/" aria-label="M-SHOP — página inicial" className="inline-flex items-center">
      <img
        src={logo.url}
        alt="M-SHOP"
        className={`${className} w-auto object-contain`}
        style={{ mixBlendMode: "screen" }}
      />
    </Link>
  );
}
