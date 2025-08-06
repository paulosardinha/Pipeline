import React from 'react';
import { motion } from 'framer-motion';
import LeadCard from '@/components/LeadCard';

const KanbanColumn = ({ 
  stage, 
  leads, 
  tasks,
  getTasksByLead, 
  onViewLead,
  onEditLead, 
  onDeleteLead, 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onToggleTask,
  onAddInteraction,
  onOpenWhatsApp,
  provided, 
  isDraggingOver 
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className={`${stage.color} text-white p-4 rounded-t-lg flex items-center justify-between`}>
        <h3 className="font-semibold">{stage.title}</h3>
        <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
          {leads.length}
        </span>
      </div>
      
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={`flex-1 p-4 bg-gray-50 rounded-b-lg space-y-3 transition-colors ${
          isDraggingOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
        }`}
        style={{ minHeight: '500px' }}
      >
        {leads.map((lead, index) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <LeadCard
              lead={lead}
              tasks={getTasksByLead(lead.id)}
              index={index}
              onView={onViewLead}
              onEdit={onEditLead}
              onDelete={onDeleteLead}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onAddInteraction={onAddInteraction}
              onOpenWhatsApp={onOpenWhatsApp}
            />
          </motion.div>
        ))}
        {provided.placeholder}
        
        {leads.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">Nenhum lead nesta etapa</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;