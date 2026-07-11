"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CustomHeaderConfig {
  enabled?: boolean;
  logo?: string;
  logoLink?: string;
  backgroundColor?: string;
  textColor?: string;
  links?: Array<{
    text: string;
    href: string;
    external?: boolean;
  }>;
  cta?: {
    text: string;
    href: string;
    style: 'primary' | 'secondary';
  };
}

interface CustomHeaderProps {
  config: CustomHeaderConfig;
}

export function CustomHeader({ config }: CustomHeaderProps) {
  const {
    logo,
    logoLink = '/',
    backgroundColor = '#000000',
    textColor = '#ffffff',
    links = [],
    cta
  } = config;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor,
        borderColor: `${textColor}10`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href={logoLink} className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span
                className="text-xl font-black tracking-tight"
                style={{ color: textColor }}
              >
                LOGO
              </span>
            )}
          </Link>

          {links.length > 0 && (
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link, index) => (
                link.external ? (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium transition-colors hover:opacity-70"
                    style={{ color: textColor }}
                  >
                    {link.text}
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-sm font-medium transition-colors hover:opacity-70"
                    style={{ color: textColor }}
                  >
                    {link.text}
                  </Link>
                )
              ))}
            </nav>
          )}

          {cta && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href={cta.href}
                className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: cta.style === 'primary' ? '#a89a00' : 'transparent',
                  color: cta.style === 'primary' ? '#fff' : textColor,
                  border: cta.style === 'secondary' ? `1px solid ${textColor}30` : 'none'
                }}
              >
                {cta.text}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
