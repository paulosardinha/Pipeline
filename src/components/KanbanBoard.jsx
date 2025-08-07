import React from 'react';
import { motion } from 'framer-motion';
import { Droppable } from '@hello-pangea/dnd';
import KanbanColumn from '@/components/KanbanColumn';

const KanbanBoard = ({ 
  leads, 
  tasks, 
  onViewLead,
  onEditLead, 
  onDeleteLead, 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onToggleTask,
  onAddInteraction,
  onOpenWhatsApp 
}) => {
  const stages = [
    { id: 'novo-lead', title: 'Novo Lead', color: 'stage-novo' },
    { id: 'em-contato', title: 'Em Contato', color: 'stage-contato' },
    { id: 'visita-marcada', title: 'Visita Marcada', color: 'stage-visita' },
    { id: 'proposta-enviada', title: 'Proposta Enviada', color: 'stage-proposta' },
    { id: 'fechado', title: 'Fechado', color: 'stage-fechado' }
  ];

  const getLeadsByStage = (stageId) => {
    return leads.filter(lead => lead.status === stageId);
  };

  const getTasksByLead = (leadId) => {
    return tasks.filter(task => task.lead_id === leadId);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Pipeline de Vendas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col"
          >
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <KanbanColumn
                  stage={stage}
                  leads={getLeadsByStage(stage.id)}
                  tasks={tasks}
                  getTasksByLead={getTasksByLead}
                  onViewLead={onViewLead}
                  onEditLead={onEditLead}
                  onDeleteLead={onDeleteLead}
                  onAddTask={onAddTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onToggleTask={onToggleTask}
                  onAddInteraction={onAddInteraction}
                  onOpenWhatsApp={onOpenWhatsApp}
                  provided={provided}
                  isDraggingOver={snapshot.isDraggingOver}
                />
              )}
            </Droppable>
          </motion.div>
        ))}
        

      </div>
    </div>
  );
};

export default KanbanBoard;