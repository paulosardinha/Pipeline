import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import SubscriptionStatus from './SubscriptionStatus';

const Dashboard = ({ leads, tasks, onToggleTask }) => {
  const today = new Date().toDateString();
  
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(lead => lead.status === 'novo-lead').length,
    inContact: leads.filter(lead => lead.status === 'em-contato').length,
    visitScheduled: leads.filter(lead => lead.status === 'visita-marcada').length,
    proposalSent: leads.filter(lead => lead.status === 'proposta-enviada').length,
    closed: leads.filter(lead => lead.status === 'fechado').length,
    conversionRate: leads.length > 0 ? ((leads.filter(lead => lead.status === 'fechado').length / leads.length) * 100).toFixed(1) : 0,
    todayTasks: tasks.filter(task => new Date(task.due_date).toDateString() === today).length,
    overdueTasks: tasks.filter(task => new Date(task.due_date) < new Date() && !task.completed).length,
    completedTasks: tasks.filter(task => task.completed).length
  };

  const priorityLeads = leads
    .filter(lead => lead.priority === 'alta' && lead.status !== 'fechado')
    .slice(0, 5);

  const urgentTasks = tasks
    .filter(task => !task.completed && (
      new Date(task.due_date).toDateString() === today ||
      new Date(task.due_date) < new Date()
    ))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const StatCard = ({ icon: Icon, title, value, subtitle, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${color} hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border-l-', 'text-')}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Status da Assinatura */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0 }}
      >
        <SubscriptionStatus />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Total de Leads" value={stats.totalLeads} color="border-l-blue-500" delay={0.1} />
        <StatCard icon={TrendingUp} title="Taxa de Conversão" value={`${stats.conversionRate}%`} subtitle={`${stats.closed} fechados`} color="border-l-green-500" delay={0.2} />
        <StatCard icon={Clock} title="Tarefas Hoje" value={stats.todayTasks} subtitle={`${stats.overdueTasks} atrasadas`} color="border-l-yellow-500" delay={0.3} />
        <StatCard icon={CheckCircle} title="Tarefas Concluídas" value={stats.completedTasks} color="border-l-purple-500" delay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral do Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-white font-bold">{stats.newLeads}</span></div>
            <p className="text-sm font-medium text-purple-700">Novo Lead</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-white font-bold">{stats.inContact}</span></div>
            <p className="text-sm font-medium text-blue-700">Em Contato</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-white font-bold">{stats.visitScheduled}</span></div>
            <p className="text-sm font-medium text-yellow-700">Visita Marcada</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-white font-bold">{stats.proposalSent}</span></div>
            <p className="text-sm font-medium text-orange-700">Proposta Enviada</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-white font-bold">{stats.closed}</span></div>
            <p className="text-sm font-medium text-green-700">Fechado</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Leads Prioritários</h3>
          </div>
          <div className="space-y-3">
            {priorityLeads.length > 0 ? (
              priorityLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-600">{lead.neighborhood} • {lead.property_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">Alta Prioridade</p>
                    <p className="text-xs text-gray-500">R$ {lead.potential_value?.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum lead prioritário no momento</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Tarefas Urgentes</h3>
          </div>
          <div className="space-y-3">
            {urgentTasks.length > 0 ? (
              urgentTasks.map((task) => {
                const isOverdue = new Date(task.due_date) < new Date();
                const lead = leads.find(l => l.id === task.lead_id);
                
                return (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                    isOverdue ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => onToggleTask(task.id)} className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}>
                        {task.completed && <CheckCircle className="w-3 h-3" />}
                      </button>
                      <div>
                        <p className={`font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                        <p className="text-sm text-gray-600">{lead?.name || 'Lead não encontrado'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>
                        {isOverdue ? 'Atrasada' : 'Hoje'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma tarefa urgente</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;