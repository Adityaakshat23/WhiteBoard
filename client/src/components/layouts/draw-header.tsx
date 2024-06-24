"use client"

import React from 'react'
import { ToolSettings } from '@/components/tools/tool-settings'
import AipredictButton from '../tools/Aipredict'
import ClearCanvasButton from '@/components/tools/clear-canvas'
import TakeScreenShotButton from '@/components/tools/take-screenshot'
import { LiveCollab } from '../tools/live-collab'
import { usePathname } from 'next/navigation'

export default function DrawBoardHeader() {
    const pathname = usePathname();

    return (
        <div className="absolute top-5 w-full md:px-12 px-4">
            <div className="flex justify-between items-center">
                <div className="items-center flex gap-3">
                    <ClearCanvasButton />
                    <TakeScreenShotButton />
                    <LiveCollab />
                    <ToolSettings />
                    <AipredictButton />
                </div>
            </div>
        </div>
    );
}
