
import React, { useState } from 'react';
import { Customer } from '../types';
import { validateDocument } from '../utils/security';

interface MembersTabProps {
    members: Customer[];
    onAddMember: (member: Customer) => Promise<void>;
    isLoading: boolean;
}

export const MembersTab: React.FC<MembersTabProps> = ({ members, onAddMember, isLoading }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        phone: '',
        email: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Nome é obrigatório');
            return;
        }

        if (formData.document && !validateDocument(formData.document)) {
            alert('Documento inválido'); // Mantendo validação simples, pode ser removida se igreja não exigir
            return;
        }

        await onAddMember(formData);
        setFormData({ name: '', document: '', phone: '', email: '' });
        setShowForm(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Membros e Ofertantes</h2>
                    <p className="text-slate-500 mt-2 text-lg">Gerencie o cadastro dos irmãos para emissão de carnês.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    {showForm ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancelar Cadastro
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo Membro
                        </>
                    )}
                </button>
            </header>

            {showForm && (
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl animate-in slide-in-from-top-4">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">Dados do Irmão(ã)</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CPF (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.document}
                                    onChange={e => setFormData({ ...formData, document: e.target.value })}
                                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telefone / WhatsApp</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email (Opcional)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="exemplo@email.com"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? 'Salvando...' : 'Cadastrar Membro'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Membros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.length === 0 ? (
                    <div className="col-span-full bg-slate-50 rounded-[32px] p-20 text-center border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Nenhum membro cadastrado</h3>
                        <p className="text-slate-500 mt-2">Cadastre os irmãos para começar a emitir carnês.</p>
                    </div>
                ) : (
                    members.map((member) => (
                        <div key={member.id || Math.random()} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 leading-tight">{member.name}</h4>
                                        {member.phone && <p className="text-xs text-slate-400 font-bold mt-1">{member.phone}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Membro Cadastrado</span>
                                {/* Aqui poderia ter botões de editar/excluir futuramente */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
