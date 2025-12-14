import * as React from "react"
import { Camera, Plus, Trash2, X, Pencil, Check, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { getMemories, createMemory, updateMemory, deleteMemory } from "@/lib/api"

interface Memory {
  id: number
  text: string
  imageUrl?: string
  date: string // ISO string from backend
  createdAt: string // ISO string
}

interface MemorySectionProps {
  selectedDay: Date
}

export default function MemorySection({ selectedDay }: MemorySectionProps) {
  const [memories, setMemories] = React.useState<Memory[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  
  const [text, setText] = React.useState("")
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [editText, setEditText] = React.useState("")
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Fetch memories when selectedDay changes
  React.useEffect(() => {
    const fetchMemories = async () => {
      setIsLoading(true)
      try {
        const dateStr = format(selectedDay, "yyyy-MM-dd")
        const data = await getMemories(dateStr)
        setMemories(data)
      } catch (error) {
        console.error("Failed to load memories", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMemories()
  }, [selectedDay])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !selectedImage) return

    try {
      const newMemory = await createMemory({
        text,
        imageUrl: selectedImage || undefined,
        date: format(selectedDay, "yyyy-MM-dd"),
      })
      setMemories((prev) => [newMemory, ...prev])
      setText("")
      setSelectedImage(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      alert("저장에 실패했습니다.")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteMemory(id)
        setMemories((prev) => prev.filter((m) => m.id !== id))
      } catch (error) {
        alert("삭제에 실패했습니다.")
      }
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

  const saveEdit = async (id: number) => {
    if (!editText.trim()) return

    try {
      await updateMemory(id, { text: editText })
      setMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text: editText } : m))
      )
      setEditingId(null)
      setEditText("")
    } catch (error) {
      alert("수정에 실패했습니다.")
    }
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
            disabled={(!text.trim() && !selectedImage) || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            <span className="text-sm font-medium">기록하기</span>
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {isLoading && memories.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>불러오는 중...</p>
          </div>
        ) : (
          <>
            {memories.map((memory) => (
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
                      {format(new Date(memory.createdAt), "yyyy년 MM월 dd일 a h:mm", { locale: ko })}
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
            
            {memories.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p>아직 기록된 추억이 없어요.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
