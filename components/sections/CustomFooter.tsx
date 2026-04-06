"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube, Music } from "lucide-react";

interface CustomFooterConfig {
  enabled?: boolean;
  logo?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
  socials?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  copyright?: string;
}

interface CustomFooterProps {
  config: CustomFooterConfig;
}

export function CustomFooter({ config }: CustomFooterProps) {
  const {
    logo,
    description = '',
    backgroundColor = '#000000',
    textColor = '#ffffff',
    links = [],
    socials = {},
    copyright = '© 2024. Todos los derechos reservados.'
  } = config;

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: Music,
  };

  return (
    <footer
      className="border-t"
      style={{
        backgroundColor,
        borderColor: `${textColor}10`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto object-contain mb-4"
              />
            ) : (
              <span
                className="text-xl font-black tracking-tight"
                style={{ color: textColor }}
              >
                LOGO
              </span>
            )}
            {description && (
              <p
                className="mt-4 text-sm max-w-md"
                style={{ color: `${textColor}80` }}
              >
                {description}
              </p>
            )}
          </div>

          {links.length > 0 && (
            <div className="md:col-span-2">
              <h4
                className="font-bold text-sm uppercase tracking-wider mb-4"
                style={{ color: textColor }}
              >
                Enlaces
              </h4>
              <nav className="grid grid-cols-2 gap-2">
                {links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-70"
                    style={{ color: `${textColor}80` }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>

        {Object.values(socials).some(Boolean) && (
          <div className="flex items-center gap-4 mt-8 pt-8 border-t" style={{ borderColor: `${textColor}10` }}>
            {Object.entries(socials).map(([key, url]) => {
              if (!url) return null;
              const Icon = socialIcons[key as keyof typeof socialIcons];
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${textColor}10`,
                    color: textColor
                  }}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}

        <div
          className="mt-8 pt-8 border-t text-center text-sm"
          style={{
            borderColor: `${textColor}10`,
            color: `${textColor}60`
          }}
        >
          {copyright}
        </div>
      </div>
    </footer>
  );
}