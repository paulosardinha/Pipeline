import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const TaskModal = ({ isOpen, onClose, onSave, task, leads, selectedLeadId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    leadId: selectedLeadId || '',
    priority: 'media',
    type: 'call'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        leadId: task.leadId || '',
        priority: task.priority || 'media',
        type: task.type || 'call'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        leadId: selectedLeadId || '',
        priority: 'media',
        type: 'call'
      });
    }
  }, [task, selectedLeadId, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.leadId || !formData.dueDate) {
      toast({
        title: "Erro",
        description: "Título, lead e data são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const taskData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString()
    };

    onSave(taskData);
    onClose();
  };

  const getLeadName = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : 'Lead não encontrado';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Ligar para cliente"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes da tarefa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leadId">Lead *</Label>
              <Select value={formData.leadId} onValueChange={(value) => setFormData({ ...formData, leadId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="visit">Visita</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {task ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;