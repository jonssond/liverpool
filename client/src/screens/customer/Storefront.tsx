import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Vinyl } from '../../mockData';
import Button from '../../components/Button';

interface StorefrontProps {
  vinyls: Vinyl[];
  onAddToCart: (product: Vinyl) => void;
}

export default function Storefront({ vinyls, onAddToCart }: StorefrontProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');

  const genres = ['Todos', ...Array.from(new Set(vinyls.map(v => v.genre)))];

  const filteredVinyls = vinyls.filter(vinyl => {
    const matchesSearch =
      vinyl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vinyl.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'Todos' || vinyl.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-vinyl-black p-8 md:p-12 border border-faded-olive/20 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 text-left">
        <div className="space-y-4 max-w-xl">
          <span className="px-3.5 py-1 rounded-full bg-warm-amber/10 text-warm-amber border border-warm-amber/20 font-bold text-xs uppercase tracking-widest">
            Curadoria Exclusiva
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-paper-white leading-tight">
            Sinta a agulha tocar. Viva a música analógica.
          </h2>
          <p className="text-sm text-paper-white/70 leading-relaxed">
            Explore nossa seleção especial de discos de vinil clássicos e contemporâneos na Liverpool Discos. Qualidade sonora autêntica e encartes impecáveis.
          </p>
        </div>
        
        {/* Decorative spinning vinyl */}
        <div className="relative w-48 h-48 flex-shrink-0 select-none hidden md:block">
          <div className="w-full h-full rounded-full bg-black border border-neutral-800 flex items-center justify-center animate-[spin_8s_linear_infinite] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="w-[96%] h-[96%] rounded-full border border-neutral-900 border-dashed flex items-center justify-center">
              <div className="w-[85%] h-[85%] rounded-full border border-neutral-900 flex items-center justify-center">
                <div className="w-[70%] h-[70%] rounded-full border border-neutral-900 flex items-center justify-center">
                  <div className="w-[45%] h-[45%] rounded-full bg-warm-amber flex items-center justify-center text-[8px] text-paper-white font-bold">
                    LIVERPOOL
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-vinyl-black" />
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/75 p-4 rounded-2xl border border-faded-olive/20 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 text-left">
          <label className="text-xs font-bold text-faded-olive block mb-1">Pesquisar Catálogo</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por título ou artista..."
              className="w-full pl-10 pr-4 py-2 text-sm text-vinyl-black bg-paper-white border border-faded-olive/40 rounded-xl focus:outline-none focus:border-warm-amber transition placeholder-faded-olive/60"
            />
            <svg className="absolute left-3.5 top-3 w-4 h-4 text-faded-olive/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 justify-center pt-5">
          {genres.map(genre => (
            <Button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              variant={selectedGenre === genre ? 'secondary' : 'outline'}
              size="sm"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* Vinyl Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVinyls.map(vinyl => (
          <div
            key={vinyl.id}
            className="bg-white/75 border border-faded-olive/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between group"
          >
            {/* Cover photo (Link to details) */}
            <Link 
              to={`/item/${vinyl.id}`}
              className="relative pt-[100%] bg-black overflow-hidden select-none block"
            >
              <img
                src={vinyl.coverUrl}
                alt={vinyl.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-faded-olive text-paper-white uppercase tracking-wider">
                  {vinyl.genre}
                </span>
              </div>
              
              {/* Spinning record overlay on hover */}
              <div className="absolute inset-0 bg-vinyl-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 pointer-events-none">
                <div className="w-24 h-24 rounded-full bg-black border border-neutral-700 flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-lg">
                  <div className="w-8 h-8 rounded-full bg-warm-amber/60 border border-neutral-900" />
                </div>
              </div>
            </Link>

            {/* Content info */}
            <div className="p-6 text-left flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-serif font-bold text-vinyl-black text-xl leading-snug truncate hover:text-warm-amber transition">
                  <Link to={`/item/${vinyl.id}`}>{vinyl.title}</Link>
                </h4>
                <p className="text-sm text-faded-olive font-bold mt-1">
                  {vinyl.artist}
                </p>
                <div className="flex gap-4 text-xs text-faded-olive/60 mt-2">
                  <span>Ano: {vinyl.year}</span>
                  <span>Estoque: {vinyl.stock}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-faded-olive/10">
                <span className="text-2xl font-bold text-warm-amber font-sans">
                  R$ {vinyl.price.toFixed(2)}
                </span>
                
                <Button
                  onClick={() => onAddToCart(vinyl)}
                  disabled={vinyl.stock <= 0}
                  variant="primary"
                  size="sm"
                >
                  {vinyl.stock > 0 ? 'Comprar' : 'Esgotado'}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredVinyls.length === 0 && (
          <div className="col-span-full py-16 text-center text-faded-olive/60">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 font-serif text-lg font-bold text-vinyl-black">Nenhum vinil encontrado</p>
            <p className="text-xs mt-1">Experimente mudar o termo de busca ou gênero.</p>
          </div>
        )}
      </div>
    </div>
  );
}
