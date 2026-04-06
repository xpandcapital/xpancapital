'use client';

import dynamic from 'next/dynamic';

const MailsEditor = dynamic(() => import('./Mails'), { ssr: false });

export default function MailsPage() {
  return (
    <div className="min-h-screen">
      <MailsEditor />
    </div>
  );
}