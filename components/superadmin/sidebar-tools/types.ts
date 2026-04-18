"use client";

export interface ToolDef {
    id: string;
    name: string;
    description: string;
    cat: string;
    icon: any;
    isIA?: boolean;
    help?: string;
    examples?: {
        simple: string;
        advanced: string;
    };
}

export interface DownloadItem {
    id: string
    url: string
    title: string
    status: 'pending' | 'downloading' | 'done' | 'error'
    progress: number
    error?: string
    thumbnail?: string
    format?: string
    size?: string
    downloadUrl?: string
    isDirectDownload?: boolean
    downloadLinks?: { label: string; url: string; quality: string }[]
}