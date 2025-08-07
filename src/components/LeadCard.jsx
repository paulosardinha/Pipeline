import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  MessageCircle, 
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';


const LeadCard = ({ 
  lead, 
  tasks, 
  index, 
  onView,
  onEdit, 
  onDelete, 
  onAddTask,
  onToggleTask,
  onAddInteraction,
  onOpenWhatsApp 
}) => {
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [interactionText, setInteractionText] = useState('');
  const [interactionType, setInteractionType] = useState('call');
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().slice(0, 10));
  const [interactionTime, setInteractionTime] = useState(new Date().toTimeString().slice(0, 5));
  const { toast } = useToast();

  const handleAddInteraction = () => {
    if (!interactionText.trim()) {
      toast({
        title: "Erro",
        description: "Digite o conteúdo da interação",
        variant: "destructive"
      });
      return;
    }

    // Combinar data e horário escolhidos
    const combinedDateTime = new Date(`${interactionDate}T${interactionTime}`);
    
    onAddInteraction(lead.id, {
      type: interactionType,
      content: interactionText,
      date: interactionDate,
      time: interactionTime,
      created_at: combinedDateTime.toISOString()
    });

    setInteractionText('');
    setInteractionDate(new Date().toISOString().slice(0, 10));
    setInteractionTime(new Date().toTimeString().slice(0, 5));
    setIsInteractionModalOpen(false);
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'border-l-red-500';
      case 'media': return 'border-l-yellow-500';
      case 'baixa': return 'border-l-blue-500';
      default: return 'border-l-gray-400';
    }
  };

  const nextOpenTask = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${
            snapshot.isDragging ? 'shadow-xl rotate-2' : ''
          } ${getPriorityColor(lead.priority)} border-l-4`}
        >
          <motion.div
            whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
            transition={{ duration: 0.2 }}
            className="p-3"
          >
            <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onView(lead)}>
                    <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mr-2 -mt-1 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(lead)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddTask(lead.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Tarefa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(lead.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            {nextOpenTask && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`task-${nextOpenTask.id}`}
                            checked={nextOpenTask.completed}
                            onCheckedChange={() => onToggleTask(nextOpenTask.id)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 cursor-pointer" onClick={() => onView(lead)}>
                            <span className="text-gray-700 font-medium truncate">{nextOpenTask.title}</span>
                            <div className="flex items-center gap-1 text-gray-500">
                                {new Date(nextOpenTask.due_date) < new Date() && (
                                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                )}
                                <span>
                                    Vence em: {new Date(nextOpenTask.due_date).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {!nextOpenTask && (
                <div className="mt-2 text-xs text-gray-400 italic cursor-pointer" onClick={() => onView(lead)}>
                    Nenhuma tarefa pendente.
                </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onOpenWhatsApp(lead.phone); }}
                className="flex-1 text-xs h-8 px-2"
              >
                <MessageCircle className="w-3 h-3 mr-1.5" />
                WhatsApp
              </Button>
              <Dialog open={isInteractionModalOpen} onOpenChange={(open) => {
                setIsInteractionModalOpen(open);
                if (!open) {
                  setInteractionText('');
                  setInteractionDate(new Date().toISOString().slice(0, 10));
                  setInteractionTime(new Date().toTimeString().slice(0, 5));
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs h-8 px-2"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setIsInteractionModalOpen(true);
                      setInteractionDate(new Date().toISOString().slice(0, 10));
                      setInteractionTime(new Date().toTimeString().slice(0, 5));
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1.5" />
                    Interação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Interação - {lead.name}</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova interação para este lead. Preencha os campos abaixo e clique em salvar.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Interação</Label>
                      <select
                        value={interactionType}
                        onChange={(e) => setInteractionType(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="call">Ligação</option>
                        <option value="message">Mensagem</option>
                        <option value="visit">Visita</option>
                        <option value="meeting">Reunião</option>
                      </select>
                    </div>
                    <div>
                      <Label>Data da Interação</Label>
                      <Input
                        type="date"
                        value={interactionDate}
                        onChange={(e) => setInteractionDate(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <Label>Horário da Interação</Label>
                      <Input
                        type="time"
                        value={interactionTime}
                        onChange={(e) => setInteractionTime(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={interactionText}
                        onChange={(e) => setInteractionText(e.target.value)}
                        placeholder="Descreva o que aconteceu nesta interação..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddInteraction} className="flex-1">
                        Salvar Interação
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsInteractionModalOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
};

export default LeadCard;