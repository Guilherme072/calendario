"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Megaphone,
  ArrowLeft,
  Save,
} from "lucide-react"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Eye, Star } from "lucide-react"
// import { format } from "date-fns"
// import { ptBR } from "date-fns/locale"

const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR")
}

interface TeamMember {
  name: string
  role: "principal" | "publicidade"
  avatar: string
  initials: string
}

interface Event {
  id: string
  name: string
  date: string
  time?: string
  type: "feriado" | "reuniao" | "publicidade" | "aprovacao" | "especial" | "evento-presencial" | "evento-online"
  subtype?: "reuniao-equipe" | "reuniao-influencer" | "reuniao-marca" | "reuniao-estrategica"
  description?: string
  brands?: string[]
  influencers?: string[]
  participants?: string[]
  location?: string
  repeats?: boolean
  repeatType?: "diario" | "semanal" | "mensal" | "anual"
  priority?: "critico" | "urgente" | "atencao" | "normal"
  color?: string
}

interface MonthData {
  name: string
  status: "completed" | "current" | "upcoming"
  principal: TeamMember
  publicidade: TeamMember
  events: Event[]
}

const HOLIDAYS_2025 = [
  {
    name: "Confraternização Universal",
    date: "01-01",
    brands: ["Coca-Cola", "Magazine Luiza", "Mercado Livre"],
    influencers: ["Kerbitos", "Filipe Leme", "Boteco F1"],
  },
  {
    name: "Carnaval",
    date: "03-03",
    brands: ["Skol", "Brahma", "Ambev"],
    influencers: ["Carlinhos Maia", "Whindersson Nunes"],
  },
  {
    name: "Carnaval",
    date: "03-04",
    brands: ["Skol", "Brahma", "Ambev"],
    influencers: ["Carlinhos Maia", "Whindersson Nunes"],
  },
  { name: "Sexta-feira Santa", date: "04-18", brands: ["Nestlé", "Garoto"], influencers: ["Padre Fábio de Melo"] },
  { name: "Tiradentes", date: "04-21", brands: ["Petrobras", "Vale"], influencers: ["Felipe Neto"] },
  {
    name: "Dia do Trabalhador",
    date: "05-01",
    brands: ["Magazine Luiza", "Casas Bahia"],
    influencers: ["Luciano Hang"],
  },
  { name: "Corpus Christi", date: "06-19", brands: ["Nestlé", "Garoto"], influencers: ["Padre Fábio de Melo"] },
  {
    name: "Independência do Brasil",
    date: "09-07",
    brands: ["Petrobras", "Vale", "JBS"],
    influencers: ["Felipe Neto", "Kerbitos"],
  },
  {
    name: "Nossa Senhora Aparecida",
    date: "10-12",
    brands: ["Nestlé", "Garoto"],
    influencers: ["Padre Fábio de Melo"],
  },
  { name: "Finados", date: "11-02", brands: ["Nestlé", "Garoto"], influencers: ["Padre Fábio de Melo"] },
  { name: "Proclamação da República", date: "11-15", brands: ["Petrobras", "Vale"], influencers: ["Felipe Neto"] },
  {
    name: "Natal",
    date: "12-25",
    brands: ["Coca-Cola", "Magazine Luiza", "Mercado Livre", "O Boticário"],
    influencers: ["Kerbitos", "Filipe Leme", "Boteco F1", "Whindersson Nunes"],
  },
]

const EVENT_COLORS = [
  { name: "Azul", value: "bg-blue-500" },
  { name: "Verde", value: "bg-green-500" },
  { name: "Vermelho", value: "bg-red-500" },
  { name: "Amarelo", value: "bg-yellow-500" },
  { name: "Roxo", value: "bg-purple-500" },
  { name: "Rosa", value: "bg-pink-500" },
  { name: "Laranja", value: "bg-orange-500" },
  { name: "Cinza", value: "bg-gray-500" },
]

const generateTeamMeetings = (year: number, month: number): Event[] => {
  const meetings: Event[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()

    // Tuesday (2) and Friday (5)
    if (dayOfWeek === 2 || dayOfWeek === 5) {
      const dayName = dayOfWeek === 2 ? "Terça" : "Sexta"
      meetings.push({
        id: `meeting-${year}-${month}-${day}`,
        name: `Reunião de Equipe - ${dayName}`,
        date: String(day).padStart(2, "0"),
        time: "19:00",
        type: "reuniao",
        subtype: "reuniao-equipe",
        priority: "normal",
        color: "bg-green-500",
        repeats: true,
        repeatType: "semanal",
      })
    }
  }

  return meetings
}

const getInitialMonthsData = (year: number): MonthData[] => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const monthsData: MonthData[] = [
    {
      name: "Janeiro",
      status:
        year < currentYear || (year === currentYear && 0 < currentMonth)
          ? "completed"
          : year === currentYear && 0 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "JR", role: "principal", avatar: "/professional-man.png", initials: "JR" },
      publicidade: {
        name: "Ana Silva",
        role: "publicidade",
        avatar: "/professional-woman-diverse.png",
        initials: "AS",
      },
      events: [],
    },
    {
      name: "Fevereiro",
      status:
        year < currentYear || (year === currentYear && 1 < currentMonth)
          ? "completed"
          : year === currentYear && 1 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "Felipe D.", role: "principal", avatar: "/feliped-Redondo.png", initials: "FD" },
      publicidade: { name: "Felipe D.", role: "publicidade", avatar: "/feliped-Redondo.png", initials: "FD" },
      events: [],
    },
    {
      name: "Março",
      status:
        year < currentYear || (year === currentYear && 2 < currentMonth)
          ? "completed"
          : year === currentYear && 2 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "João Gabriel", role: "principal", avatar: "/Gabs-redondo.png", initials: "JG" },
      publicidade: { name: "João Gabriel", role: "publicidade", avatar: "/Gabs-redondo.png", initials: "JG" },
      events: [],
    },
    {
      name: "Abril",
      status:
        year < currentYear || (year === currentYear && 3 < currentMonth)
          ? "completed"
          : year === currentYear && 3 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "Vinícius F.", role: "principal", avatar: "/vini-redondo.jpg", initials: "VF" },
      publicidade: { name: "Vinícius F.", role: "publicidade", avatar: "/vini-redondo.jpg", initials: "VF" },
      events: [],
    },
    {
      name: "Maio",
      status:
        year < currentYear || (year === currentYear && 4 < currentMonth)
          ? "completed"
          : year === currentYear && 4 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "José Renato", role: "principal", avatar: "/Renato-redondo.png", initials: "JR" },
      publicidade: { name: "José Renato", role: "publicidade", avatar: "/Renato-redondo.png", initials: "JR" },
      events: [],
    },
    {
      name: "Junho",
      status:
        year < currentYear || (year === currentYear && 5 < currentMonth)
          ? "completed"
          : year === currentYear && 5 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "Guilherme V.", role: "principal", avatar: "/Gui-redondo.png", initials: "GV" },
      publicidade: { name: "Vinícius F.", role: "publicidade", avatar: "/vini-redondo.jpg", initials: "VF" },
      events: [],
    },
    {
      name: "Julho",
      status:
        year < currentYear || (year === currentYear && 6 < currentMonth)
          ? "completed"
          : year === currentYear && 6 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "João Gabriel", role: "principal", avatar: "/Gabs-redondo.png", initials: "JG" },
      publicidade: { name: "José Renato", role: "publicidade", avatar: "/Renato-redondo.png", initials: "JR" },
      events: [],
    },
    {
      name: "Agosto",
      status:
        year < currentYear || (year === currentYear && 7 < currentMonth)
          ? "completed"
          : year === currentYear && 7 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "Vinícius F.", role: "principal", avatar: "/vini-redondo.jpg", initials: "VF" },
      publicidade: { name: "Felipe D.", role: "publicidade", avatar: "/feliped-Redondo.png", initials: "FD" },
      events: [],
    },
    {
      name: "Setembro",
      status:
        year < currentYear || (year === currentYear && 8 < currentMonth)
          ? "completed"
          : year === currentYear && 8 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "José Renato", role: "principal", avatar: "/Renato-redondo.png", initials: "JR" },
      publicidade: { name: "Vinícius F.", role: "publicidade", avatar: "/vini-redondo.jpg", initials: "VF" },
      events: [],
    },
    {
      name: "Outubro",
      status:
        year < currentYear || (year === currentYear && 9 < currentMonth)
          ? "completed"
          : year === currentYear && 9 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "Guilherme V.", role: "principal", avatar: "/Gui-redondo.png", initials: "GV" },
      publicidade: { name: "José Renato", role: "publicidade", avatar: "/Renato-redondo.png", initials: "JR" },
      events: [],
    },
    {
      name: "Novembro",
      status:
        year < currentYear || (year === currentYear && 10 < currentMonth)
          ? "completed"
          : year === currentYear && 10 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "João Gabriel", role: "principal", avatar: "/Gabs-redondo.png", initials: "JG" },
      publicidade: {
        name: "Guilherme V.",
        role: "publicidade",
        avatar: "/Gui-redondo.png",
        initials: "GV",
      },
      events: [],
    },
    {
      name: "Dezembro",
      status:
        year < currentYear || (year === currentYear && 11 < currentMonth)
          ? "completed"
          : year === currentYear && 11 === currentMonth
            ? "current"
            : "upcoming",
      principal: { name: "Vinícius F.", role: "principal", avatar: "/vini-redondo.jpg", initials: "VF" },
      publicidade: { name: "João Gabriel", role: "publicidade", avatar: "/Gabs-redondo.png", initials: "JG" },
      events: [],
    },
  ]

  if (year === 2025) {
    HOLIDAYS_2025.forEach((holiday) => {
      const [month, day] = holiday.date.split("-").map(Number)
      const monthIndex = month - 1

      monthsData[monthIndex].events.push({
        id: `holiday-${holiday.date}`,
        name: holiday.name,
        date: String(day).padStart(2, "0"),
        time: "00:00",
        type: "feriado",
        priority: "normal",
        color: "bg-blue-500",
        brands: holiday.brands,
        influencers: holiday.influencers,
      })
    })

    // Add team meetings for each month
    monthsData.forEach((month, index) => {
      const meetings = generateTeamMeetings(year, index + 1)
      month.events.push(...meetings)
    })
  }

  return monthsData
}

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate()
}

const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month - 1, 1).getDay()
}

const getEventColor = (event: Event) => {
  if (event.color) return event.color
  if (event.priority === "critico") return "bg-red-500"
  if (event.priority === "urgente") return "bg-orange-500"
  if (event.priority === "atencao") return "bg-yellow-500"

  switch (event.type) {
    case "feriado":
      return "bg-blue-500"
    case "reuniao":
      return "bg-green-500"
    case "publicidade":
      return "bg-purple-500"
    case "aprovacao":
      return "bg-orange-500"
    case "especial":
      return "bg-pink-500"
    case "evento-presencial":
      return "bg-indigo-500"
    case "evento-online":
      return "bg-cyan-500"
    default:
      return "bg-gray-500"
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critico":
      return { text: "Crítico (≤3 dias)", color: "bg-red-500", icon: AlertCircle }
    case "urgente":
      return { text: "Urgente (≤7 dias)", color: "bg-orange-500", icon: Clock }
    case "atencao":
      return { text: "Atenção (≤15 dias)", color: "bg-yellow-500", icon: Eye }
    default:
      return null
  }
}

export default function TeamCalendar() {
  const [currentYear, setCurrentYear] = useState(2025)
  const [monthsData, setMonthsData] = useState(() => getInitialMonthsData(2025))
  const [isClient, setIsClient] = useState(false)
  const [view, setView] = useState<"year" | "month">("year")
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showDayDetails, setShowDayDetails] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  // const [showConfirmEdit, setShowConfirmEdit] = useState(false)
  // const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  // const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "name" | "priority">("date")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: "reuniao",
    priority: "normal",
    repeats: false,
    color: "bg-blue-500",
  })

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const today = currentDate.getDate()

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem("team-calendar-data")
    if (saved) {
      try {
        const parsedData = JSON.parse(saved)
        if (Array.isArray(parsedData) && parsedData.length === 12) {
          setMonthsData(parsedData)
        } else {
          setMonthsData(getInitialMonthsData(2025))
        }
      } catch (error) {
        console.error("Error loading saved data:", error)
        setMonthsData(getInitialMonthsData(2025))
      }
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      setMonthsData((prevData) => {
        const updatedData = getInitialMonthsData(currentYear)
        // Preserve existing events from previous data
        return updatedData.map((month, index) => ({
          ...month,
          events: prevData[index]?.events || month.events,
        }))
      })
    }
  }, [isClient, currentYear])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("team-calendar-data", JSON.stringify(monthsData))
    }
  }, [monthsData, isClient])

  const handleYearChange = (newYear: number) => {
    setCurrentYear(newYear)
    const saved = localStorage.getItem(`team-calendar-data-${newYear}`)
    setMonthsData(saved ? JSON.parse(saved) : getInitialMonthsData(newYear))
    setView("year")
    setSelectedMonth(null)
    setSelectedDay(null)
  }

  const handleMonthClick = (monthIndex: number) => {
    setSelectedMonth(monthIndex)
    setView("month")
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    setShowDayDetails(true)
  }

  const handleAddEvent = () => {
    if (!newEvent.name || !newEvent.date || selectedMonth === null) return

    const event: Event = {
      id: Date.now().toString(),
      name: newEvent.name,
      date: newEvent.date,
      time: newEvent.time || "09:00",
      type: newEvent.type as Event["type"],
      subtype: newEvent.subtype,
      description: newEvent.description,
      brands: newEvent.brands,
      influencers: newEvent.influencers,
      participants: newEvent.participants,
      location: newEvent.location,
      repeats: newEvent.repeats,
      repeatType: newEvent.repeatType,
      priority: newEvent.priority as Event["priority"],
      color: newEvent.color,
    }

    const updatedMonthsData = [...monthsData]
    updatedMonthsData[selectedMonth].events.push(event)
    setMonthsData(updatedMonthsData)

    setNewEvent({ type: "reuniao", priority: "normal", repeats: false, color: "bg-blue-500" })
    setShowAddEvent(false)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setNewEvent(event)
    setShowEditEvent(true)
  }

  // const handleSaveEdit = () => {
  //   setShowEditEvent(false)
  //   setShowConfirmEdit(true)
  // }

  // const handleConfirmEdit = () => {
  //   if (!editingEvent || selectedMonth === null) return

  //   const updatedMonthsData = [...monthsData]
  //   const eventIndex = updatedMonthsData[selectedMonth].events.findIndex((e) => e.id === editingEvent.id)

  //   if (eventIndex !== -1) {
  //     updatedMonthsData[selectedMonth].events[eventIndex] = {
  //       ...editingEvent,
  //       ...newEvent,
  //     }
  //     setMonthsData(updatedMonthsData)
  //   }

  //   setShowConfirmEdit(false)
  //   setEditingEvent(null)
  //   setNewEvent({ type: "reuniao", priority: "normal", repeats: false, color: "bg-blue-500" })
  // }

  const handleDeleteEvent = (event: Event) => {
    if (selectedMonth === null) return

    const updatedMonthsData = [...monthsData]
    updatedMonthsData[selectedMonth].events = updatedMonthsData[selectedMonth].events.filter((e) => e.id !== event.id)
    setMonthsData(updatedMonthsData)
  }

  // The delete confirmation dialog and related code has been removed to fix build errors
  // const handleConfirmDelete = () => {
  //   if (!deletingEvent || selectedMonth === null) return

  //   const updatedMonthsData = [...monthsData]
  //   updatedMonthsData[selectedMonth].events = updatedMonthsData[selectedMonth].events.filter(
  //     (e) => e.id !== deletingEvent.id,
  //   )
  //   setMonthsData(updatedMonthsData)

  //   setShowConfirmDelete(false)
  //   setDeletingEvent(null)
  // }

  const getEventsForDay = (day: number) => {
    if (selectedMonth === null) return []
    return monthsData[selectedMonth].events.filter((event) => Number.parseInt(event.date) === day)
  }

  const getFilteredAndSortedEvents = () => {
    if (selectedMonth === null) return []

    let events = monthsData[selectedMonth].events

    // Filter by search term
    if (searchTerm) {
      events = events.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.brands?.some((brand) => brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
          event.influencers?.some((inf) => inf.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by type
    if (filterType !== "all") {
      events = events.filter((event) => event.type === filterType)
    }

    // Sort events
    events.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return Number.parseInt(a.date) - Number.parseInt(b.date)
        case "name":
          return a.name.localeCompare(b.name)
        case "priority":
          const priorityOrder = { critico: 0, urgente: 1, atencao: 2, normal: 3 }
          return priorityOrder[a.priority || "normal"] - priorityOrder[b.priority || "normal"]
        default:
          return 0
      }
    })

    return events
  }

  const getCurrentWeekEvents = () => {
    if (selectedMonth === null) return []

    const currentDate = new Date()
    const currentWeek = Math.ceil(currentDate.getDate() / 7)

    return monthsData[selectedMonth].events.filter((event) => {
      const eventDay = Number.parseInt(event.date)
      const eventWeek = Math.ceil(eventDay / 7)
      return eventWeek === currentWeek
    })
  }

  const renderMonthDays = (monthIndex: number) => {
    const daysInMonth = getDaysInMonth(monthIndex + 1, currentYear)
    const firstDay = getFirstDayOfMonth(monthIndex + 1, currentYear)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-border/20"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = monthIndex === currentMonth && day === today && currentYear === currentDate.getFullYear()
      const dayEvents = monthsData[monthIndex].events.filter((event) => Number.parseInt(event.date) === day)

      days.push(
        <div
          key={day}
          className={`h-20 border border-border/15 p-1 cursor-pointer hover:bg-muted/50 transition-colors ${
            isToday ? "bg-accent/20 ring-2 ring-accent" : ""
          }`}
          onClick={() => handleDayClick(day)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? "text-accent-foreground" : "text-foreground"}`}>
            {day}
            {isToday && <Star className="inline h-3 w-3 ml-1 text-accent fill-accent" />}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div key={event.id} className={`text-xs px-1 py-0.5 rounded text-white truncate ${getEventColor(event)}`}>
                {event.name}
              </div>
            ))}
            {dayEvents.length > 2 && <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} mais</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  if (view === "year") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0025] via-[#1b003d] to-[#32004b] text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Calendário Anual - Equipe {currentYear}</h1>
              <p className="text-muted-foreground">Controle de parcerias e eventos sazonais</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowAddEvent(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Evento
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleYearChange(currentYear - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  {currentYear - 1}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleYearChange(currentYear + 1)}>
                  {currentYear + 1}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {monthsData.map((month, index) => (
              <Card
                key={month.name}
                className={`relative transition-all duration-300 cursor-pointer hover:scale-105 ${
                  month.status === "current"
                    ? "bg-gradient-to-br from-[#1e00ff]/80 to-[#8b00ff]/60 ring-2 ring-blue-400"
                    : month.status === "completed"
                      ? "bg-white/5 opacity-60 opacity-60"
                      : "bg-card"
                }`}
                onClick={() => handleMonthClick(index)}
              >
                {month.status === "current" && (
                  <Star className="absolute top-3 right-3 h-5 w-5 text-accent fill-accent" />
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-card-foreground">{month.name}</h3>
                    <Badge variant={month.status === "current" ? "default" : "secondary"} className="text-xs">
                      {month.status === "completed" ? "Concluído" : month.status === "current" ? "Atual" : "Próximo"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Team Members */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={month.principal?.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{month.principal?.initials || "??"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {month.principal?.name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">Responsável Principal</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Megaphone className="h-4 w-4 text-muted-foreground" />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={month.publicidade?.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{month.publicidade?.initials || "??"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {month.publicidade?.name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">Responsável Publicidade</p>
                      </div>
                    </div>
                  </div>

                  {/* Events */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-card-foreground">Eventos:</span>
                      <Badge variant="outline" className="text-xs">
                        {month.events.length}
                      </Badge>
                    </div>

                    {month.events.length > 0 ? (
                      <div className="space-y-2">
                        {month.events.slice(0, 2).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="flex items-center gap-2 p-2 bg-white/5 opacity-60 rounded text-xs"
                          >
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getEventColor(event)}`} />
                            <span className="text-card-foreground font-medium">{event.name}</span>
                            <span className="text-muted-foreground ml-auto">
                              {event.date}/{String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                        ))}
                        {month.events.length > 2 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{month.events.length - 2} evento{month.events.length - 2 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Nenhum evento programado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Agenda Mensal</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="feriado">Feriados</SelectItem>
                    <SelectItem value="reuniao">Reuniões</SelectItem>
                    <SelectItem value="publicidade">Publicidade</SelectItem>
                    <SelectItem value="evento-presencial">Eventos Presenciais</SelectItem>
                    <SelectItem value="evento-online">Eventos Online</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "name" | "priority")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="priority">Prioridade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthsData.map((month, monthIndex) => {
                const monthEvents = month.events.filter((event) => {
                  if (searchTerm) {
                    return (
                      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  }
                  if (filterType !== "all") {
                    return event.type === filterType
                  }
                  return true
                })

                if (monthEvents.length === 0) return null

                return (
                  <Card key={monthIndex} className="p-4">
                    <h3 className="font-semibold mb-3">
                      {month.name} {currentYear}
                    </h3>
                    <div className="space-y-2">
                      {monthEvents.slice(0, 5).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 p-2 bg-white/5 opacity-60 rounded text-sm"
                        >
                          <div className={`w-3 h-3 rounded-full ${getEventColor(event)}`} />
                          <div className="flex-1">
                            <p className="font-medium">{event.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.date}/{String(monthIndex + 1).padStart(2, "0")} • {event.time}
                            </p>
                          </div>
                        </div>
                      ))}
                      {monthEvents.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{monthEvents.length - 5} mais eventos
                        </p>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </Card>
        </div>

        <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Evento</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-name">Nome do Evento</Label>
                <Input
                  id="event-name"
                  value={newEvent.name || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder="Ex: Reunião de Equipe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-type">Tipo</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value as Event["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feriado">Feriado</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="publicidade">Publicidade</SelectItem>
                    <SelectItem value="aprovacao">Aprovação</SelectItem>
                    <SelectItem value="especial">Dia Especial</SelectItem>
                    <SelectItem value="evento-presencial">Evento Presencial</SelectItem>
                    <SelectItem value="evento-online">Evento Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newEvent.type === "reuniao" && (
                <div className="space-y-2">
                  <Label htmlFor="event-subtype">Tipo de Reunião</Label>
                  <Select
                    value={newEvent.subtype}
                    onValueChange={(value) => setNewEvent({ ...newEvent, subtype: value as Event["subtype"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reuniao-equipe">Reunião da Equipe</SelectItem>
                      <SelectItem value="reuniao-influencer">Reunião com Influencer</SelectItem>
                      <SelectItem value="reuniao-marca">Reunião com Marca</SelectItem>
                      <SelectItem value="reuniao-estrategica">Reunião Estratégica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(newEvent.type === "evento-presencial" || newEvent.type === "evento-online") && (
                <div className="space-y-2">
                  <Label htmlFor="event-location">
                    {newEvent.type === "evento-presencial" ? "Local" : "Link/Plataforma"}
                  </Label>
                  <Input
                    id="event-location"
                    value={newEvent.location || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder={newEvent.type === "evento-presencial" ? "Ex: Centro de Convenções" : "Ex: Zoom, Teams"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="event-date">Data</Label>
                {/* Updated date formatting in Popover to use custom function */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        if (date) {
                          setNewEvent({ ...newEvent, date: String(date.getDate()).padStart(2, "0") })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-time">Horário</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-priority">Prioridade</Label>
                <Select
                  value={newEvent.priority}
                  onValueChange={(value) => setNewEvent({ ...newEvent, priority: value as Event["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="atencao">Atenção</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-color">Cor do Evento</Label>
                <Select value={newEvent.color} onValueChange={(value) => setNewEvent({ ...newEvent, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.value}`} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-brands">Marcas Envolvidas</Label>
                <Input
                  id="event-brands"
                  value={newEvent.brands?.join(", ") || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, brands: e.target.value.split(", ").filter(Boolean) })}
                  placeholder="Ex: Nike, Adidas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-influencers">Influenciadores</Label>
                <Input
                  id="event-influencers"
                  value={newEvent.influencers?.join(", ") || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, influencers: e.target.value.split(", ").filter(Boolean) })
                  }
                  placeholder="Ex: @influencer1, @influencer2"
                />
              </div>

              {newEvent.type === "reuniao" && (
                <div className="space-y-2">
                  <Label htmlFor="event-participants">Participantes</Label>
                  <Input
                    id="event-participants"
                    value={newEvent.participants?.join(", ") || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, participants: e.target.value.split(", ").filter(Boolean) })
                    }
                    placeholder="Ex: João, Maria, Pedro"
                  />
                </div>
              )}

              <div className="col-span-2 space-y-2">
                <Label htmlFor="event-description">Descrição</Label>
                <Textarea
                  id="event-description"
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Detalhes do evento..."
                />
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="event-repeats"
                    checked={newEvent.repeats || false}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, repeats: checked as boolean })}
                  />
                  <Label htmlFor="event-repeats">Evento se repete</Label>
                </div>

                {newEvent.repeats && (
                  <div className="space-y-2">
                    <Label htmlFor="repeat-type">Frequência de Repetição</Label>
                    <Select
                      value={newEvent.repeatType}
                      onValueChange={(value) => setNewEvent({ ...newEvent, repeatType: value as Event["repeatType"] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddEvent}>Adicionar Evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (view === "month" && selectedMonth !== null) {
    const month = monthsData[selectedMonth]
    const priorities = ["critico", "urgente", "atencao"]
      .map((p) => {
        const count = month.events.filter((e) => e.priority === p).length
        return count > 0 ? { priority: p, count } : null
      })
      .filter(Boolean)

    const filteredEvents = getFilteredAndSortedEvents()
    const weekEvents = getCurrentWeekEvents()

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0025] via-[#1b003d] to-[#32004b] text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setView("year")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Ano
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {month.name} {currentYear}
                </h1>
                <p className="text-muted-foreground">Calendário detalhado do mês</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowAddEvent(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Evento
              </Button>
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={month.principal?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{month.principal?.initials || "??"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{month.principal?.name || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">Responsável Principal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={month.publicidade?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{month.publicidade?.initials || "??"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{month.publicidade?.name || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">Responsável Publicidade</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Month Navigation and Priority Indicators */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(selectedMonth - 1)}
                disabled={selectedMonth === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {month.name} {currentYear}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(selectedMonth + 1)}
                disabled={selectedMonth === 11}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              {priorities.map((p) => {
                const badge = getPriorityBadge(p!.priority)
                if (!badge) return null
                const Icon = badge.icon
                return (
                  <div key={p!.priority} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${badge.color}`} />
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{badge.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Calendar Grid */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-7 gap-0 mb-4">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="h-12 flex items-center justify-center font-medium text-muted-foreground border-b"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0">{renderMonthDays(selectedMonth)}</div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Agenda da Semana</h3>
              {weekEvents.length > 0 ? (
                <div className="space-y-3">
                  {weekEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-white/5 opacity-60 rounded">
                      <div className={`w-4 h-4 rounded-full ${getEventColor(event)}`} />
                      <div className="flex-1">
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.date}/{String(selectedMonth + 1).padStart(2, "0")} • {event.time}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum evento programado para esta semana</p>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Agenda do Mês</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-40"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="feriado">Feriados</SelectItem>
                      <SelectItem value="reuniao">Reuniões</SelectItem>
                      <SelectItem value="publicidade">Publicidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 bg-white/5 opacity-60 rounded text-sm">
                    <div className={`w-3 h-3 rounded-full ${getEventColor(event)}`} />
                    <div className="flex-1">
                      <p className="font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date}/{String(selectedMonth + 1).padStart(2, "0")} • {event.time}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Day Details Dialog */}
        <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Agenda do dia {selectedDay} de {month.name} {currentYear}
              </DialogTitle>
            </DialogHeader>
            {selectedDay && (
              <div className="space-y-4">
                {getEventsForDay(selectedDay).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDay(selectedDay).map((event) => (
                      <Card key={event.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full mt-1 ${getEventColor(event)}`} />
                            <div>
                              <h4 className="font-medium">{event.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {event.time} • {event.type}
                              </p>
                              {event.description && <p className="text-sm mt-2">{event.description}</p>}
                              {event.brands && event.brands.length > 0 && (
                                <p className="text-sm mt-1">
                                  <strong>Marcas:</strong> {event.brands.join(", ")}
                                </p>
                              )}
                              {event.influencers && event.influencers.length > 0 && (
                                <p className="text-sm mt-1">
                                  <strong>Influenciadores:</strong> {event.influencers.join(", ")}
                                </p>
                              )}
                              {event.location && (
                                <p className="text-sm mt-1">
                                  <MapPin className="inline h-3 w-3 mr-1" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhum evento programado para este dia</p>
                )}
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setNewEvent({ ...newEvent, date: String(selectedDay).padStart(2, "0") })
                      setShowAddEvent(true)
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Evento
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showEditEvent} onOpenChange={setShowEditEvent}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
            </DialogHeader>
            {/* Same form as Add Event but with Save button */}
            <div className="grid grid-cols-2 gap-4">
              {/* Same form fields as add event */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-name">Nome do Evento</Label>
                <Input
                  id="edit-event-name"
                  value={newEvent.name || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder="Ex: Reunião de Equipe"
                />
              </div>
              {/* Other fields */}
              <div className="space-y-2">
                <Label htmlFor="event-type">Tipo</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value as Event["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feriado">Feriado</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="publicidade">Publicidade</SelectItem>
                    <SelectItem value="aprovacao">Aprovação</SelectItem>
                    <SelectItem value="especial">Dia Especial</SelectItem>
                    <SelectItem value="evento-presencial">Evento Presencial</SelectItem>
                    <SelectItem value="evento-online">Evento Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newEvent.type === "reuniao" && (
                <div className="space-y-2">
                  <Label htmlFor="event-subtype">Tipo de Reunião</Label>
                  <Select
                    value={newEvent.subtype}
                    onValueChange={(value) => setNewEvent({ ...newEvent, subtype: value as Event["subtype"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reuniao-equipe">Reunião da Equipe</SelectItem>
                      <SelectItem value="reuniao-influencer">Reunião com Influencer</SelectItem>
                      <SelectItem value="reuniao-marca">Reunião com Marca</SelectItem>
                      <SelectItem value="reuniao-estrategica">Reunião Estratégica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(newEvent.type === "evento-presencial" || newEvent.type === "evento-online") && (
                <div className="space-y-2">
                  <Label htmlFor="event-location">
                    {newEvent.type === "evento-presencial" ? "Local" : "Link/Plataforma"}
                  </Label>
                  <Input
                    id="event-location"
                    value={newEvent.location || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder={newEvent.type === "evento-presencial" ? "Ex: Centro de Convenções" : "Ex: Zoom, Teams"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="event-date">Data</Label>
                {/* Updated date formatting in Popover to use custom function */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        if (date) {
                          setNewEvent({ ...newEvent, date: String(date.getDate()).padStart(2, "0") })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-time">Horário</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-priority">Prioridade</Label>
                <Select
                  value={newEvent.priority}
                  onValueChange={(value) => setNewEvent({ ...newEvent, priority: value as Event["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="atencao">Atenção</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-color">Cor do Evento</Label>
                <Select value={newEvent.color} onValueChange={(value) => setNewEvent({ ...newEvent, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.value}`} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-brands">Marcas Envolvidas</Label>
                <Input
                  id="event-brands"
                  value={newEvent.brands?.join(", ") || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, brands: e.target.value.split(", ").filter(Boolean) })}
                  placeholder="Ex: Nike, Adidas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-influencers">Influenciadores</Label>
                <Input
                  id="event-influencers"
                  value={newEvent.influencers?.join(", ") || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, influencers: e.target.value.split(", ").filter(Boolean) })
                  }
                  placeholder="Ex: @influencer1, @influencer2"
                />
              </div>

              {newEvent.type === "reuniao" && (
                <div className="space-y-2">
                  <Label htmlFor="event-participants">Participantes</Label>
                  <Input
                    id="event-participants"
                    value={newEvent.participants?.join(", ") || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, participants: e.target.value.split(", ").filter(Boolean) })
                    }
                    placeholder="Ex: João, Maria, Pedro"
                  />
                </div>
              )}

              <div className="col-span-2 space-y-2">
                <Label htmlFor="event-description">Descrição</Label>
                <Textarea
                  id="event-description"
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Detalhes do evento..."
                />
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="event-repeats"
                    checked={newEvent.repeats || false}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, repeats: checked as boolean })}
                  />
                  <Label htmlFor="event-repeats">Evento se repete</Label>
                </div>

                {newEvent.repeats && (
                  <div className="space-y-2">
                    <Label htmlFor="repeat-type">Frequência de Repetição</Label>
                    <Select
                      value={newEvent.repeatType}
                      onValueChange={(value) => setNewEvent({ ...newEvent, repeatType: value as Event["repeatType"] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEditEvent(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!editingEvent || selectedMonth === null) return

                  const updatedMonthsData = [...monthsData]
                  const eventIndex = updatedMonthsData[selectedMonth].events.findIndex((e) => e.id === editingEvent.id)

                  if (eventIndex !== -1) {
                    updatedMonthsData[selectedMonth].events[eventIndex] = {
                      ...editingEvent,
                      ...newEvent,
                    }
                    setMonthsData(updatedMonthsData)
                  }

                  setShowEditEvent(false)
                  setEditingEvent(null)
                  setNewEvent({ type: "reuniao", priority: "normal", repeats: false, color: "bg-blue-500" })
                }}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* <Dialog open={showConfirmEdit} onOpenChange={setShowConfirmEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Alterações</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Tem certeza que deseja salvar as alterações no evento "{editingEvent?.name}"?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowConfirmEdit(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmEdit} className="gap-2">
                <Check className="h-4 w-4" />
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o evento "{deletingEvent?.name}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}

        {/* Enhanced Add Event Dialog for Month View */}
        <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Evento</DialogTitle>
            </DialogHeader>
            {/* Same enhanced form as in year view */}
            <div className="grid grid-cols-2 gap-4">
              {/* Same enhanced form fields */}
              <div className="space-y-2">
                <Label htmlFor="event-name">Nome do Evento</Label>
                <Input
                  id="event-name"
                  value={newEvent.name || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder="Ex: Reunião de Equipe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-type">Tipo</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value as Event["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feriado">Feriado</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="publicidade">Publicidade</SelectItem>
                    <SelectItem value="aprovacao">Aprovação</SelectItem>
                    <SelectItem value="especial">Dia Especial</SelectItem>
                    <SelectItem value="evento-presencial">Evento Presencial</SelectItem>
                    <SelectItem value="evento-online">Evento Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newEvent.type === "reuniao" && (
                <div className="space-y-2">
                  <Label htmlFor="event-subtype">Tipo de Reunião</Label>
                  <Select
                    value={newEvent.subtype}
                    onValueChange={(value) => setNewEvent({ ...newEvent, subtype: value as Event["subtype"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reuniao-equipe">Reunião da Equipe</SelectItem>
                      <SelectItem value="reuniao-influencer">Reunião com Influencer</SelectItem>
                      <SelectItem value="reuniao-marca">Reunião com Marca</SelectItem>
                      <SelectItem value="reuniao-estrategica">Reunião Estratégica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(newEvent.type === "evento-presencial" || newEvent.type === "evento-online") && (
                <div className="space-y-2">
                  <Label htmlFor="event-location">
                    {newEvent.type === "evento-presencial" ? "Local" : "Link/Plataforma"}
                  </Label>
                  <Input
                    id="event-location"
                    value={newEvent.location || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder={newEvent.type === "evento-presencial" ? "Ex: Centro de Convenções" : "Ex: Zoom, Teams"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="event-date">Data</Label>
                {/* Updated date formatting in Popover to use custom function */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        if (date) {
                          setNewEvent({ ...newEvent, date: String(date.getDate()).padStart(2, "0") })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-time">Horário</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-priority">Prioridade</Label>
                <Select
                  value={newEvent.priority}
                  onValueChange={(value) => setNewEvent({ ...newEvent, priority: value as Event["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="atencao">Atenção</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-color">Cor do Evento</Label>
                <Select value={newEvent.color} onValueChange={(value) => setNewEvent({ ...newEvent, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.value}`} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-brands">Marcas Envolvidas</Label>
                <Input
                  id="event-brands"
                  value={newEvent.brands?.join(", ") || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, brands: e.target.value.split(", ").filter(Boolean) })}
                  placeholder="Ex: Nike, Adidas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-influencers">Influenciadores</Label>
                <Input
                  id="event-influencers"
                  value={newEvent.influencers?.join(", ") || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, influencers: e.target.value.split(", ").filter(Boolean) })
                  }
                  placeholder="Ex: @influencer1, @influencer2"
                />
              </div>

              {newEvent.type === "reuniao" && (
                <div className="space-y-2">
                  <Label htmlFor="event-participants">Participantes</Label>
                  <Input
                    id="event-participants"
                    value={newEvent.participants?.join(", ") || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, participants: e.target.value.split(", ").filter(Boolean) })
                    }
                    placeholder="Ex: João, Maria, Pedro"
                  />
                </div>
              )}

              <div className="col-span-2 space-y-2">
                <Label htmlFor="event-description">Descrição</Label>
                <Textarea
                  id="event-description"
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Detalhes do evento..."
                />
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="event-repeats"
                    checked={newEvent.repeats || false}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, repeats: checked as boolean })}
                  />
                  <Label htmlFor="event-repeats">Evento se repete</Label>
                </div>

                {newEvent.repeats && (
                  <div className="space-y-2">
                    <Label htmlFor="repeat-type">Frequência de Repetição</Label>
                    <Select
                      value={newEvent.repeatType}
                      onValueChange={(value) => setNewEvent({ ...newEvent, repeatType: value as Event["repeatType"] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddEvent}>Adicionar Evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return null
}
