'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Ticket, LayoutGrid, List, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    if (events.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 4000);
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
        <span className="text-sm text-gray-300">
          {startDateString} at {startTimeString} - {endTimeString}
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
      <div className="flex flex-col gap-1 text-gray-300">
        <span className="text-sm font-medium">{dateRangeStr}</span>
        <span className="text-sm text-indigo-400">Multiple timeslots available</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#050511] text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8 overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Universe API • Client Sandbox Environment
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400 whitespace-nowrap"
          >
            Great North Event Co.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-lg sm:text-xl leading-8 text-gray-400 max-w-2xl mx-auto"
          >
            Welcome to the un-official Universe client events website sandbox. Explore how our API enables you to seamlessly query, design, and orchestrate immersive event experiences directly within your own custom digital environments.
          </motion.p>
        </div>
      </section>

      {/* Hero Carousel */}
      {!loading && !error && events.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-8 mb-12">
          <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden group rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                <div className="relative w-full h-full">
                  {events[currentSlide].coverImageUrl ? (
                    <img
                      src={events[currentSlide].coverImageUrl}
                      alt={events[currentSlide].title}
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-900/50 flex items-center justify-center">
                      <Ticket className="w-24 h-24 text-white/20" />
                    </div>
                  )}

                  {/* Overlay Gradients */}
                  <div className="absolute inset-0 bg-linear-to-t from-[#050511] via-[#050511]/40 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-r from-[#050511]/80 via-transparent to-transparent" />

                  <div className="absolute inset-0 flex items-end pb-12 sm:pb-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="max-w-2xl"
                      >
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-semibold backdrop-blur-md">
                          Featured Event
                        </span>
                        <h2 className="text-4xl sm:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                          {events[currentSlide].title}
                        </h2>

                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={() => setSelectedEvent(events[currentSlide])}
                            className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 font-bold transition-all duration-200 hover:scale-[1.02]"
                          >
                            More Info
                          </button>
                          <a
                            href={events[currentSlide].url}
                            className="uni-embed px-8 py-4 rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 font-bold shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02]"
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
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide
                    ? 'w-10 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]'
                    : 'w-3 bg-white/20 hover:bg-white/40'
                    }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events View Controls */}
      <section className="mx-auto max-w-7xl px-6 mb-8 lg:px-8 flex justify-end">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'grid'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'list'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'calendar'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-gray-400 hover:text-white'
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
                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col"
                  >
                    <div className="aspect-[16/9] w-full bg-indigo-900/50 relative overflow-hidden">
                      {event.coverImageUrl ? (
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="object-cover w-full h-full opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center">
                          <Ticket className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2">
                        {event.title}
                      </h3>

                      {event.timeSlots && event.timeSlots.length > 0 && (
                        <div className="flex items-start gap-2 mb-6 text-gray-400">
                          <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                          <div className="flex-1">
                            {renderTimeSlots(event.timeSlots)}
                          </div>
                        </div>
                      )}

                      <div className="mt-auto flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="flex-1 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-white/20 hover:scale-[1.02] transition-all duration-200 border border-white/10"
                        >
                          More Info
                        </button>
                        <a
                          href={event.url}
                          className="uni-embed flex-1 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xs hover:from-indigo-400 hover:to-cyan-400 hover:scale-[1.02] transition-all duration-200"
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
                    className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 flex items-center p-4 md:p-6 gap-6 hover:border-indigo-500/30"
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-indigo-900/50 overflow-hidden shrink-0 border border-white/5">
                      {event.coverImageUrl ? (
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-500/20 to-cyan-500/20">
                          <Ticket className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-indigo-400 transition-colors">
                        {event.title}
                      </h3>
                      {event.timeSlots && event.timeSlots.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div className="truncate">
                            {renderTimeSlots(event.timeSlots)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="rounded-xl bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 border border-white/10 transition-all duration-200"
                      >
                        More Info
                      </button>
                      <a
                        href={event.url}
                        className="uni-embed inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
                      >
                        Get Tickets
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">
                    {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-[#0f1021] py-3 text-center text-sm font-semibold text-gray-400">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`blank-${i}`} className="bg-[#050511]/50 h-32" />
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
                      <div key={day} className="bg-[#0f1021] h-32 p-2 flex flex-col gap-1 border-t border-white/5 relative group hover:bg-white/[0.02] transition-colors">
                        <span className={`text-sm font-medium ${dayEvents.length > 0 ? 'text-indigo-400' : 'text-gray-500'}`}>
                          {day}
                        </span>
                        <div className="flex flex-col gap-1 overflow-hidden">
                          {displayEvents.map(event => (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className="text-[10px] sm:text-xs text-left px-1.5 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 truncate hover:bg-indigo-500/40 transition-colors"
                            >
                              {event.title}
                            </button>
                          ))}
                          {remainingCount > 0 && (
                            <button
                              onClick={() => setSelectedDateEvents({ date: dayDate, events: dayEvents })}
                              className="text-[10px] sm:text-xs text-left px-1.5 py-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors font-medium"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedDateEvents(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0f1021] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedDateEvents.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{selectedDateEvents.events.length} events scheduled</p>
                </div>
                <button
                  onClick={() => setSelectedDateEvents(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                {selectedDateEvents.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-indigo-900/50 overflow-hidden shrink-0">
                      {event.coverImageUrl ? (
                        <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-500/20 to-cyan-500/20">
                          <Ticket className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{event.title}</h4>
                      <button
                        onClick={() => {
                          setSelectedDateEvents(null);
                          setSelectedEvent(event);
                        }}
                        className="text-xs text-indigo-400 font-medium hover:text-indigo-300 mt-1"
                      >
                        View Full Details →
                      </button>
                    </div>
                    <a
                      href={event.url}
                      className="uni-embed rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[#0f1021] rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Cover Image */}
              <div className="w-full h-64 sm:h-80 relative shrink-0 bg-indigo-900/50">
                {selectedEvent.coverImageUrl ? (
                  <img
                    src={selectedEvent.coverImageUrl}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-500/30 to-purple-500/30">
                    <Ticket className="w-16 h-16 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-[#0f1021] via-[#0f1021]/60 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="px-6 sm:px-8 pb-8 pt-4 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
                {selectedEvent.timeSlots && selectedEvent.timeSlots.length > 0 && (
                  <div className="flex items-start gap-3 mb-8 text-indigo-300 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                    <Calendar className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-semibold text-white">Event Times</span>
                      {renderTimeSlots(selectedEvent.timeSlots)}
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div
                    className="description-content text-sm sm:text-base whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: selectedEvent.description
                    }}
                  />
                )}
              </div>

              {/* Modal Footer (Sticky) */}
              <div className="p-6 sm:p-8 bg-white/5 border-t border-white/10 shrink-0 mt-auto">
                <a
                  href={selectedEvent.url}
                  className="uni-embed flex items-center justify-center w-full rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg hover:from-indigo-400 hover:to-cyan-400 hover:scale-[1.02] transition-all duration-200"
                >
                  Get Tickets
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
