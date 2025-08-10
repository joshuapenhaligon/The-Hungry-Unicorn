// src/pages/HomePage.tsx
import { Link } from 'react-router-dom'
import img1 from '../images/placeholder-1.jpg'
import img2 from '../images/placeholder-2.jpg'
import img3 from '../images/placeholder-3.jpg'
import img4 from '../images/placeholder-4.jpg'
import img5 from '../images/placeholder-5.jpg'
import img6 from '../images/placeholder-6.jpg'

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        
        {/* dreamy background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* lighter blobs */}
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-pink-100 blur-3xl opacity-50" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-100 blur-3xl opacity-50" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 text-center">
          {/* new frosted panel */}
          <div className="mx-auto max-w-3xl rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-purple-100 shadow-sm p-8 sm:p-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-purple-950">
              Welcome to <span className="whitespace-nowrap">The Hungry Unicorn</span> 🦄
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-purple-900/95 max-w-2xl mx-auto">
              Where every bite is magical. Book your table and step into a world of sparkle &amp; flavour.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/availability"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-pink-600 to-purple-700 hover:shadow-lg"
              >
                View Availability
              </Link>
              <Link
                to="/lookup"
                className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold !text-purple-900 bg-pink-300 shadow-sm
                          hover:bg-purple-700 hover:!text-white hover:shadow-md
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                Manage My Booking
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Image band – placeholders now, swap to real images later */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-purple-950 mb-4">A peek at the magic</h2>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              src: img1,
              alt: 'Starlight Cupcake with glittering frosting',
              title: 'Starlight Cupcake',
              subtitle: 'Vanilla cloud frosting & edible glitter',
            },
            {
              src: img2,
              alt: 'Prismatic Jelly terrine in rainbow layers',
              title: 'Prismatic Jelly',
              subtitle: 'Rainbow layers with lychee pearls',
            },
            {
              src: img3,
              alt: 'Aurora Spaghetti with vibrant sauce',
              title: 'Aurora Spaghetti',
              subtitle: 'Beetroot cream & parmesan snow',
            },
            {
              src: img4,
              alt: 'Celestial Margherita pizza with basil',
              title: 'Celestial Margherita',
              subtitle: 'Heirloom constellations & basil',
            },
            {
              src: img5,
              alt: 'Moonlit Sirloin steak with truffle jus',
              title: 'Moonlit Sirloin',
              subtitle: 'Charred shallot & truffle jus',
            },
            {
              src: img6,
              alt: 'Unicorn Fizz sparkling drink',
              title: 'Unicorn Fizz',
              subtitle: 'Berry sparkle & citrus mist',
            },
          ].map((p, i) => (
            <figure
              key={i}
              className="rounded-2xl overflow-hidden border border-purple-100 shadow-sm bg-white"
            >
              {/* 4:3 aspect ratio box */}
              <div className="relative pt-[66%]">
                <img
                  src={p.src}
                  alt={p.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  width={1200}
                  height={900}
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/85 via-white/60 to-transparent backdrop-blur-sm px-3 py-2">
                  <p className="text-sm font-semibold text-purple-950">{p.title}</p>
                  <p className="text-xs text-gray-700">{p.subtitle}</p>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </section>



      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Enchanting Dining"
            text="Seasonal menus with whimsical twists — perfect for date nights and celebrations."
            icon="✨"
          />
          <FeatureCard
            title="Family Friendly"
            text="High chairs, share plates, and mocktails the little unicorns will love."
            icon="🧁"
          />
          <FeatureCard
            title="Central Location"
            text="A short trot from the station. Easy access and late-night vibes."
            icon="📍"
          />
        </div>
      </section>

      {/* Opening hours + capacity */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-purple-100 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-purple-900">Opening Hours</h2>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li className="flex justify-between"><span>Mon–Thu</span><span>12:00–14:00, 19:00–21:00</span></li>
              <li className="flex justify-between"><span>Fri</span><span>12:00–14:30, 19:00–22:00</span></li>
              <li className="flex justify-between"><span>Sat</span><span>12:00–15:00, 18:30–22:00</span></li>
              <li className="flex justify-between"><span>Sun</span><span>12:00–15:00</span></li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Kitchen closes 15 minutes before end of service.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-100 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-purple-900">About Your Visit</h2>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>• Tables up to <strong>8 guests</strong> per slot</li>
              <li>• We happily accommodate <strong>special requests</strong></li>
              <li>• <strong>24h cancellation</strong> appreciated</li>
              <li>• Wheelchair accessible</li>
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/availability"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg"
              >
                Book a Table
              </Link>
              {/* darker text + stronger background for contrast */}
              <Link
                to="/lookup"
                className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold !text-purple-900 bg-pink-300 shadow-sm
                          hover:bg-purple-700 hover:!text-white hover:shadow-md
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                Manage Booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer-ish CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-900">
          Ready to experience the magic?
        </h3>
        <p className="mt-2 text-purple-800">Check live availability and reserve in under a minute.</p>
        <Link
          to="/availability"
          className="mt-6 inline-block px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg"
        >
          Find a Table
        </Link>
      </section>
    </main>
  )
}

function FeatureCard({
  title,
  text,
  icon,
}: {
  title: string
  text: string
  icon: string
}) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl leading-none">
        <span className="emoji select-none" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold text-purple-950">{title}</h3>
      <p className="mt-1 text-gray-700">{text}</p>
    </div>
  )
}
