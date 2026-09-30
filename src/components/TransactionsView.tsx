import React, { useState } from 'react';
import { Transaction, Operator } from '../types';
import { OperatorLogo } from './OperatorBadge';
import { Search, Filter, CheckCircle2, Clock, AlertTriangle, ArrowRight, FileText, Download, X, Copy } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  operators: Operator[];
  onOpenSend: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  operators,
  onOpenSend
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter logic
  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.sourceNumber.includes(searchQuery) ||
      tx.destinationNumber.includes(searchQuery) ||
      tx.senderName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'COMPLETED') return tx.status === 'COMPLETED';
    if (filterStatus === 'PENDING') return tx.status === 'PROCESSING' || tx.status === 'PENDING_ADMIN_RECEPTION' || tx.status === 'RECEIVED_BY_INTERSEND';
    return true;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Effectué
          </span>
        );
      case 'PROCESSING':
      case 'PENDING_ADMIN_RECEPTION':
      case 'RECEIVED_BY_INTERSEND':
      case 'DISBURSING_TO_RECIPIENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            En cours (~2 min)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pb-24 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-2xl font-black text-[#001F54] font-display">
            Transactions
          </h2>
          <p className="text-xs text-[#001F54]/70">
            Historique de vos transferts inter-opérateurs
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSend}
          className="px-3 py-2 rounded-xl btn-cartoon-gold text-xs font-black cursor-pointer"
        >
          + Envoyer
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#001F54]/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par numéro, référence..."
          className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border-2 border-[#001F54] text-xs font-bold text-[#001F54] shadow-[2px_2px_0px_#001F54] focus:outline-none"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'Toutes' },
          { id: 'COMPLETED', label: 'Effectuées' },
          { id: 'PENDING', label: 'En cours' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-[#001F54] text-[#FFB703] border-[#001F54] shadow-[2px_2px_0px_#001F54]'
                : 'bg-white text-[#001F54] border-[#001F54]/30 hover:bg-[#DFF6FF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#DFF6FF] flex items-center justify-center mx-auto text-[#0A6CF1]">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#001F54]">Aucune transaction trouvée</h4>
            <p className="text-xs text-[#001F54]/70 max-w-xs mx-auto">
              Effectuez un premier transfert inter-réseau en quelques secondes !
            </p>
            <button
              type="button"
              onClick={onOpenSend}
              className="mt-2 px-4 py-2.5 rounded-xl btn-cartoon-blue text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
            >
              Initier un transfert
            </button>
          </div>
        ) : (
          filtered.map((tx) => {
            const srcOp = operators.find(o => o.id === tx.sourceOperatorId);
            const dstOp = operators.find(o => o.id === tx.destinationOperatorId);

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="bg-white p-4 rounded-2xl border-3 border-[#001F54] shadow-[3px_3px_0px_#001F54] hover:bg-[#F9FCFF] transition-all cursor-pointer active:translate-y-0.5 active:shadow-[1px_1px_0px_#001F54]"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="font-mono font-bold text-xs text-[#001F54]">{tx.reference}</span>
                  {getStatusBadge(tx.status)}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2.5">
                    {/* Operator visual pathway */}
                    <div className="flex items-center -space-x-2">
                      <div className="z-10">
                        <OperatorLogo operatorId={tx.sourceOperatorId} size={32} />
                      </div>
                      <div className="z-20">
                        <OperatorLogo operatorId={tx.destinationOperatorId} size={32} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#001F54]">
                        <span>{srcOp?.name || tx.sourceOperatorId}</span>
                        <ArrowRight className="w-3 h-3 text-[#0A6CF1]" />
                        <span>{dstOp?.name || tx.destinationOperatorId}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        Vers {tx.destinationNumber}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-[#001F54] block">
                      {tx.amount.toLocaleString('fr-FR')} F
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-[#001F54]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl border-3 border-[#001F54] shadow-[6px_6px_0px_#001F54] p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <h3 className="font-black text-lg text-[#001F54] font-display">
                Reçu de Transfert
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-[#DFF6FF] text-[#001F54] flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2 bg-[#F4F9FD] rounded-2xl border-2 border-[#001F54]">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Montant Transféré</span>
              <span className="font-mono font-black text-2xl text-[#001F54]">
                {selectedTx.amount.toLocaleString('fr-FR')} FCFA
              </span>
              <div className="mt-1 flex items-center justify-center gap-1">
                {getStatusBadge(selectedTx.status)}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Référence :</span>
                <span className="font-mono font-bold text-[#001F54] flex items-center gap-1">
                  {selectedTx.reference}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTx.reference);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="cursor-pointer text-[#0A6CF1]"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-600">✓</span>}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Type d’opération :</span>
                <span className="font-black text-[#001F54]">
                  Transfert Inter-Opérateurs Direct
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Compte émetteur :</span>
                <span className="font-mono text-[#001F54]">
                  {selectedTx.sourceOperatorId.toUpperCase()} ({selectedTx.sourceNumber})
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Compte bénéficiaire :</span>
                <span className="font-mono text-[#001F54]">
                  {selectedTx.destinationOperatorId.toUpperCase()} ({selectedTx.destinationNumber})
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Frais Intersend :</span>
                <span className="font-mono text-[#0A6CF1] font-bold">
                  {selectedTx.fee.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b-2 border-[#001F54] font-black text-[#001F54]">
                <span>Total débité :</span>
                <span className="font-mono text-sm">
                  {selectedTx.totalDebited.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {selectedTx.adminNote && (
              <div className="p-3 rounded-xl bg-[#FFFDE8] border border-[#FFB703] text-[11px] text-[#001F54]">
                <span className="font-bold block">Note de l'administrateur :</span>
                {selectedTx.adminNote}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full h-12 rounded-xl btn-cartoon-blue flex items-center justify-center gap-2 text-xs font-black cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger / Imprimer le reçu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
