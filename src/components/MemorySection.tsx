import * as React from "react"
import { Camera, Plus, Trash2, X, Pencil, Check, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Memory {
  id: string
  text: string
  imageUrl?: string
  date: Date
  createdAt: Date
}

interface MemorySectionProps {
  selectedDay: Date
}

export default function MemorySection({ selectedDay }: MemorySectionProps) {
  // Store memories keyed by date string (YYYY-MM-DD)
  // Initialize with some dummy data for demonstration
  const [memoriesByDate, setMemoriesByDate] = React.useState<Record<string, Memory[]>>({
    [format(new Date(), "yyyy-MM-dd")]: [
      {
        id: "demo-1",
        text: "오늘은 날씨가 정말 좋았다! 한강 공원에서 산책을 했다.",
        date: new Date(),
        createdAt: new Date(),
      },
      {
        id: "demo-2",
        text: "저녁으로 맛있는 파스타를 먹었다.",
        date: new Date(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
    ],
  })
  const [text, setText] = React.useState("")
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editText, setEditText] = React.useState("")
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const dateKey = format(selectedDay, "yyyy-MM-dd")
  const currentMemories = memoriesByDate[dateKey] || []

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !selectedImage) return

    const newMemory: Memory = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      imageUrl: selectedImage || undefined,
      date: selectedDay,
      createdAt: new Date(),
    }

    setMemoriesByDate((prev) => ({
      ...prev,
      [dateKey]: [newMemory, ...(prev[dateKey] || [])],
    }))
    setText("")
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setMemoriesByDate((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey].filter((m) => m.id !== id),
      }))
    }
  }

  const startEditing = (memory: Memory) => {
    setEditingId(memory.id)
    setEditText(memory.text)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditText("")
  }

  const saveEdit = (id: string) => {
    if (!editText.trim()) return

    setMemoriesByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((m) =>
        m.id === id ? { ...m, text: editText } : m
      ),
    }))
    setEditingId(null)
    setEditText("")
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-4">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {format(selectedDay, "yyyy년 MM월 dd일")}의 기록
      </h3>
      <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700">
        <div className="flex gap-4">
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="오늘 어떤 추억이 있었나요?"
              className="w-full h-24 p-3 rounded-lg bg-gray-50 dark:bg-zinc-900 border-none resize-none focus:ring-2 focus:ring-blue-500"
            />
            
            {selectedImage && (
              <div className="relative mt-2 inline-block">
                <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Camera size={20} />
            <span className="text-sm font-medium">사진 추가</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="submit"
            disabled={!text.trim() && !selectedImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">기록하기</span>
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {currentMemories.map((memory) => (
          <div key={memory.id} className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 flex gap-4 group relative">
            {memory.imageUrl && (
              <img
                src={memory.imageUrl}
                alt="Memory"
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-gray-400">
                  {format(memory.createdAt, "yyyy년 MM월 dd일 a h:mm", { locale: ko })}
                </span>
                
                {editingId !== memory.id && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(memory)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(memory.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {editingId === memory.id ? (
                <div className="mt-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-blue-200 focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      <XCircle size={14} /> 취소
                    </button>
                    <button
                      onClick={() => saveEdit(memory.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                    >
                      <Check size={14} /> 저장
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{memory.text}</p>
              )}
            </div>
          </div>
        ))}
        
        {currentMemories.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p>아직 기록된 추억이 없어요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
