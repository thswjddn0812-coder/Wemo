import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getMemoryCounts } from "@/lib/api"

interface CalendarProps {
  selectedDay: Date
  onSelectDay: (day: Date) => void
}

export default function Calendar({ selectedDay, onSelectDay }: CalendarProps) {
  let today = startOfToday()
  let [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"))
  let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const [counts, setCounts] = React.useState<Record<string, number>>({})

  // Sync current month when selectedDay changes (optional, but good UX)
  React.useEffect(() => {
    setCurrentMonth(format(selectedDay, "MMM-yyyy"))
  }, [selectedDay])

  // Fetch counts when currentMonth changes
  React.useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return; // Skip if not logged in

      try {
        const monthStr = format(firstDayCurrentMonth, "yyyy-MM");
        const data = await getMemoryCounts(monthStr);
        setCounts(data);
      } catch (error) {
        console.error("Failed to load counts", error);
      }
    };
    fetchCounts();
  }, [currentMonth, selectedDay]); // accessing firstDayCurrentMonth derived from currentMonth

  let days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  return (
    <div className="w-full max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6">
      <div className="md:grid md:grid-cols-1 md:divide-x md:divide-gray-200">
        <div className="md:pr-14">
          <div className="flex items-center">
            <h2 className="flex-auto font-semibold text-gray-900">
              {format(firstDayCurrentMonth, "yyyy년 MMMM", { locale: ko })}
            </h2>
            <button
              type="button"
              onClick={previousMonth}
              className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Next month</span>
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
            <div>일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div>토</div>
          </div>
          <div className="grid grid-cols-7 mt-2 text-sm">
            {days.map((day, dayIdx) => (
              <div
                key={day.toString()}
                className={cn(
                  dayIdx > 6 && "border-t border-gray-200",
                  "py-2"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(day)}
                  className={cn(
                    isSameDay(day, selectedDay) && "text-white",
                    !isSameDay(day, selectedDay) &&
                      isToday(day) &&
                      "text-red-500",
                    !isSameDay(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, firstDayCurrentMonth) &&
                      "text-gray-900",
                    !isSameDay(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "text-gray-400",
                    isSameDay(day, selectedDay) && isToday(day) && "bg-red-500",
                    isSameDay(day, selectedDay) &&
                      !isToday(day) &&
                      "bg-gray-900",
                    !isSameDay(day, selectedDay) && "hover:bg-gray-200",
                    (isSameDay(day, selectedDay) || isToday(day)) &&
                      "font-semibold",
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full relative"
                  )}
                >
                  <time dateTime={format(day, "yyyy-MM-dd")}>
                    {format(day, "d")}
                  </time>
                  {counts[format(day, "yyyy-MM-dd")] > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white ring-2 ring-white">
                      {counts[format(day, "yyyy-MM-dd")]}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
