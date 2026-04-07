import { Suspense } from 'react';
import CreateBlogPostContent from './CreateBlogPostContent';

export const dynamic = 'force-dynamic';

export default function CreateBlogPost() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <CreateBlogPostContent />
        </Suspense>
    );
}