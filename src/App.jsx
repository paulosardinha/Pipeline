import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { DragDropContext } from 'react-beautiful-dnd';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { subscriptionService } from '@/lib/subscriptionService';
import Auth from '@/components/Auth';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import KanbanBoard from '@/components/KanbanBoard';
import LeadModal from '@/components/LeadModal';
import TaskModal from '@/components/TaskModal';
import LeadDetailModal from '@/components/LeadDetailModal';
import { Loader2, XCircle } from 'lucide-react';

function App() {
  const { session, loading: authLoading, subscriptionStatus } = useAuth();
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLeadDetailModalOpen, setIsLeadDetailModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    origin: 'all'
  });
  const { toast } = useToast();

  // Verificar assinatura periodicamente
  useEffect(() => {
    if (!session?.user?.email) return;

    const checkSubscription = async () => {
      try {
        const status = await subscriptionService.checkSubscriptionStatus(session.user.email);
        if (!status.hasActiveSubscription) {
          toast({
            title: "Assinatura Expirada",
            description: "Sua assinatura não está mais ativa. Renove na Hotmart para continuar usando o sistema.",
            variant: "destructive",
          });
          // Redirecionar para logout após 5 segundos
          setTimeout(() => {
            supabase.auth.signOut();
          }, 5000);
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
      }
    };

    // Verificar a cada 5 minutos
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);
    
    // Verificar imediatamente
    checkSubscription();

    return () => clearInterval(interval);
  }, [session?.user?.email, toast]);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoadingData(true);
    try {
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (leadsError) throw leadsError;
      setLeads(leadsData);

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (tasksError) throw tasksError;
      setTasks(tasksData);
    } catch (error) {
      toast({ title: "Erro ao buscar dados", description: error.message, variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [session, toast]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const originalLeads = [...leads];
    const updatedLeads = leads.map(lead => 
      lead.id === draggableId ? { ...lead, status: destination.droppableId } : lead
    );
    setLeads(updatedLeads);

    const { error } = await supabase
      .from('leads')
      .update({ status: destination.droppableId })
      .eq('id', draggableId);

    if (error) {
      setLeads(originalLeads);
      toast({ title: "Erro ao mover lead", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lead movido com sucesso!", description: `Lead movido para ${getStageLabel(destination.droppableId)}` });
    }
  };
  
  const getStageLabel = (stage) => {
    const stages = { 'novo-lead': 'Novo Lead', 'em-contato': 'Em Contato', 'visita-marcada': 'Visita Marcada', 'proposta-enviada': 'Proposta Enviada', 'fechado': 'Fechado' };
    return stages[stage] || stage;
  };

  const addLead = async (leadData) => {
    const { data, error } = await supabase
      .from('leads')
      .insert({ ...leadData, user_id: session.user.id })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erro ao adicionar lead", description: error.message, variant: "destructive" });
    } else {
      setLeads([data, ...leads]);
      toast({ title: "Lead adicionado!", description: "Novo lead foi adicionado ao pipeline." });
    }
  };

  const updateLead = async (leadId, leadData) => {
    const { data, error } = await supabase
      .from('leads')
      .update(leadData)
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao atualizar lead", description: error.message, variant: "destructive" });
    } else {
      setLeads(leads.map(lead => lead.id === leadId ? data : lead));
      toast({ title: "Lead atualizado!", description: "As informações do lead foram atualizadas." });
    }
  };
  
  const deleteLead = async (leadId) => {
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) {
      toast({ title: "Erro ao excluir lead", description: error.message, variant: "destructive" });
    } else {
      setLeads(leads.filter(lead => lead.id !== leadId));
      setTasks(tasks.filter(task => task.lead_id !== leadId));
      toast({ title: "Lead excluído!", description: "O lead e suas tarefas foram removidos.", variant: "destructive" });
    }
  };

  const addTask = async (taskData) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, user_id: session.user.id })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erro ao adicionar tarefa", description: error.message, variant: "destructive" });
    } else {
      setTasks([data, ...tasks]);
      toast({ title: "Tarefa adicionada!", description: "Nova tarefa foi criada." });
    }
  };

  const updateTask = async (taskId, taskData) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erro ao atualizar tarefa", description: error.message, variant: "destructive" });
    } else {
      setTasks(tasks.map(task => task.id === taskId ? data : task));
      toast({ title: "Tarefa atualizada!", description: "A tarefa foi atualizada com sucesso." });
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) {
        toast({ title: "Erro ao atualizar tarefa", description: error.message, variant: "destructive" });
      } else {
        setTasks(tasks.map(t => t.id === taskId ? data : t));
        toast({ title: "Tarefa atualizada!", description: "O status da tarefa foi alterado." });
      }
    }
  };

  const addInteraction = async (leadId, interaction) => {
    const lead = leads.find(l => l.id === leadId);
    const updatedInteractions = [...(lead.interactions || []), { ...interaction, id: `int-${Date.now()}`, created_at: new Date().toISOString() }];
    
    const { data, error } = await supabase
      .from('leads')
      .update({ interactions: updatedInteractions })
      .eq('id', leadId)
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erro ao registrar interação", description: error.message, variant: "destructive" });
    } else {
      setLeads(leads.map(l => l.id === leadId ? data : l));
      toast({ title: "Interação registrada!", description: "Nova interação foi adicionada ao histórico." });
    }
  };

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredLeads = leads.filter(lead => {
    if (filters.status !== 'all' && lead.status !== filters.status) return false;
    if (filters.priority !== 'all' && lead.priority !== filters.priority) return false;
    if (filters.origin !== 'all' && lead.origin !== filters.origin) return false;
    return true;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen main-background flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-brand-secondary" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // Verificar se a assinatura está ativa
  if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription) {
    return (
      <div className="min-h-screen main-background flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assinatura Expirada</h2>
            <p className="text-gray-600 mb-6">
              {subscriptionStatus.message || 'Sua assinatura não está mais ativa. Renove na Hotmart para continuar usando o sistema.'}
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Para reativar sua assinatura:
            </p>
            <ol className="text-sm text-gray-600 text-left space-y-2">
              <li>1. Acesse sua área de membros na Hotmart</li>
              <li>2. Localize o produto Pipeline Alfa</li>
              <li>3. Renove sua assinatura</li>
              <li>4. Aguarde alguns minutos e tente fazer login novamente</li>
            </ol>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-6 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Sair do Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pipeline Alfa - Dashboard</title>
        <meta name="description" content="Gerencie seus leads e vendas com eficiência" />
      </Helmet>
      
      <div className="min-h-screen main-background">
        <Header 
          onAddLead={() => setIsLeadModalOpen(true)}
          onAddTask={() => setIsTaskModalOpen(true)}
          onSignOut={() => supabase.auth.signOut()}
          user={session.user}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Dashboard 
            leads={leads} 
            tasks={tasks} 
            onToggleTask={toggleTask}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8"
          >
            <KanbanBoard
              leads={filteredLeads}
              onDragEnd={handleDragEnd}
              onView={(lead) => {
                setViewingLead(lead);
                setIsLeadDetailModalOpen(true);
              }}
              onEdit={(lead) => {
                setEditingLead(lead);
                setIsLeadModalOpen(true);
              }}
              onDelete={deleteLead}
              onToggleTask={toggleTask}
              onOpenWhatsApp={openWhatsApp}
            />
          </motion.div>
        </main>

        <LeadModal
          isOpen={isLeadModalOpen}
          onClose={() => {
            setIsLeadModalOpen(false);
            setEditingLead(null);
          }}
          onSave={editingLead ? (data) => updateLead(editingLead.id, data) : addLead}
          lead={editingLead}
        />

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={editingTask ? (data) => updateTask(editingTask.id, data) : addTask}
          task={editingTask}
          leads={leads}
        />

        <LeadDetailModal
          isOpen={isLeadDetailModalOpen}
          onClose={() => {
            setIsLeadDetailModalOpen(false);
            setViewingLead(null);
          }}
          lead={viewingLead}
          onAddInteraction={addInteraction}
          onEdit={(lead) => {
            setEditingLead(lead);
            setIsLeadModalOpen(true);
            setIsLeadDetailModalOpen(false);
          }}
          onDelete={deleteLead}
          onOpenWhatsApp={openWhatsApp}
        />
      </div>
    </>
  );
}

export default App;