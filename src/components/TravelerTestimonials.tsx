import React from 'react';
import { Star, Quote } from 'lucide-react';

export const TravelerTestimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Delhi',
      tripTag: '5-Day Himachal Pine Valley Trail',
      avatar: '/src/assets/images/avatar_priya_sharma_1792467361468.jpg',
      quote:
        'Voyan transformed a vague idea of a mountain getaway into a flawless 5-day itinerary through Himachal pine valleys under ₹7,000. It uncovered authentic homestays I would never have found elsewhere.',
      rating: 5,
    },
    {
      name: 'Arjun Mehta',
      location: 'Bengaluru',
      tripTag: '7-Day South India & Kerala Backwaters',
      avatar: '/src/assets/images/avatar_arjun_mehta_1792467359732.jpg',
      quote:
        'Planning our family trip to Kerala with kids used to feel overwhelming. Voyan balanced our Alleppey houseboat booking and spice plantation walks with zero backtracking. Truly thoughtful planning.',
      rating: 5,
    },
    {
      name: 'Sneha Patel',
      location: 'Mumbai',
      tripTag: '3-Day Royal Heritage Trail in Rajasthan',
      avatar: '/src/assets/images/avatar_sneha_patel_1792467402425.jpg',
      quote:
        'The conversational AI modification is magical. I asked it to swap crowded bazaar hours for sunrise stepwells and traditional vegetarian thali places, and it adjusted the entire day instantly.',
      rating: 5,
    },
  ];

  return (
    <section id="traveler-testimonials" className="py-16 sm:py-24 bg-[#FBFBFA] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Deep Teal Accent Indicator */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Verified Journeys</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
            What Our Travelers Say
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600">
            Real stories from mindful explorers across India who planned their adventures with Voyan.
          </p>
        </div>

        {/* 3 Short Impactful Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-xs hover:border-teal-700/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
            >
              {/* Subtle Deep Teal Decorative Quote Accent */}
              <div className="text-teal-800/15 group-hover:text-teal-800/25 transition-colors absolute top-5 right-5 pointer-events-none">
                <Quote className="w-9 h-9" />
              </div>

              <div>
                {/* Rating Stars with Deep Teal & Amber Tint */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="text-xs font-bold text-teal-900 ml-1.5 tabular-nums">
                    5.0
                  </span>
                </div>

                {/* Quote Body */}
                <p className="text-sm text-stone-700 leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Footer with Avatar & Deep Teal Details */}
              <div className="pt-4 border-t border-stone-100 flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border-2 border-teal-700/20 shadow-xs"
                    onError={(e) => {
                      // Fallback avatar if ever interrupted
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="w-11 h-11 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center -z-10 absolute inset-0">
                    {item.name.charAt(0)}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#0F172A] tracking-tight">
                    {item.name}
                  </div>
                  <div className="text-xs text-stone-500 font-medium truncate">
                    {item.location}
                  </div>
                  <div className="text-[11px] font-semibold text-teal-800 truncate mt-0.5">
                    {item.tripTag}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
