import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Users, Target, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Header = ({ onAddLead = () => {}, onAddTask = () => {}, onSignOut = () => {}, user = null, filters = { status: 'all', priority: 'all', origin: 'all' }, onFiltersChange = () => {}, leads = [] }) => {
  const totalLeads = leads?.length || 0;
  const activeLeads = leads?.filter(lead => lead.status !== 'fechado')?.length || 0;

  return (
    <motion.header 
      className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/d08cb82d-6f38-407f-afdd-2a89111d2bfa/c246e8144972abfce16497aa89362737.png" alt="Pipeline Alfa Logo" className="w-12 h-12 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">
                  Pipeline Alfa
                </h1>
                <p className="text-sm text-gray-600">Sistema de Vendas para Corretores</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 ml-8">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{totalLeads} Leads</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{activeLeads} Ativos</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={filters?.status || 'all'} onValueChange={(value) => {
                  if (onFiltersChange) {
                    onFiltersChange({...(filters || {}), status: value});
                  }
                }}>
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="novo-lead">Novo Lead</SelectItem>
                    <SelectItem value="em-contato">Em Contato</SelectItem>
                    <SelectItem value="visita-marcada">Visita Marcada</SelectItem>
                    <SelectItem value="proposta-enviada">Proposta Enviada</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters?.priority || 'all'} onValueChange={(value) => {
                  if (onFiltersChange) {
                    onFiltersChange({...(filters || {}), priority: value});
                  }
                }}>
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Prioridade</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters?.origin || 'all'} onValueChange={(value) => {
                  if (onFiltersChange) {
                    onFiltersChange({...(filters || {}), origin: value});
                  }
                }}>
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Origens</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button onClick={() => onAddLead && onAddLead()} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Lead
                </Button>
                <Button onClick={() => onAddTask && onAddTask()} variant="outline" className="border-purple-200 hover:bg-purple-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>
              
              {user && (
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                  <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                      {user.email || 'Usuário'}
                    </span>
                  </div>
                  <Button 
                    onClick={() => onSignOut && onSignOut()} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    title="Sair da conta"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;