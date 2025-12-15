"use client"

import * as React from "react"
import { startOfToday } from "date-fns"
import Calendar from "@/components/Calendar"
import WeeklyView from "@/components/WeeklyView"
import MemorySection from "@/components/MemorySection"


import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Home() {
  let today = startOfToday()
  let [selectedDay, setSelectedDay] = React.useState(today)
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    if (!token) {
        router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    // 1. min-h-screen: 전체 화면 높이 사용
    // 2. p-4: 모바일에서 너무 꽉 차지 않게 여백 줌
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      
      {/* 레이아웃 컨테이너 */}
      {/* flex-col: 모바일에서는 세로 정렬 (위->아래) */}
      {/* lg:flex-row: 큰 화면(PC)에서는 가로 정렬 (좌->우) */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center relative gap-6">

        {/* 1. Weekly View (주간 캘린더) & Memory Section */}
        {/* 모바일: 맨 위에 보임 */}
        {/* lg:flex-1: PC에서는 가운데 공간을 차지하도록 설정 */}
        <div className="w-full lg:flex-1 lg:max-w-3xl lg:mx-auto space-y-6">
          {/* Grid Layout: [Empty] [WeeklyView] [ThemeToggle] to ensure centering and no overlap */}
          <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md pt-4 pb-4 border-b border-gray-200/50 shadow-sm relative flex justify-center">
            <div className="w-full max-w-3xl px-4">
              <WeeklyView selectedDay={selectedDay} onSelectDay={setSelectedDay} />
            </div>

            <div className="absolute top-4 right-2 md:top-6 md:right-4 z-10 whitespace-nowrap">
               {isLoggedIn ? (
                 <button onClick={handleLogout} className="text-[10px] md:text-sm font-medium bg-red-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded md:rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                   로그아웃
                 </button>
               ) : (
                 <Link href="/login" className="text-[10px] md:text-sm font-medium text-indigo-600 hover:text-indigo-500">
                   로그인
                 </Link>
               )}
            </div>
          </div>

          {/* Mobile Only: Monthly Calendar (Placed between Weekly View and Input) */}
          <div className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Calendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          </div>

          <MemorySection selectedDay={selectedDay} />
        </div>

        {/* 2. Calendar (월간 캘린더) - Desktop Only */}
        {/* lg:sticky: PC에서는 우측 상단에 '고정'되어 스크롤 따라옴 */}
        <div className="hidden lg:block w-72 lg:sticky lg:top-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* 캘린더 컴포넌트 */}
          <Calendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </div>

      </div>
    </main>
  );
}