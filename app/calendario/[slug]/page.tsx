"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Check, MapPin, Video, PhoneCall, CalendarDays } from 'lucide-react'
import type { Calendario, WeekSchedule, SpecificDate } from '@/app/superadmin/calendarios/_types'
import { defaultSchedule, calendarTypeLabels } from '@/app/superadmin/calendarios/_types'

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const dayNames = ["Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb.", "Dom."]

function generateSlots(start: string, end: string, duration: number, interval: number): string[] {
  if (!start || !end) return []
  const parse = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m }
  let current = parse(start)
  const endMin = parse(end)
  const slots: string[] = []
  while (current + duration <= endMin) {
    const h = Math.floor(current / 60)
    const m = current % 60
    const isPM = h >= 12
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
    slots.push(`${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`)
    current += interval
  }
  return slots
}

export default function PublicCalendarPage() {
  const params = useParams()
  const slug = params.slug as string
  const [calendar, setCalendar] = useState<Calendario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetch(`/api/calendarios/public/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setCalendar(data.data)
        else setError('Calendario no encontrado')
      })
      .catch(() => setError('Error al cargar'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-blis-red rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !calendar) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-blis-red/10 rounded-3xl flex items-center justify-center mb-6 border border-blis-red/20">
          <CalendarDays className="w-8 h-8 text-blis-red" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Calendario no encontrado</h1>
        <p className="text-white/40 mb-6">Este calendario no existe o ya no está disponible.</p>
        <a href="/" className="px-6 py-3 bg-blis-red rounded-2xl text-white font-bold hover:scale-[1.02] transition-all">Volver al inicio</a>
      </div>
    )
  }

  const schedule = calendar.horarios || defaultSchedule
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const blanks = firstDay === 0 ? 6 : firstDay - 1
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const weekDayMap: Record<number, keyof WeekSchedule> = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday'
  }

  let timeSlots: string[] = []
  if (selectedDate) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    const specificOverride = calendar.fechas_especificas?.find((sd: SpecificDate) => sd.date === dateStr)
    if (specificOverride) {
      timeSlots = generateSlots(specificOverride.start, specificOverride.end, calendar.duracion, calendar.intervalo)
    } else {
      const dateObj = new Date(currentYear, currentMonth, selectedDate)
      const dayKey = weekDayMap[dateObj.getDay()]
      const daySchedule = schedule[dayKey]
      if (daySchedule?.active) {
        timeSlots = generateSlots(daySchedule.start, daySchedule.end, calendar.duracion, calendar.intervalo)
      }
    }
  }

  const locationIcons: Record<string, React.ReactNode> = {
    presencial: <MapPin size={20} className="mt-0.5 text-gray-400 flex-shrink-0" />,
    videoconferencia: <Video size={20} className="mt-0.5 text-gray-400 flex-shrink-0" />,
    telefonica: <PhoneCall size={20} className="mt-0.5 text-gray-400 flex-shrink-0" />,
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative text-gray-800 transition-colors duration-500"
      style={{ backgroundColor: calendar.color_principal === '#be0b3c' ? '#f8fafc' : '#f8fafc' }}>
      <a href="/" className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/30 shadow-lg z-50 backdrop-blur-sm mix-blend-difference">
        <ArrowLeft size={16} /> Volver
      </a>

      <div className="flex-1 flex flex-col items-center justify-center p-4 py-20 relative">
        <div className="mb-8 flex flex-col items-center z-10">
          {calendar.logo ? (
            <img src={calendar.logo} alt={calendar.nombre} className="w-24 h-24 rounded-2xl object-cover shadow-2xl border-4 border-white/50 mb-4 bg-white" />
          ) : (
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/50 mb-4">
              <span className="text-3xl font-black" style={{ color: calendar.color_principal }}>
                {calendar.nombre.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-[1050px] flex flex-col md:flex-row relative border border-gray-100 z-10">
          <div className="md:w-1/3 p-10 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white mb-8 transition-colors shadow-sm">
                <ArrowLeft size={18} />
              </button>
            )}

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{calendarTypeLabels[calendar.tipo]}</p>
            <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-wide leading-tight">{calendar.nombre}</h2>

            <div className="space-y-5 mb-10">
              <div className="flex items-center gap-4 text-gray-600 font-medium">
                <ClockIcon color={calendar.color_principal} /> {calendar.duracion} min
              </div>

              {selectedDate && selectedTime && (
                <div className="flex items-center gap-4 text-gray-600 font-medium">
                  <CalendarDays size={20} className="text-gray-400" />
                  <span>{selectedTime}, {selectedDate} {monthNames[currentMonth]}</span>
                </div>
              )}

              {calendar.ubicacion_detalle && (
                <div className="flex items-start gap-4 text-gray-600">
                  {locationIcons[calendar.ubicacion_tipo] || <MapPin size={20} className="mt-0.5 text-gray-400" />}
                  <span className="leading-snug">{calendar.ubicacion_detalle}</span>
                </div>
              )}
            </div>

            {calendar.descripcion && (
              <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-200 pt-6">{calendar.descripcion}</p>
            )}
          </div>

          <div className="md:w-2/3 p-6 md:p-10 bg-white">
            {step === 1 && (
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-wide">Seleccione Fecha y Hora</h3>
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <button onClick={() => { if (currentMonth > 0) setCurrentMonth(currentMonth - 1) }}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        &#8592;
                      </button>
                      <span className="font-bold text-gray-900 text-lg">{monthNames[currentMonth]} {currentYear}</span>
                      <button onClick={() => { if (currentMonth < 11) setCurrentMonth(currentMonth + 1) }}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        &#8594;
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center mb-4">
                      {dayNames.map(day => <div key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2">{day}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center">
                      {Array.from({ length: blanks }, (_, i) => <div key={`b-${i}`} className="p-2" />)}
                      {days.map(day => {
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const dateObj = new Date(currentYear, currentMonth, day)
                        const specificOverride = calendar.fechas_especificas?.find((sd: SpecificDate) => sd.date === dateStr)
                        const isSpecificDate = !!specificOverride
                        const dayKey = weekDayMap[dateObj.getDay()]
                        const daySchedule = schedule[dayKey]
                        const isWeeklyActive = daySchedule?.active
                        const isPast = dateObj.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                        const isAvailable = calendar.tipo_horario === 'especifico' ? isSpecificDate : (isSpecificDate || isWeeklyActive)
                        const isDisabled = isPast || !isAvailable
                        const isSelected = selectedDate === day

                        return (
                          <div key={day} className="p-1 relative">
                            <button disabled={isDisabled}
                              onClick={() => { if (!isDisabled) { setSelectedDate(day); setSelectedTime(null) } }}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all border
                                ${isSelected ? 'text-white shadow-lg scale-110 border-transparent' : isDisabled ? 'text-gray-300 border-transparent cursor-not-allowed opacity-50' : 'text-gray-700 border-gray-100 hover:bg-gray-50 hover:border-gray-200'}`}
                              style={isSelected ? { backgroundColor: calendar.color_principal } : {}}>
                              {day}
                            </button>
                            {isSpecificDate && !isSelected && !isDisabled && (
                              <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: calendar.color_principal }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className={`w-full lg:w-56 transition-all duration-300 ${selectedDate ? 'opacity-100' : 'opacity-0 pointer-events-none hidden lg:block'}`}>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center lg:text-left">{selectedDate} de {monthNames[currentMonth]}</p>
                    <div className="h-[350px] overflow-y-auto pr-3 space-y-3">
                      {timeSlots.length > 0 ? timeSlots.map(time => (
                        <div key={time} className="flex gap-2">
                          <button onClick={() => setSelectedTime(time)}
                            className={`flex-1 py-3.5 px-4 rounded-xl border text-sm font-bold transition-all duration-300
                              ${selectedTime === time ? 'text-white w-1/2 border-transparent' : 'border-gray-200 text-gray-700 hover:border-blue-200 bg-white'}`}
                            style={selectedTime === time ? { backgroundColor: '#4b5563' } : {}}>
                            {time}
                          </button>
                          {selectedTime === time && (
                            <button onClick={() => setStep(2)}
                              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-white animate-fade-in shadow-lg hover:scale-[1.02] transition-transform"
                              style={{ backgroundColor: calendar.color_principal }}>
                              Siguiente
                            </button>
                          )}
                        </div>
                      )) : (
                        <div className="text-sm text-gray-500 text-center py-10 font-medium bg-gray-50 rounded-xl border border-gray-100">
                          No hay horas disponibles.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && calendar.formulario && (
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-wide">Detalles de Contacto</h3>
                <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(calendar.formulario || []).map((field: any) => (
                      <div key={field.id} className={field.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea required={field.required} placeholder={field.placeholder} rows={3}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:ring-2 focus:outline-none resize-none transition-colors shadow-sm"
                            style={{ '--tw-ring-color': calendar.color_principal } as React.CSSProperties} />
                        ) : (
                          <input required={field.required} type={field.type} placeholder={field.placeholder}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:ring-2 focus:outline-none transition-colors shadow-sm"
                            style={{ '--tw-ring-color': calendar.color_principal } as React.CSSProperties} />
                        )}
                      </div>
                    ))}
                  </div>

                  {calendar.requerir_consentimiento && (
                    <label className="flex items-start gap-4 mt-6 bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <input required type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300" style={{ accentColor: calendar.color_principal }} />
                      <span className="text-sm text-gray-600 leading-snug">
                        Al proceder, confirmas que has leído y aceptas nuestros términos y condiciones de privacidad.
                      </span>
                    </label>
                  )}

                  <div className="pt-8 border-t border-gray-100 flex justify-end">
                    <button type="submit"
                      className="px-10 py-4 rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg w-full md:w-auto"
                      style={{ backgroundColor: calendar.color_principal }}>
                      {calendar.texto_boton}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center text-center h-full py-12">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white mb-8 shadow-lg border-4 border-white"
                  style={{ backgroundColor: calendar.color_principal }}>
                  <Check size={48} />
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-wide">¡Cita Confirmada!</h3>
                <p className="text-gray-600 mb-10 text-lg max-w-md">
                  Estás agendado para el <strong className="text-gray-900 bg-gray-100 px-2 py-1 rounded">{selectedDate} de {monthNames[currentMonth]} a las {selectedTime}</strong>.
                </p>
                <button onClick={() => { setStep(1); setSelectedDate(null); setSelectedTime(null) }}
                  className="font-bold border border-gray-300 text-gray-600 bg-white px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                  Agendar otra cita
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClockIcon({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}