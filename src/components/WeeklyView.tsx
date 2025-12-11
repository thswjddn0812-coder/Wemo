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

interface WeeklyViewProps {
  selectedDay: Date
  onSelectDay: (day: Date) => void
}

export default function WeeklyView({ selectedDay, onSelectDay }: WeeklyViewProps) {
  // Calculate the start and end of the week for the selected day
  const start = startOfWeek(selectedDay)
  const end = endOfWeek(selectedDay)

  const days = eachDayOfInterval({ start, end })

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {format(selectedDay, "yyyy년 MMMM d일 EEEE", { locale: ko })}
      </h2>
      
      <div className="grid grid-cols-7 gap-4 w-full">
        {days.map((day) => (
          <div key={day.toString()} className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {format(day, "E", { locale: ko })}
            </span>
            <button
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold transition-all",
                isSameDay(day, selectedDay)
                  ? "bg-blue-600 text-white shadow-lg scale-110"
                  : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-700",
                isToday(day) && !isSameDay(day, selectedDay) && "text-blue-600 border border-blue-600"
              )}
            >
              {format(day, "d")}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
