import React from 'react';
import { Star, Quote } from 'lucide-react';

export const TestimonialProof: React.FC = () => {
  const testimonials = [
    {
      quote:
        'I asked for a 3-day trip to Ooty under ₹5,000 for a weekend break. Voyan not only kept my total spend to ₹4,800 with colonial homestays, but also routed the Nilgiri toy train ride perfectly so we didn’t waste any daylight.',
      author: 'Ananya Deshmukh',
      role: 'Solo Backpacker · Bangalore',
      trip: '3-Day Ooty & Coonoor Valley',
      spend: '₹4,800 total'
    },
    {
      quote:
        'Planning our family trip to Kashmir usually took weeks of calls with local operators. Voyan mapped our Dal Lake Shikara sunrise, Gulmarg gondola slots, and Wazwan dinner spots in literally 10 seconds. Flawless execution.',
      author: 'Rohit & Meera Varma',
      role: 'Family Travelers · Mumbai',
      trip: '5-Day Kashmir Alpine Tour',
      spend: '₹23,000 for 2'
    },
    {
      quote:
        'The conversational AI modification is magical. I asked it to swap out crowded shopping streets in Jaipur for quiet architectural stepwells and vegetarian thali spots, and the entire daily schedule re-ordered seamlessly.',
      author: 'Karthik Sundaram',
      role: 'Architect & Heritage Enthusiast · Chennai',
      trip: '3-Day Royal Jaipur Trail',
      spend: '₹6,400 total'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-stone-50/60 border-t border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quantitative Proof Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 bg-white rounded-2xl border border-stone-200/90 shadow-xs mb-16 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-900 font-mono tabular-nums">
              12,400+
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">
              Journeys Planned Across India
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-900 font-mono tabular-nums">
              ₹4,200
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">
              Avg. Weekend Spend / Traveler
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-900 font-mono tabular-nums">
              4.9 / 5
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">
              Traveler Itinerary Accuracy
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-900 font-mono tabular-nums">
              &lt; 30 sec
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">
              Full AI Itinerary Generation
            </div>
          </div>
        </div>

        {/* Testimonials Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold text-teal-800 tracking-wider uppercase mb-1">
            Real Traveler Experiences
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Loved by modern travelers across India
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#0F172A]">{t.author}</div>
                  <div className="text-stone-500">{t.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-teal-900 font-semibold">{t.trip}</div>
                  <div className="text-stone-400 font-mono tabular-nums">{t.spend}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
