import { useState } from 'react';
import api from '@/src/api/client';

export default function SubscriptionPaywall({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payment/create-checkout');
      window.open(response.data.checkoutUrl, '_blank');
    } catch (error) {
      console.error('Failed to create checkout:', error);
      alert('Erro ao criar checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl max-w-lg w-full mx-4 animate-fade-in-up border border-purple-500/30">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Conteúdo Premium
          </h2>
          <p className="text-gray-400">
            Assine agora e tenha acesso ilimitado a todos os agentes de IA
          </p>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-4">Benefícios da Assinatura:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Acesso ilimitado a todos os agentes de IA</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Chat com histórico salvo permanentemente</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Análise e geração de imagens</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Geração de vídeos com IA</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Suporte prioritário</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-bold text-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Assinar Agora'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-4 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Voltar
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Pagamento processado via Cakto - plataforma 100% segura
        </p>
      </div>
    </div>
  );
}
