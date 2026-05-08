import { useState, useMemo, useRef, useEffect } from 'react'
import * as api from '../../services/api'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isToday(date) {
  return isSameDay(date, new Date())
}

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseDateStr(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * iOS-inspired calendar date picker.
 * 
 * @param {{ value: string, onChange: (dateStr: string) => void, orderCount?: number, compact?: boolean }} props
 */
export default function CalendarPicker({ value, onChange, orderCount, compact = false, refreshKey }) {
  const selected = useMemo(() => parseDateStr(value), [value])
  const [viewMonth, setViewMonth] = useState(selected.getMonth())
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [animDir, setAnimDir] = useState(null) // 'left' | 'right' | null
  const [dateCounts, setDateCounts] = useState({}) // { "2026-05-05": 3 }
  const gridRef = useRef(null)

  // Sync view when value changes externally
  useEffect(() => {
    setViewMonth(selected.getMonth())
    setViewYear(selected.getFullYear())
  }, [selected])

  // Fetch order counts for the viewed month
  useEffect(() => {
    if (compact) return // Don't fetch in compact/modal mode
    let cancelled = false
    api.getOrderDateCounts(viewYear, viewMonth + 1)
      .then((data) => {
        if (!cancelled) setDateCounts(data || {})
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [viewYear, viewMonth, compact, refreshKey])

  const prevMonth = () => {
    setAnimDir('right')
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
    setTimeout(() => setAnimDir(null), 250)
  }

  const nextMonth = () => {
    setAnimDir('left')
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
    setTimeout(() => setAnimDir(null), 250)
  }

  const goToday = () => {
    const now = new Date()
    setViewMonth(now.getMonth())
    setViewYear(now.getFullYear())
    onChange(toDateStr(now))
  }

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const cells = []

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        date: new Date(viewYear, viewMonth, d),
        isCurrentMonth: true,
      })
    }

    // Next month leading days to complete the grid
    const remaining = 42 - cells.length // 6 rows × 7
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        date: new Date(viewYear, viewMonth + 1, d),
        isCurrentMonth: false,
      })
    }

    return cells
  }, [viewMonth, viewYear])

  // Show only the rows needed (5 or 6)
  const rowCount = Math.ceil(
    (new Date(viewYear, viewMonth, 1).getDay() + new Date(viewYear, viewMonth + 1, 0).getDate()) / 7
  )
  const visibleCells = calendarDays.slice(0, rowCount * 7)

  const handleSelect = (cell) => {
    if (!cell.isCurrentMonth) {
      // Navigate to that month too
      setViewMonth(cell.date.getMonth())
      setViewYear(cell.date.getFullYear())
    }
    onChange(toDateStr(cell.date))
  }

  const displayLabel = useMemo(() => {
    const d = parseDateStr(value)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  }, [value])

  return (
    <div className={`calendar-picker${compact ? ' calendar-picker--mini' : ''}`}>
      {/* Header */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="cal-title" onClick={goToday}>
          {MONTHS[viewMonth]} {viewYear}
        </button>
        <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Weekday labels */}
      <div className="cal-weekdays">
        {DAYS.map((d, i) => (
          <div key={i} className="cal-weekday-label">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div
        ref={gridRef}
        className={`cal-grid ${animDir === 'left' ? 'cal-slide-left' : animDir === 'right' ? 'cal-slide-right' : ''}`}
      >
        {visibleCells.map((cell, i) => {
          const isSelected = isSameDay(cell.date, selected)
          const today = isToday(cell.date)
          const dateKey = toDateStr(cell.date)
          const count = dateCounts[dateKey] || 0
          const hasOrders = count > 0 && !compact

          return (
            <button
              key={i}
              onClick={() => handleSelect(cell)}
              className={[
                'cal-day',
                !cell.isCurrentMonth && 'cal-day--outside',
                isSelected && 'cal-day--selected',
                today && 'cal-day--today',
                hasOrders && !isSelected && 'cal-day--has-orders',
              ].filter(Boolean).join(' ')}
            >
              <span className="cal-day-num">{cell.day}</span>
              {hasOrders && (
                <span className="cal-order-dot" />
              )}
              {today && !hasOrders && <span className="cal-today-dot" />}
            </button>
          )
        })}
      </div>

      {/* Footer — hidden in compact mode */}
      {!compact && (
        <div className="cal-footer">
          <span className="cal-footer-label">
            📦 {displayLabel}
          </span>
          {typeof orderCount === 'number' && (
            <span className="cal-footer-badge">{orderCount}</span>
          )}
        </div>
      )}
    </div>
  )
}
