import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Vinyl } from '../../mockData';

interface ItemDetailsProps {
  vinyls: Vinyl[];
  onAddToCart: (product: Vinyl, quantity?: number) => void;
}

export default function ItemDetails({ vinyls, onAddToCart }: ItemDetailsProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const vinyl = vinyls.find(v => v.id === id);

  if (!vinyl) {
    return (
      <div className="py-16 text-center text-faded-olive/60 font-sans">
        <p className="font-serif text-lg font-bold text-vinyl-black">Disco não encontrado</p>
        <Link to="/" className="mt-4 inline-block text-warm-amber hover:underline font-bold text-sm">
          Voltar para a Loja
        </Link>
      </div>
    );
  }

  // Simulated Tracklist and description based on vinyl album
  const getAlbumDetails = (title: string) => {
    switch (title) {
      case 'The Dark Side of the Moon':
        return {
          description: 'Lançado em 1973, este é um dos álbuns mais influentes e aclamados da história do rock progressivo. Uma obra conceitual que explora temas como cobiça, tempo, morte e loucura. Clássico absoluto com encarte icônico do prisma refletor.',
          tracks: {
            sideA: ['Speak to Me', 'Breathe', 'On the Run', 'Time', 'The Great Gig in the Sky'],
            sideB: ['Money', 'Us and Them', 'Any Colour You Like', 'Brain Damage', 'Eclipse']
          }
        };
      case 'Kind of Blue':
        return {
          description: 'Gravado em apenas duas sessões em 1959, Kind of Blue é amplamente considerado o álbum de jazz definitivo e o mais vendido de todos os tempos. Miles Davis apresenta o jazz modal com improvisações lendárias de John Coltrane e Bill Evans.',
          tracks: {
            sideA: ['So What', 'Freddie Freeloader', 'Blue in Green'],
            sideB: ['All Blues', 'Flamenco Sketches']
          }
        };
      case 'Abbey Road':
        return {
          description: 'O último álbum gravado pelos Beatles (embora Let It Be tenha sido lançado depois). Célebre por sua clássica foto de capa atravessando a faixa de pedestres e pelo medley memorável que ocupa a maior parte do Lado B.',
          tracks: {
            sideA: ['Come Together', 'Something', 'Maxwell\'s Silver Hammer', 'Oh! Darling', 'Octopus\'s Garden', 'I Want You (She\'s So Heavy)'],
            sideB: ['Here Comes the Sun', 'Because', 'You Never Give Me Your Money', 'Sun King', 'Mean Mr. Mustard', 'Polythene Pam', 'She Came In Through the Bathroom Window', 'Golden Slumbers', 'Carry That Weight', 'The End']
          }
        };
      case 'Random Access Memories':
        return {
          description: 'Uma homenagem brilhante à dance music e ao pop dos anos 70/80. Daft Punk une sintetizadores analógicos com músicos de sessão ao vivo para criar uma obra tátil, rica e incrivelmente bem masterizada para o formato vinil duplo.',
          tracks: {
            sideA: ['Give Life Back to Music', 'The Game of Love', 'Giorgio by Moroder'],
            sideB: ['Within', 'Instant Crush', 'Lose Yourself to Dance'],
            sideC: ['Touch', 'Get Lucky', 'Beyond'],
            sideD: ['Motherboard', 'Fragments of Time', 'Doin\' It Right', 'Contact']
          }
        };
      case 'Rumours':
        return {
          description: 'Gravado sob intensas tensões de relacionamentos internos, Rumours gerou uma torrente de hits perfeitos e arranjos folk-rock marcantes. Masterização impecável que destaca a tátil percussão de Mick Fleetwood.',
          tracks: {
            sideA: ['Second Hand News', 'Dreams', 'Never Going Back Again', 'Don\'t Stop', 'Go Your Own Way', 'Songbird'],
            sideB: ['The Chain', 'You Make Loving Fun', 'I Don\'t Want to Know', 'Oh Daddy', 'Gold Dust Woman']
          }
        };
      case 'Thriller':
        return {
          description: 'O álbum mais vendido de todos os tempos, unindo pop, rock e funk de forma genial com a produção impecável de Quincy Jones. Edição essencial para audições analógicas pulsantes.',
          tracks: {
            sideA: ['Wanna Be Startin\' Somethin\'', 'Baby Be Mine', 'The Girl Is Mine', 'Thriller'],
            sideB: ['Beat It', 'Billie Jean', 'Human Nature', 'P.Y.T. (Pretty Young Thing)', 'The Lady in My Life']
          }
        };
      default:
        return {
          description: 'Edição premium em vinil de alta fidelidade de 180 gramas. Capa dupla e masterização analógica direta das fitas originais.',
          tracks: {
            sideA: ['Faixa 1', 'Faixa 2', 'Faixa 3'],
            sideB: ['Faixa 4', 'Faixa 5', 'Faixa 6']
          }
        };
    }
  };

  const albumDetails = getAlbumDetails(vinyl.title);

  return (
    <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-12 shadow-sm text-left font-sans space-y-8 animate-in fade-in duration-200">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold text-faded-olive hover:text-vinyl-black transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Album Artwork (Tacit spinning vinyl layout) */}
        <div className="relative pt-[100%] md:pt-0 md:h-[400px] w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-faded-olive/20 select-none">
          <img
            src={vinyl.coverUrl}
            alt={vinyl.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Product Details info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-faded-olive/10 text-faded-olive border border-faded-olive/20 font-bold text-xs uppercase tracking-widest">
              {vinyl.genre}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-vinyl-black mt-2 leading-tight">
              {vinyl.title}
            </h2>
            <p className="text-lg font-bold text-faded-olive">{vinyl.artist}</p>
          </div>

          <p className="text-sm text-faded-olive/80 leading-relaxed">
            {albumDetails.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs py-4 border-y border-faded-olive/10">
            <div>
              <span className="text-faded-olive/60 block">Ano de Lançamento</span>
              <span className="font-bold text-vinyl-black">{vinyl.year}</span>
            </div>
            <div>
              <span className="text-faded-olive/60 block">Status de Estoque</span>
              <span className={`font-bold ${vinyl.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {vinyl.stock > 0 ? `${vinyl.stock} unidades disponíveis` : 'Esgotado'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-xs text-faded-olive/60 block">Preço Unitário</span>
              <span className="text-3xl font-bold text-warm-amber">
                R$ {vinyl.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center border border-faded-olive/30 rounded-xl overflow-hidden bg-paper-white" data-cy="quantity-selector-details">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-xs text-faded-olive hover:bg-faded-olive/10 border-none cursor-pointer"
                  data-cy="btn-decrease-qty"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-vinyl-black select-none" data-cy="input-qty-value">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(vinyl.stock, q + 1))}
                  disabled={quantity >= vinyl.stock}
                  className="px-3 py-2 text-xs text-faded-olive hover:bg-faded-olive/10 border-none disabled:opacity-40 cursor-pointer"
                  data-cy="btn-increase-qty"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => onAddToCart(vinyl, quantity)}
                disabled={vinyl.stock <= 0}
                className="flex-1 sm:flex-initial py-3 px-6 font-bold uppercase tracking-wider text-xs rounded-xl bg-warm-amber hover:bg-warm-amber/90 text-paper-white border-none shadow-[0_4px_16px_rgba(217,119,36,0.3)] transition hover:scale-105 active:scale-95 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:scale-100 disabled:shadow-none cursor-pointer text-center"
                data-cy="btn-add-to-cart"
              >
                {vinyl.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Tracklist Block */}
      <div className="border-t border-faded-olive/10 pt-8 space-y-4">
        <h3 className="font-serif font-bold text-xl text-vinyl-black">Lista de Faixas (Tracklist)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Side A */}
          <div className="space-y-2.5">
            <h4 className="font-bold uppercase tracking-widest text-faded-olive border-b border-faded-olive/15 pb-1">Lado A</h4>
            <ol className="list-decimal pl-4 space-y-2 text-vinyl-black">
              {albumDetails.tracks.sideA.map((t, idx) => (
                <li key={idx} className="font-medium">{t}</li>
              ))}
            </ol>
          </div>

          {/* Side B */}
          <div className="space-y-2.5">
            <h4 className="font-bold uppercase tracking-widest text-faded-olive border-b border-faded-olive/15 pb-1">Lado B</h4>
            <ol className="list-decimal pl-4 space-y-2 text-vinyl-black">
              {albumDetails.tracks.sideB.map((t, idx) => (
                <li key={idx} className="font-medium">{t}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

    </div>
  );
}
