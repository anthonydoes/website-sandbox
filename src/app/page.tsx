'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Ticket } from 'lucide-react';

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

        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400"
          >
            Discover Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-gray-300"
          >
            Find your next unforgettable experience powered by Universe API. Seamlessly book tickets directly on our platform.
          </motion.p>
        </div>
      </section>

      {/* Events Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
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
                    {/* Universe Embed Link */}
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
        )}
      </section>

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
