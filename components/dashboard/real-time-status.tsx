"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Volume2, VolumeX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RealTimeStatusProps {
  lastUpdate: Date
  isConnected: boolean
  soundEnabled: boolean
  onToggleSound: () => void
}

export function RealTimeStatus({ lastUpdate, isConnected, soundEnabled, onToggleSound }: RealTimeStatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second for relative time display
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-4 p-3 bg-white border rounded-lg shadow-sm">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <Badge variant="outline" className="text-green-700 border-green-200">
              Live
            </Badge>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-600" />
            <Badge variant="outline" className="text-red-700 border-red-200">
              Offline
            </Badge>
          </>
        )}
      </div>

      {/* Last Update */}
      <div className="text-sm text-slate-600">Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}</div>

      {/* Sound Toggle */}
      <Button variant="ghost" size="sm" onClick={onToggleSound} className="ml-auto">
        {soundEnabled ? (
          <>
            <Volume2 className="h-4 w-4 mr-1" />
            Sound On
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4 mr-1" />
            Sound Off
          </>
        )}
      </Button>
    </div>
  )
}
