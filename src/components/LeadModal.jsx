import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const LeadModal = ({ isOpen, onClose, onSave, lead }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    neighborhood: '',
    property_type: '',
    potential_value: '',
    bedrooms: '',
    observations: '',
    origin: '',
    priority: 'media',
    status: 'novo-lead'
  });
  const { toast } = useToast();

  const formatCurrencyForDisplay = (value) => {
    if (typeof value !== 'number') return '';
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        neighborhood: lead.neighborhood || '',
        property_type: lead.property_type || '',
        potential_value: formatCurrencyForDisplay(lead.potential_value),
        bedrooms: lead.bedrooms || '',
        observations: lead.observations || '',
        origin: lead.origin || '',
        priority: lead.priority || 'media',
        status: lead.status || 'novo-lead'
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        neighborhood: '',
        property_type: '',
        potential_value: '',
        bedrooms: '',
        observations: '',
        origin: '',
        priority: 'media',
        status: 'novo-lead'
      });
    }
  }, [lead, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const valueString = String(formData.potential_value);
    const leadData = {
      ...formData,
      potential_value: formData.potential_value ? parseFloat(valueString.replace(/[^\d,]/g, '').replace(',', '.')) : 0,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : null,
    };

    onSave(leadData);
    onClose();
  };

  const formatCurrencyOnInput = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue === '') return '';
    
    const number = parseFloat(numericValue) / 100;
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleCurrencyChange = (e) => {
    const formatted = formatCurrencyOnInput(e.target.value);
    setFormData({ ...formData, potential_value: formatted });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{lead ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Bairro de interesse"
              />
            </div>
            <div>
              <Label htmlFor="property_type">Tipo de Imóvel</Label>
              <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="potential_value">Valor Potencial</Label>
              <Input
                id="potential_value"
                value={formData.potential_value}
                onChange={handleCurrencyChange}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label htmlFor="bedrooms">Dormitórios</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="Ex: 3"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Preferência por andar alto, com varanda gourmet, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">Origem do Lead</Label>
              <Select value={formData.origin} onValueChange={(value) => setFormData({ ...formData, origin: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
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

          {lead && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo-lead">Novo Lead</SelectItem>
                  <SelectItem value="em-contato">Em Contato</SelectItem>
                  <SelectItem value="visita-marcada">Visita Marcada</SelectItem>
                  <SelectItem value="proposta-enviada">Proposta Enviada</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {lead ? 'Atualizar' : 'Criar'} Lead
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

export default LeadModal;