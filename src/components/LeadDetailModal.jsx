import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Calendar, AlertCircle, Mail, MapPin, DollarSign, Building, Tag, BedDouble, FileText } from 'lucide-react';

const LeadDetailModal = ({ isOpen, onClose, lead, tasks }) => {
  if (!lead) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return priority;
    }
  };

  const InteractionIcon = ({ type }) => {
    switch (type) {
      case 'call': return <Phone className="w-5 h-5 text-blue-500" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'visit': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const openTasks = tasks.filter(task => !task.completed);
  const sortedInteractions = [...(lead.interactions || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const DetailItem = ({ icon, label, value, isBlock = false }) => (
    <div className={`flex items-start gap-3 ${isBlock ? 'flex-col items-start' : ''}`}>
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className={isBlock ? 'mt-1' : ''}>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap">{value || 'Não informado'}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{lead.name}</DialogTitle>
          <DialogDescription>
            Lead criado em {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 my-2">
            <Badge variant="outline" className={getPriorityColor(lead.priority)}>{getPriorityLabel(lead.priority)}</Badge>
            <Badge variant="secondary">{lead.origin}</Badge>
        </div>

        <ScrollArea className="h-[65vh] pr-4 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Detalhes do Lead */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold mb-2">Detalhes do Lead</h3>
              <DetailItem icon={<Phone className="w-4 h-4 text-gray-600" />} label="Telefone" value={lead.phone} />
              <DetailItem icon={<Mail className="w-4 h-4 text-gray-600" />} label="E-mail" value={lead.email} />
              <DetailItem icon={<MapPin className="w-4 h-4 text-gray-600" />} label="Bairro de Interesse" value={lead.neighborhood} />
              <DetailItem icon={<Building className="w-4 h-4 text-gray-600" />} label="Tipo de Imóvel" value={lead.propertyType} />
              <DetailItem icon={<DollarSign className="w-4 h-4 text-gray-600" />} label="Valor Potencial" value={formatCurrency(lead.potentialValue)} />
              <DetailItem icon={<BedDouble className="w-4 h-4 text-gray-600" />} label="Dormitórios" value={lead.bedrooms} />
              <DetailItem icon={<Tag className="w-4 h-4 text-gray-600" />} label="Origem" value={lead.origin} />
              {lead.observations && (
                 <DetailItem icon={<FileText className="w-4 h-4 text-gray-600" />} label="Observações" value={lead.observations} isBlock={true} />
              )}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tarefas Abertas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tarefas em Aberto</h3>
                <div className="space-y-3">
                  {openTasks.length > 0 ? openTasks.map(task => {
                    const isOverdue = new Date(task.dueDate) < new Date();
                    return (
                      <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-800">{task.title}</p>
                          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Vence em: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-gray-500">Nenhuma tarefa em aberto.</p>
                  )}
                </div>
              </div>

              {/* Histórico de Interações */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Histórico de Interações</h3>
                <div className="space-y-4">
                  {sortedInteractions.length > 0 ? sortedInteractions.map(interaction => (
                    <div key={interaction.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <InteractionIcon type={interaction.type} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{interaction.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(interaction.createdAt)}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500">Nenhum histórico de interações.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailModal;