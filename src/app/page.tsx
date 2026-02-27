'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Ticket, LayoutGrid, List, CalendarDays, ChevronLeft, ChevronRight, IdCard, Accessibility, ChevronDown } from 'lucide-react';

interface TimeSlot {
  startAt: string;
  endAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  url: string;
  coverImageUrl?: string;
  timeSlots?: TimeSlot[];
  ageLimit?: string;
  accessibilityDescription?: string;
  eventPhotoUrl?: string;
  additionalImages?: string[];
  minPrice?: number;
  maxPrice?: number;
  ticketsSold?: number;
  capacity?: number;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<{ date: Date, events: Event[] } | null>(null);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [galleryPage, setGalleryPage] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (events.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [events.length]);

  useEffect(() => {
    // Load the Universe Embed script dynamically
    const script = document.createElement('script');
    script.src = 'https://www.universe.com/embed2.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch Events from our API
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/universe/events');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to load events');

        setEvents(data.events || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const renderTimeSlots = (slots: TimeSlot[]) => {
    if (!slots || slots.length === 0) return null;

    if (slots.length === 1) {
      const start = new Date(slots[0].startAt);
      const end = new Date(slots[0].endAt);

      const startDateString = start.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
      const startTimeString = start.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit'
      });
      const endTimeString = end.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit'
      });

      return (
        <span className="text-sm text-[#717171]">
          <span className="text-[#222222] font-medium">{startDateString}</span> at {startTimeString} - {endTimeString}
        </span>
      );
    }

    // Multiple timeslots
    const sortedSlots = [...slots].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    const firstDate = new Date(sortedSlots[0].startAt);
    const lastDate = new Date(sortedSlots[sortedSlots.length - 1].startAt);

    const sameMonth = firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear();
    const sameYear = firstDate.getFullYear() === lastDate.getFullYear();

    let dateRangeStr = '';

    if (sameMonth) {
      if (firstDate.getDate() === lastDate.getDate()) {
        dateRangeStr = firstDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } else {
        dateRangeStr = `${firstDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${lastDate.getDate()}, ${firstDate.getFullYear()}`;
      }
    } else if (sameYear) {
      dateRangeStr = `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${firstDate.getFullYear()}`;
    } else {
      dateRangeStr = `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    return (
      <div className="flex flex-col gap-1 text-[#717171]">
        <span className="text-sm font-medium text-[#222222]">{dateRangeStr}</span>
        <span className="text-sm text-[var(--color-brand)]">Multiple timeslots available</span>
      </div>
    );
  };

  const formatPrice = (min?: number, max?: number) => {
    if (min === undefined || min === null) return 'Free';
    if (min === 0 && (max === 0 || max === undefined)) return 'Free';

    const fmt = (val: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);

    if (max && max > min) {
      return `${fmt(min)} - ${fmt(max)}`;
    }
    return fmt(min);
  };

  const getAvailabilityLabel = (sold?: number, capacity?: number) => {
    if (capacity === undefined || capacity === null || capacity === 0) return null;
    const ratio = (sold || 0) / capacity;
    if (ratio >= 1) return { label: 'Sold Out', color: 'text-gray-500' };
    if (ratio >= 0.8) return { label: 'Selling Fast', color: 'text-orange-600' };
    if (ratio >= 0.5) return { label: 'Limited Availability', color: 'text-amber-600' };
    return { label: 'Good Availability', color: 'text-emerald-600' };
  };

  if (!mounted) {
    return <main className="min-h-screen bg-white" />;
  }

  return (
    <main className="min-h-screen bg-white text-[#222222]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[var(--color-brand)] to-[#D90B38] flex items-center justify-center shadow-lg shadow-[var(--color-brand)]/20">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-linear-to-r from-[#222222] to-[#444444] bg-clip-text text-transparent">Great North Event Co.</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#demo" className="text-sm font-semibold text-[#222222] hover:text-[var(--color-brand)] transition-colors relative group">
              Demo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-brand)] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="/documentation" onClick={(e) => e.preventDefault()} className="text-sm font-semibold text-[#717171] hover:text-[#222222] transition-colors">
              Documentation
            </a>
            <a
              href="https://www.universe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full bg-[#222222] text-white text-sm font-bold hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
            >
              Universe
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-40 pb-24 sm:pt-52 sm:pb-32 lg:px-8 overflow-hidden bg-white">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--color-brand)] opacity-[0.08] blur-[100px] rounded-full" />
          <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-indigo-500 opacity-[0.05] blur-[120px] rounded-full -translate-y-1/2" />
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-25" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">


          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl font-black tracking-tighter sm:text-8xl text-[#222222] mb-8"
          >
            Elevate Your <span className="text-[var(--color-brand)]">Events.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl sm:text-2xl leading-relaxed text-[#717171] max-w-3xl mx-auto font-medium"
          >
            A high-performance demonstration of Universe's GraphQL API. Secure, scalable, and designed for teams who refuse to compromise on user experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-6"
          >
            <a
              href="#demo"
              className="shimmer-button px-10 py-5 rounded-2xl bg-[#222222] text-white font-bold text-lg hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
            >
              Explore Demo
            </a>
            <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <p className="hidden sm:block text-left text-sm text-[#717171] font-medium max-w-[180px]">
              Scroll down to see the real-time event integration in action.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hero Carousel */}
      {!loading && !error && events.length > 0 && (
        <section id="demo" className="mx-auto max-w-7xl px-6 lg:px-8 mb-16 scroll-mt-24">
          <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden group rounded-[2.5rem] border border-gray-200 shadow-2xl shadow-gray-200/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full bg-gray-100"
              >
                <div className="relative w-full h-full">
                  {events[currentSlide].coverImageUrl ? (
                    <img
                      src={events[currentSlide].coverImageUrl}
                      alt={events[currentSlide].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Ticket className="w-24 h-24 text-gray-400" />
                    </div>
                  )}

                  {/* Overlay Gradients */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute inset-0 flex items-end pb-12 sm:pb-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="max-w-2xl"
                      >
                        <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/30 shadow-xs">
                          Featured Event
                        </span>
                        <h2 className="text-4xl sm:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                          {events[currentSlide].title}
                        </h2>

                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={() => setSelectedEvent(events[currentSlide])}
                            className="px-8 py-4 rounded-xl bg-white text-[#222222] hover:bg-gray-50 font-semibold transition-all duration-200 shadow-sm"
                          >
                            More Info
                          </button>
                          <a
                            href={events[currentSlide].url}
                            className="uni-embed px-8 py-4 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-semibold transition-all duration-200 shadow-sm"
                          >
                            Get Tickets
                          </a>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="absolute bottom-8 right-8 flex gap-3 z-10">
              {events.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide
                    ? 'w-8 bg-white shadow-md shadow-black/20'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events View Controls */}
      <section className="mx-auto max-w-7xl px-6 mb-8 lg:px-8 flex justify-end">
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'grid'
              ? 'bg-white text-[#222222] shadow-sm'
              : 'text-gray-500 hover:text-[#222222]'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'list'
              ? 'bg-white text-[#222222] shadow-sm'
              : 'text-gray-500 hover:text-[#222222]'
              }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'calendar'
              ? 'bg-white text-[#222222] shadow-sm'
              : 'text-gray-500 hover:text-[#222222]'
              }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </section>

      {/* Events Display */}
      <section className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-96" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-8 rounded-2xl bg-red-400/10 border border-red-400/20">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-400">No events found for this host.</div>
        ) : (
          <div className="relative z-10">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-[16/9] w-full bg-gray-100 relative overflow-hidden">
                      {event.coverImageUrl ? (
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <Ticket className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {event.ageLimit && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[#222222] text-xs font-bold border border-white/20 shadow-lg">
                            {event.ageLimit}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 md:p-8 flex flex-col flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-[#222222] mb-3 line-clamp-2 leading-tight">
                        {event.title}
                      </h3>

                      {event.timeSlots && event.timeSlots.length > 0 && (
                        <div className="flex items-start gap-2 mb-3 text-[#717171]">
                          <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                          <div className="flex-1 text-sm font-medium">
                            {renderTimeSlots(event.timeSlots)}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#222222]">
                            {formatPrice(event.minPrice, event.maxPrice)}
                          </span>
                          {(() => {
                            const avail = getAvailabilityLabel(event.ticketsSold, event.capacity);
                            return avail && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${avail.color}`}>
                                {avail.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="flex-1 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#222222] hover:bg-gray-50 border border-gray-200 hover:border-gray-900 transition-colors"
                        >
                          More Info
                        </button>
                        <a
                          href={event.url}
                          className="uni-embed flex-1 inline-flex items-center justify-center rounded-xl bg-[var(--color-brand)] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-hover)] transition-colors"
                        >
                          Get Tickets
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <div className="flex flex-col gap-4">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-300 flex items-center p-4 md:p-6 gap-6"
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                      {event.coverImageUrl ? (
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Ticket className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[#222222] mb-2 truncate">
                        {event.title}
                      </h3>
                      {event.timeSlots && event.timeSlots.length > 0 && (
                        <div className="flex items-center gap-2 text-[#717171] mb-1">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <div className="text-sm">
                            {renderTimeSlots(event.timeSlots)}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#222222]">
                          {formatPrice(event.minPrice, event.maxPrice)}
                        </span>
                        {(() => {
                          const avail = getAvailabilityLabel(event.ticketsSold, event.capacity);
                          return avail && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${avail.color}`}>
                              • {avail.label}
                            </span>
                          );
                        })()}
                      </div>
                      {event.ageLimit && (
                        <div className="mt-2 text-xs font-bold text-[var(--color-brand)] uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                          {event.ageLimit}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[#222222] hover:bg-gray-50 border border-gray-200 hover:border-gray-900 transition-colors"
                      >
                        More Info
                      </button>
                      <a
                        href={event.url}
                        className="uni-embed inline-flex items-center justify-center rounded-xl bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-hover)] transition-colors"
                      >
                        Get Tickets
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-[#222222]">
                    {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-gray-600"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-gray-600"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-[1px] bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-50 py-3 text-center text-sm font-semibold text-[#717171]">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`blank-${i}`} className="bg-gray-50/50 h-32" />
                  ))}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayEvents = events.filter(event =>
                      event.timeSlots?.some(slot => {
                        const start = new Date(slot.startAt);
                        return start.getDate() === day &&
                          start.getMonth() === currentDate.getMonth() &&
                          start.getFullYear() === currentDate.getFullYear();
                      })
                    );

                    const displayEvents = dayEvents.slice(0, 2);
                    const remainingCount = dayEvents.length - displayEvents.length;

                    return (
                      <div key={day} className="bg-white h-32 p-2 flex flex-col gap-1 relative group hover:bg-gray-50 transition-colors">
                        <span className={`text-sm font-medium ${dayEvents.length > 0 ? 'text-[#222222]' : 'text-gray-400'}`}>
                          {day}
                        </span>
                        <div className="flex flex-col gap-1 overflow-hidden">
                          {displayEvents.map(event => (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className="text-[10px] sm:text-xs text-left px-1.5 py-1 rounded bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 text-[var(--color-brand)] truncate hover:bg-[var(--color-brand)]/20 transition-colors font-medium"
                            >
                              {event.title}
                            </button>
                          ))}
                          {remainingCount > 0 && (
                            <button
                              onClick={() => setSelectedDateEvents({ date: dayDate, events: dayEvents })}
                              className="text-[10px] sm:text-xs text-left px-1.5 py-1 rounded bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors font-medium"
                            >
                              + {remainingCount} more
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Expanded Day View Modal */}
      <AnimatePresence>
        {selectedDateEvents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedDateEvents(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-bold text-[#222222]">
                    {selectedDateEvents.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-[#717171] mt-1">{selectedDateEvents.events.length} events scheduled</p>
                </div>
                <button
                  onClick={() => setSelectedDateEvents(null)}
                  className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                {selectedDateEvents.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      {event.coverImageUrl ? (
                        <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Ticket className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#222222] truncate group-hover:text-[var(--color-brand)] transition-colors">{event.title}</h4>
                      <button
                        onClick={() => {
                          setSelectedDateEvents(null);
                          setSelectedEvent(event);
                        }}
                        className="text-xs text-[#717171] font-medium hover:text-[#222222] mt-1 underline"
                      >
                        View Full Details
                      </button>
                    </div>
                    <a
                      href={event.url}
                      className="uni-embed rounded-lg bg-[var(--color-brand)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--color-brand-hover)] transition-colors"
                    >
                      Tickets
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Details Modal overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => {
              setSelectedEvent(null);
              setIsAccessibilityOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setIsAccessibilityOpen(false);
                  setGalleryPage(0);
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Brand Icon (Top Left) */}
              {selectedEvent.eventPhotoUrl && (
                <div className="absolute top-4 left-4 z-20 border-2 border-white/30 rounded-full overflow-hidden shadow-xl backdrop-blur-md">
                  <img
                    src={selectedEvent.eventPhotoUrl}
                    alt="Event logo"
                    className="w-[100px] h-[100px] object-cover bg-white"
                  />
                </div>
              )}

              {/* Modal Cover Image */}
              <div className="w-full h-64 sm:h-80 relative shrink-0 bg-gray-100">
                {selectedEvent.coverImageUrl ? (
                  <img
                    src={selectedEvent.coverImageUrl}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Ticket className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
                  <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight flex-1">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="px-6 sm:px-8 pb-8 pt-6 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
                {selectedEvent.timeSlots && selectedEvent.timeSlots.length > 0 && (
                  <div className="flex items-start gap-3 mb-8 text-gray-900 bg-gray-100 p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <Calendar className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-brand)]" />
                    <div className="flex flex-col gap-1 w-full text-sm">
                      <span className="font-bold text-[#222222] text-lg mb-4">Event Details</span>
                      <div className="space-y-6">
                        {/* Row 1: Time & Date (Full width) */}
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-[#717171] uppercase tracking-widest">Time & Date</span>
                          <div className="text-[#222222]">
                            {renderTimeSlots(selectedEvent.timeSlots)}
                          </div>
                        </div>

                        {/* Row 2: Price and Availability (Two columns) */}
                        <div className="grid grid-cols-2 gap-6 border-t border-gray-200/50 pt-5">
                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-[#717171] uppercase tracking-widest">Pricing</span>
                            <span className="font-bold text-[#222222]">{formatPrice(selectedEvent.minPrice, selectedEvent.maxPrice)}</span>
                          </div>
                          {(() => {
                            const avail = getAvailabilityLabel(selectedEvent.ticketsSold, selectedEvent.capacity);
                            return avail && (
                              <div className="space-y-1">
                                <span className="block text-[10px] font-bold text-[#717171] uppercase tracking-widest">Availability</span>
                                <span className={`font-bold ${avail.color}`}>{avail.label}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent.ageLimit && (
                  <div className="flex items-center gap-3 mb-8 text-gray-900 bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <IdCard className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#222222] text-sm">Age Restriction</span>
                      <span className="text-gray-600 text-sm font-medium">{selectedEvent.ageLimit}</span>
                    </div>
                  </div>
                )}
                {selectedEvent.description && (
                  <div
                    className="description-content text-sm sm:text-base text-[#222222] mb-8"
                    dangerouslySetInnerHTML={{
                      __html: selectedEvent.description
                    }}
                  />
                )}

                {selectedEvent.accessibilityDescription && (
                  <div className="mb-8 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
                    <button
                      onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Accessibility className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-bold text-[#222222] text-sm">Accessibility Information</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isAccessibilityOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: isAccessibilityOpen ? 'auto' : 0, opacity: isAccessibilityOpen ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div
                          className="description-content text-sm leading-relaxed max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedEvent.accessibilityDescription }}
                        />
                      </div>
                    </motion.div>
                  </div>
                )}

                {selectedEvent.additionalImages && selectedEvent.additionalImages.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-[#717171] uppercase tracking-widest">Photo Gallery</h3>
                      {selectedEvent.additionalImages.length > 2 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryPage(prev => Math.max(0, prev - 1));
                            }}
                            disabled={galleryPage === 0}
                            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors border border-gray-100"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryPage(prev => Math.min(Math.ceil(selectedEvent.additionalImages!.length / 2) - 1, prev + 1));
                            }}
                            disabled={galleryPage >= Math.ceil(selectedEvent.additionalImages.length / 2) - 1}
                            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors border border-gray-100"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative overflow-hidden min-h-[120px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={galleryPage}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="grid grid-cols-2 gap-3 sm:gap-4"
                        >
                          {selectedEvent.additionalImages.slice(galleryPage * 2, galleryPage * 2 + 2).map((imageUrl, index) => (
                            <div
                              key={`${galleryPage}-${index}`}
                              className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 group cursor-zoom-in"
                              onClick={() => setFullScreenImage(imageUrl)}
                            >
                              <img
                                src={imageUrl}
                                alt={`${selectedEvent.title} gallery ${galleryPage * 2 + index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer (Sticky) */}
              <div className="p-6 sm:p-8 bg-white border-t border-gray-100 shrink-0 mt-auto">
                <a
                  href={selectedEvent.url}
                  className="uni-embed flex items-center justify-center w-full rounded-xl bg-[var(--color-brand)] px-8 py-4 text-base font-bold text-white shadow-md hover:bg-[var(--color-brand-hover)] transition-colors"
                >
                  Get Tickets
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
            onClick={() => setFullScreenImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setFullScreenImage(null)}
                className="absolute top-0 right-0 p-3 text-white/70 hover:text-white transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={fullScreenImage}
                alt="Full screen gallery"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
