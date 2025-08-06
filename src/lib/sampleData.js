export const generateSampleData = () => {
  const leads = [
    {
      id: '1',
      name: 'Maria Silva',
      phone: '(11) 99999-1234',
      email: 'maria.silva@email.com',
      neighborhood: 'Vila Madalena',
      property_type: 'apartamento',
      potential_value: 850000,
      bedrooms: 2,
      observations: 'Prefere andar alto e com varanda. Tem urgência.',
      origin: 'site',
      priority: 'alta',
      status: 'novo-lead',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      interactions: [
        {
          id: '1',
          type: 'call',
          content: 'Primeira ligação - cliente interessado em apartamento de 2 quartos',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '2',
      name: 'João Santos',
      phone: '(11) 98888-5678',
      email: 'joao.santos@email.com',
      neighborhood: 'Pinheiros',
      property_type: 'casa',
      potential_value: 1200000,
      bedrooms: 4,
      observations: 'Busca casa com quintal para os cachorros.',
      origin: 'facebook',
      priority: 'alta',
      status: 'em-contato',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      interactions: [
        {
          id: '2',
          type: 'message',
          content: 'Enviado WhatsApp com opções de casas na região',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'call',
          content: 'Cliente confirmou interesse, quer agendar visita',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '3',
      name: 'Ana Costa',
      phone: '(11) 97777-9012',
      email: 'ana.costa@email.com',
      neighborhood: 'Jardins',
      property_type: 'apartamento',
      potential_value: 950000,
      bedrooms: 3,
      observations: '',
      origin: 'indicacao',
      priority: 'media',
      status: 'visita-marcada',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      interactions: [
        {
          id: '4',
          type: 'visit',
          content: 'Visita agendada para sábado às 14h - Apartamento Rua Augusta',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '4',
      name: 'Carlos Oliveira',
      phone: '(11) 96666-3456',
      email: 'carlos.oliveira@email.com',
      neighborhood: 'Moema',
      property_type: 'apartamento',
      potential_value: 780000,
      bedrooms: 2,
      observations: 'Procura imóvel perto do metrô.',
      origin: 'instagram',
      priority: 'media',
      status: 'proposta-enviada',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      interactions: [
        {
          id: '5',
          type: 'call',
          content: 'Proposta enviada por email - aguardando retorno',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '5',
      name: 'Fernanda Lima',
      phone: '(11) 95555-7890',
      email: 'fernanda.lima@email.com',
      neighborhood: 'Brooklin',
      property_type: 'casa',
      potential_value: 1100000,
      bedrooms: 3,
      observations: '',
      origin: 'whatsapp',
      priority: 'baixa',
      status: 'fechado',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      interactions: [
        {
          id: '6',
          type: 'call',
          content: 'Negócio fechado! Cliente assinou contrato',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '6',
      name: 'Roberto Mendes',
      phone: '(11) 94444-2468',
      email: 'roberto.mendes@email.com',
      neighborhood: 'Vila Olímpia',
      property_type: 'comercial',
      potential_value: 2500000,
      bedrooms: null,
      observations: 'Busca sala comercial com 3 vagas de garagem.',
      origin: 'telefone',
      priority: 'alta',
      status: 'novo-lead',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      interactions: []
    }
  ];

  const tasks = [
    {
      id: '1',
      title: 'Ligar para Maria Silva',
      description: 'Primeira ligação para entender necessidades',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      lead_id: '1',
      priority: 'alta',
      completed: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Agendar visita com João Santos',
      description: 'Cliente interessado em casa em Pinheiros',
      due_date: new Date().toISOString(),
      lead_id: '2',
      priority: 'alta',
      completed: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Preparar documentos para Ana Costa',
      description: 'Separar documentação do apartamento para visita',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      lead_id: '3',
      priority: 'media',
      completed: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      title: 'Follow-up proposta Carlos',
      description: 'Verificar se cliente recebeu e analisou proposta',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lead_id: '4',
      priority: 'alta',
      completed: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      title: 'Enviar contrato para Fernanda',
      description: 'Preparar e enviar contrato final',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lead_id: '5',
      priority: 'alta',
      completed: true,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      title: 'Primeira ligação Roberto',
      description: 'Entender necessidades para imóvel comercial',
      due_date: new Date().toISOString(),
      lead_id: '6',
      priority: 'alta',
      completed: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return { leads, tasks };
};