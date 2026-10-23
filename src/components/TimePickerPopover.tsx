import { useEffect, useRef, useState, type RefObject } from 'react'

type TimePickerPopoverProps = {
  selectedTime: string | null
  triggerRef: RefObject<HTMLButtonElement | null>
  onSelect: (time: string) => void
  onClose: () => void
}

const hours = Array.from({ length: 12 }, (_, index) => index + 1)
const minutes = Array.from({ length: 60 }, (_, index) => index)

function parseTime(time: string | null) {
  const match = time?.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i)
  if (!match) {
    const now = new Date()
    return { hour: now.getHours() % 12 || 12, minute: now.getMinutes(), period: now.getHours() >= 12 ? 'PM' : 'AM' }
  }
  return { hour: Number(match[1]), minute: Number(match[2]), period: match[3].toUpperCase() }
}

export default function TimePickerPopover({ selectedTime, triggerRef, onSelect, onClose }: TimePickerPopoverProps) {
  const initialTime = parseTime(selectedTime)
  const [hour, setHour] = useState(initialTime.hour)
  const [minute, setMinute] = useState(initialTime.minute)
  const [period, setPeriod] = useState(initialTime.period)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedPopover = popoverRef.current?.contains(target)
      const clickedTrigger = triggerRef.current?.contains(target)
      if (!clickedPopover && !clickedTrigger) onClose()
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [onClose, triggerRef])

  return (
    <div ref={popoverRef} className="activity-time-picker-popover" role="dialog" aria-label="Choose time">
      <div className="activity-time-picker-title">Choose time</div>
      <div className="activity-time-picker-fields">
        <label className="activity-time-picker-label">
          Hour
          <select value={hour} onChange={(event) => setHour(Number(event.target.value))}>
            {hours.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="activity-time-picker-label">
          Minute
          <select value={minute} onChange={(event) => setMinute(Number(event.target.value))}>
            {minutes.map((value) => <option key={value} value={value}>{String(value).padStart(2, '0')}</option>)}
          </select>
        </label>
        <div className="activity-period" aria-label="AM or PM">
          {(['AM', 'PM'] as const).map((value) => (
            <button key={value} className={period === value ? 'active' : ''} type="button" onClick={() => setPeriod(value)}>{value}</button>
          ))}
        </div>
      </div>
      <button className="activity-time-picker-apply" type="button" onClick={() => onSelect(`${hour}:${String(minute).padStart(2, '0')} ${period}`)}>Set time</button>
    </div>
  )
}
