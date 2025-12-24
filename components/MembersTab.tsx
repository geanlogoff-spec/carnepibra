
import React, { useState } from 'react';
import { Customer } from '../types';
import { validateDocument } from '../utils/security';

interface MembersTabProps {
    members: Customer[];
    onAddMember: (member: Customer) => Promise<void>;
    onUpdateMember: (id: string, updates: Partial<Customer>) => Promise<void>;
    onDeleteMember: (id: string) => Promise<void>;
    isLoading: boolean;
}

export const MembersTab: React.FC<MembersTabProps> = ({ members, onAddMember, onUpdateMember, onDeleteMember, isLoading }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        phone: '',
        email: ''
    });

    const handleEdit = (member: Customer) => {
        if (!member.id) {
            alert("Erro: Este membro não possui um ID válido no sistema. Tente recarregar a página.");
            console.error("Membro sem ID ao tentar editar:", member);
            return;
        }
        setFormData({
            name: member.name,
            document: member.document || '',
            phone: member.phone || '',
            email: member.email || ''
        });
        setEditingMemberId(member.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ... (restante do código até o map)



    const handleCancelForm = () => {
        setShowForm(false);
        setEditingMemberId(null);
        setFormData({ name: '', document: '', phone: '', email: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Nome é obrigatório');
            return;
        }

        if (formData.document && !validateDocument(formData.document)) {
            alert('Documento inválido');
            return;
        }

        if (editingMemberId) {
            await onUpdateMember(editingMemberId, formData);
        } else {
            await onAddMember(formData);
        }

        handleCancelForm();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Membros e Ofertantes</h2>
                    <p className="text-slate-500 mt-2 text-lg">Gerencie o cadastro dos irmãos para emissão de carnês.</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) handleCancelForm();
                        else setShowForm(true);
                    }}
                    className={`${showForm ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20'} px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95`}
                >
                    {showForm ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancelar
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
                    <h3 className="text-2xl font-black text-slate-900 mb-6">
                        {editingMemberId ? 'Editar Dados do Irmão(ã)' : 'Novo Cadastro de Membro'}
                    </h3>
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

                        <div className="flex justify-end pt-4 gap-3">
                            <button
                                type="button"
                                onClick={handleCancelForm}
                                className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? 'Salvando...' : (editingMemberId ? 'Atualizar Dados' : 'Cadastrar Membro')}
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(member);
                                        }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer relative z-20"
                                        title="Editar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (member.id) {
                                                onDeleteMember(member.id);
                                            } else {
                                                alert("Erro: Não foi possível identificar o membro para exclusão. Tente recarregar a página.");
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer relative z-20"
                                        title="Excluir"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
