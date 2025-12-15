import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getMemoryCounts } from "@/lib/api"

interface WeeklyViewProps {
  selectedDay: Date
  onSelectDay: (day: Date) => void
}

export default function WeeklyView({ selectedDay, onSelectDay }: WeeklyViewProps) {
  const [counts, setCounts] = React.useState<Record<string, number>>({})

  // Calculate the start and end of the week for the selected day
  const start = startOfWeek(selectedDay)
  const end = endOfWeek(selectedDay)

  const days = eachDayOfInterval({ start, end })

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch for the month of the selected day
        // Ideally we might want to fetch for both months if the week spans two months, 
        // but for simplicity we fetch for the selected day's month for now.
        // A robust solution would check unique months in `days`.
        const monthStr = format(selectedDay, "yyyy-MM")
        const data = await getMemoryCounts(monthStr)
        setCounts(prev => ({ ...prev, ...data }))
        
        // If week spans two months, fetch the other one too
        const lastDayOfWeek = days[days.length - 1]
        const lastMonthStr = format(lastDayOfWeek, "yyyy-MM")
        if (monthStr !== lastMonthStr) {
           const data2 = await getMemoryCounts(lastMonthStr)
           setCounts(prev => ({ ...prev, ...data2 }))
        }
      } catch (error) {
        console.error("Failed to fetch counts", error)
      }
    }
    fetchCounts()
  }, [selectedDay]) // Re-run when selected day (and potentially week) changes

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {format(selectedDay, "yyyy년 MMMM d일 EEEE", { locale: ko })}
      </h2>
      
      <div className="flex justify-between w-full px-2 md:px-0 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const count = counts[dateStr] || 0
          
          return (
            <div key={day.toString()} className="flex flex-col items-center gap-3 relative">
              <span className="text-xs md:text-sm font-medium text-gray-500">
                {format(day, "E", { locale: ko })}
              </span>
              <button
                onClick={() => onSelectDay(day)}
                className={cn(
                  "flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl text-base md:text-lg font-semibold transition-all relative",
                  isSameDay(day, selectedDay)
                    ? "bg-blue-600 text-white shadow-lg scale-110"
                    : "bg-white text-gray-900 hover:bg-gray-100",
                  isToday(day) && !isSameDay(day, selectedDay) && "text-blue-600 border border-blue-600"
                )}
              >
                {format(day, "d")}
                {count > 0 && (
                   <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
                     {count > 9 ? '9+' : count}
                   </span>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
