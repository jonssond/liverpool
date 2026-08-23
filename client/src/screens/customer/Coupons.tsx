import type { Coupon } from '../../mockData';

interface CouponsProps {
  coupons: Coupon[];
}

export default function Coupons({ coupons }: CouponsProps) {
  const promoCoupons = coupons.filter(c => c.type === 'promocional');
  const exchangeCoupons = coupons.filter(c => c.type === 'troca');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left font-sans">
      
      {/* Exchange Coupons */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="font-serif font-bold text-xl text-vinyl-black mb-6 flex justify-between items-center">
          <span>Seus Cupons de Troca</span>
          <svg className="w-6 h-6 text-faded-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </h3>

        {exchangeCoupons.length === 0 ? (
          <p className="text-xs text-faded-olive/60 py-6 text-center">Você não possui cupons de troca ativos.</p>
        ) : (
          <div className="space-y-4">
            {exchangeCoupons.map(cp => (
              <div 
                key={cp.id} 
                className={`p-4 rounded-2xl border flex justify-between items-center ${
                  cp.active 
                    ? 'border-warm-amber bg-warm-amber/5' 
                    : 'border-faded-olive/10 bg-neutral-100 opacity-60'
                }`}
              >
                <div>
                  <span className="text-xs font-mono font-bold text-vinyl-black bg-paper-white border border-faded-olive/30 px-2.5 py-1 rounded-md">
                    {cp.code}
                  </span>
                  <p className="text-[10px] text-faded-olive/80 mt-2">Origem: Devolução de Mercadoria</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-warm-amber">R$ {cp.value.toFixed(2)}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    cp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {cp.active ? 'Disponível' : 'Utilizado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promotional Coupons */}
      <div className="bg-white/80 border border-faded-olive/20 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="font-serif font-bold text-xl text-vinyl-black mb-6 flex justify-between items-center">
          <span>Cupons Promocionais da Loja</span>
          <svg className="w-6 h-6 text-faded-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </h3>

        {promoCoupons.length === 0 ? (
          <p className="text-xs text-faded-olive/60 py-6 text-center">Nenhum cupom promocional disponível.</p>
        ) : (
          <div className="space-y-4">
            {promoCoupons.map(cp => (
              <div 
                key={cp.id} 
                className="p-4 rounded-2xl border border-faded-olive/20 bg-transparent flex justify-between items-center"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-vinyl-black bg-paper-white border border-faded-olive/30 px-2.5 py-1 rounded-md">
                    {cp.code}
                  </span>
                  <p className="text-[10px] text-faded-olive/80 mt-2">Campanha: Liverpool Boas-Vindas</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-faded-olive">R$ {cp.value.toFixed(2)}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
