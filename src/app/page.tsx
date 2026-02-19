'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  url: string;
  coverImageUrl?: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20"
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

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                      {event.description.replace(/<[^>]*>?/gm, '')}
                    </p>
                  )}

                  {/* Universe Embed Link */}
                  <a
                    href={event.url}
                    className="uni-embed inline-flex items-center justify-center w-full rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xs hover:from-indigo-400 hover:to-cyan-400 hover:scale-[1.02] transition-all duration-200"
                  >
                    View Details & Book
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
