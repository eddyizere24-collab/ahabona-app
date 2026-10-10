import React, { useState } from 'react';
import { Search, Users, Briefcase, Award, ShieldCheck, ArrowRight, Menu, X, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    { id: 1, title: 'Ubwubatsi n’Ibigenerana', category: 'Fundi & Abafundi', count: '120+ experts' },
    { id: 2, title: 'Ikoranabuhanga & Design', category: 'Web & Mobile Dev', count: '85+ experts' },
    { id: 3, title: 'Umutekano & Isuku', category: 'Professional Services', count: '200+ experts' },
    { id: 4, title: 'Ubwalimu & Amahugurwa', category: 'Tutors & Coaches', count: '50+ experts' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-emerald-700 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white text-emerald-700 font-bold text-xl rounded-xl flex items-center justify-center shadow">
              A
            </div>
            <span className="font-extrabold text-2xl tracking-wide">AHABONA</span>
          </div>

          <div className="hidden md:flex space-x-8 font-medium">
            <a href="#home" className="hover:text-emerald-200 transition">Ahabanza</a>
            <a href="#services" className="hover:text-emerald-200 transition">Serivisi</a>
            <a href="#about" className="hover:text-emerald-200 transition">Abo tURI bo</a>
            <a href="#contact" className="hover:text-emerald-200 transition">Twandikire</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-emerald-100 hover:text-white font-medium">Kwinjira</button>
            <button className="px-5 py-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-lg shadow transition">
              Kwiyandikisha
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 focus:outline-none">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-emerald-800 px-4 pt-2 pb-4 space-y-3">
            <a href="#home" className="block py-2 text-white font-medium">Ahabanza</a>
            <a href="#services" className="block py-2 text-emerald-100">Serivisi</a>
            <a href="#about" className="block py-2 text-emerald-100">Abo tURI bo</a>
            <a href="#contact" className="block py-2 text-emerald-100">Twandikire</a>
            <div className="pt-2 border-t border-emerald-600 flex flex-col space-y-2">
              <button className="w-full py-2 text-center text-white font-medium">Kwinjira</button>
              <button className="w-full py-2 bg-white text-emerald-700 font-bold rounded-lg">Kwiyandikisha</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-emerald-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="bg-emerald-800 text-emerald-200 text-sm font-semibold px-4 py-1.5 rounded-full inline-block">
            Urubuga rwa Mbere rwo Guhuza Abantu n'Amahirwe
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Garagaza Ubushobozi Bwawe, Ubone Abagukeneye.
          </h1>
          <p className="text-lg sm:text-xl text-emerald-100 max-w-3xl mx-auto">
            AHABONA ihuza abafite ubumenyi n'abakeneye serivisi ziteguye ku buryo bwizewe, bwihuse kandi bweruye.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex items-center space-x-2 text-slate-800 mt-8">
            <Search className="text-slate-400 ml-3" size={24} />
            <input
              type="text"
              placeholder="Shaka serivisi, fundi, umwuga..."
              className="w-full py-3 px-2 focus:outline-none text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center space-x-2 transition">
              <span>Shakisha</span>
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Serivisi n'Ubumenyi Bwakorewe ku Urubuga</h2>
          <p className="text-slate-600 mt-2">Hitamo icyiciro cy'amahirwe cyangwa icy'abafite ubumenyi wifuza</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4 font-bold">
                <Briefcase size={24} />
              </div>
              <h3 className="font-bold text-xl text-slate-900">{service.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{service.category}</p>
              <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {service.count}
                </span>
                <ArrowRight size={18} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Abo tURI bo</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-4">
              Kubaka Umuryango w'Abantu Bafite Intego Imwe
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              AHABONA igamije gukemura ikibazo cyo guhuza abantu bafite ubushobozi n'abantu babukeneye. Twubaka umuryango ushingiye ku kwizerana, ubunyangamugayo n'agaciro k'umurimo.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-emerald-600" size={20} />
                <span className="font-medium text-slate-700">Abakozi n'abafundi bagenzuwe neza</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-emerald-600" size={20} />
                <span className="font-medium text-slate-700">Umutekano w'amakarita n'uburyo bwo kwishyura</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-emerald-600" size={20} />
                <span className="font-medium text-slate-700">Kwipimisha no gukura buhoro buhoro</span>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center">
            <ShieldCheck size={64} className="text-emerald-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Icyizere n'Umutekano</h3>
            <p className="text-slate-600 text-sm">
              Intego yacu si uguhuza gusa, ahubwo ni ukubaka ejo hazaza habazwe neza buri muntu wese afite icyizere ku murimo we.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-emerald-500 text-slate-900 font-extrabold rounded-lg flex items-center justify-center">A</div>
              <span>AHABONA</span>
            </div>
            <p className="text-sm text-slate-400">
              Guhuza ubushobozi n'amahirwe mu buryo bwizewe kandi buzwe.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Ibyerekeye Urubuga</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="hover:text-white">Ahabanza</a></li>
              <li><a href="#services" className="hover:text-white">Serivisi</a></li>
              <li><a href="#about" className="hover:text-white">Abo tURI bo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Twandikire</h4>
            <div className="space-y-2 text-sm">
              <p className="flex items-center space-x-2"><Mail size={16} /> <span>info@ahabona.rw</span></p>
              <p className="flex items-center space-x-2"><Phone size={16} /> <span>+250 780 000 000</span></p>
              <p className="flex items-center space-x-2"><MapPin size={16} /> <span>Kigali, Rwanda</span></p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} AHABONA Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
     }
            
