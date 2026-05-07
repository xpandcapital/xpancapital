"use client";

import { POSManager } from "@/components/superadmin/pos";
import { motion } from "framer-motion";

export default function POSPage() {
    return (
        <div className="min-h-screen overflow-y-auto lg:h-screen lg:overflow-hidden bg-black pt-2 pb-2 flex flex-col">
            <POSManager />
        </div>
    );
}
