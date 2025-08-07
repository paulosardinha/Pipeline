import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

const TasksColumn = ({ 
  tasks, 
  leads, 
  onToggleTask, 
  onEditTask, 
  onDeleteTask, 
  onDeleteCompletedTasks,
  onAddTask,
  onViewLead 
}) => {
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending

  const getLeadName = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : 'Lead não encontrado';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'border-l-red-500';
      case 'media': return 'border-l-yellow-500';
      case 'baixa': return 'border-l-blue-500';
      default: return 'border-l-gray-400';
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

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'completed') return task.completed;
    if (filterStatus === 'pending') return !task.completed;
    return true; // all
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Primeiro, tarefas não completadas
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Depois, por data de vencimento
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const isOverdue = (task) => {
    return new Date(task.due_date) < new Date() && !task.completed;
  };

  const isToday = (task) => {
    const today = new Date().toDateString();
    const taskDate = new Date(task.due_date).toDateString();
    return today === taskDate && !task.completed;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h3 className="font-semibold">Todas as Tarefas</h3>
        <div className="flex items-center gap-2">
          {tasks.filter(task => task.completed).length > 0 && (
            <Button
              onClick={onDeleteCompletedTasks}
              variant="ghost"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 h-auto"
              title="Excluir todas as tarefas concluídas"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar Concluídas
            </Button>
          )}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/20 text-white text-sm rounded px-2 py-1 border border-white/30"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídas</option>
          </select>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
            {filteredTasks.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-4 bg-gray-50 rounded-b-lg space-y-3 overflow-y-auto" style={{ minHeight: '500px' }}>
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task, index) => {
            const lead = leads.find(l => l.id === task.lead_id);
            const overdue = isOverdue(task);
            const today = isToday(task);
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${getPriorityColor(task.priority)} border-l-4 ${
                  overdue ? 'ring-2 ring-red-200' : today ? 'ring-2 ring-yellow-200' : ''
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => onToggleTask(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium text-gray-900 text-sm ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </p>
                          {overdue && <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                          {today && !overdue && <Calendar className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-gray-600 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {getLeadName(task.lead_id)}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {getPriorityLabel(task.priority)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-medium ${
                              overdue ? 'text-red-600' : 
                              today ? 'text-yellow-600' : 
                              'text-gray-500'
                            }`}>
                              {overdue ? 'Atrasada' : 
                               today ? 'Hoje' : 
                               new Date(task.due_date).toLocaleDateString('pt-BR')}
                            </span>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEditTask(task.id)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => lead && onViewLead(lead)}>
                                  <Calendar className="h-3 w-3 mr-2" />
                                  Ver Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-red-600">
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">
              {filterStatus === 'all' ? 'Nenhuma tarefa encontrada' :
               filterStatus === 'pending' ? 'Nenhuma tarefa pendente' :
               'Nenhuma tarefa concluída'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksColumn;
