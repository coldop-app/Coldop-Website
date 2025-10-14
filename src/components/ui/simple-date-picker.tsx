"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SimpleDatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SimpleDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: SimpleDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Parse DD.MM.YYYY format
  const parseDate = (dateString: string): Date | null => {
    const regex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
    const match = dateString.match(regex)

    if (!match) return null

    const day = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1 // JavaScript months are 0-indexed
    const year = parseInt(match[3], 10)

    // Validate date
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
      return null
    }

    const date = new Date(year, month, day)

    // Check if the date is valid (handles cases like 31.02.2024)
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null
    }

    return date
  }

  // Format date to DD.MM.YYYY
  const formatDateToString = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    return `${day}.${month}.${year}`
  }

  // Update input value when value prop changes
  useEffect(() => {
    if (value && !isInputFocused) {
      setInputValue(formatDateToString(value))
    } else if (!value && !isInputFocused) {
      setInputValue("")
    }
  }, [value, isInputFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Parse and validate the date as user types
    const parsedDate = parseDate(value)
    if (parsedDate) {
      onChange?.(parsedDate)
    }
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
    // If input is empty or invalid, clear the value
    if (!inputValue || !parseDate(inputValue)) {
      setInputValue("")
      onChange?.(undefined)
    }
  }

  const handleDateSelect = (date: Date) => {
    onChange?.(date)
    setInputValue(formatDateToString(date))
    setIsOpen(false)
    setIsInputFocused(false)
  }

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const currentDate = value || new Date()
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())

  // Update calendar view when value changes
  useEffect(() => {
    if (value) {
      setCurrentMonth(value.getMonth())
      setCurrentYear(value.getFullYear())
    }
  }, [value])

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const days = generateCalendarDays(currentYear, currentMonth)
  const today = new Date()

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex">
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "h-10 rounded-r-none border-r-0 px-3 flex-shrink-0",
                disabled && "cursor-not-allowed opacity-50"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              !inputValue && "text-muted-foreground",
              className
            )}
          />
        </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-7 w-7 p-0"
            >
              ←
            </Button>
            <h3 className="text-sm font-medium">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-7 w-7 p-0"
            >
              →
            </Button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isSelected = value && isSameDay(day, value)
              const isToday = isSameDay(day, today)
              const isCurrentMonthDay = isCurrentMonth(day)

              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    !isCurrentMonthDay && "text-muted-foreground",
                    isToday && "bg-accent text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  onClick={() => handleDateSelect(day)}
                >
                  {day.getDate()}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
      </Popover>
    </div>
  )
}
