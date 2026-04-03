import { Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-deep-navy text-parchment/80 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Batch Info */}
          <div>
            <h3 className="font-serif text-xl text-parchment mb-3">Batch &apos;26</h3>
            <p className="text-sm text-parchment/60 leading-relaxed">
              Bachelor of Engineering in Artificial Intelligence & Data Science
            </p>
            <p className="text-sm text-parchment/60 mt-1">
              Vivekanand Education Society&apos;s Institute of Technology (VESIT), Mumbai
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-parchment mb-3">Quick Links</h4>
            <div className="grid grid-cols-2 gap-1">
              {[
                { href: "/timeline", label: "Timeline" },
                { href: "/batchmates", label: "Batchmates" },
                { href: "/gallery", label: "Gallery" },
                { href: "/yearbook", label: "Yearbook" },
                { href: "/messages", label: "Messages" },
                { href: "/hall-of-fame", label: "Hall of Fame" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-parchment/50 hover:text-amber-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="font-serif text-lg text-parchment mb-3">Forever Grateful</h4>
              <p className="text-sm text-parchment/60 italic font-handwriting text-lg">
                &ldquo;Four years. One family. Forever.&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-parchment/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-parchment/40 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-dusty-pink fill-dusty-pink" /> by Batch &apos;26
          </p>
          <p className="text-xs text-parchment/40">
            © VESIT AIDS &apos;26. All memories preserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
