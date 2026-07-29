// Catálogo inicial de materiais típicos para Operação Técnica e Almoxarifado
export const INITIAL_MATERIALS = [
  {
    id: "mat-1",
    name: "Cabo Drop Óptico Flat 1FO",
    category: "Cabos",
    unit: "metros",
    quantity: 1200,
    minStock: 300,
    totalCapacity: 2000,
    location: "Prateleira A-1",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-2",
    name: "Conector FAST SC/APC Verde",
    category: "Conectores & Passivos",
    unit: "unidades",
    quantity: 180,
    minStock: 50,
    totalCapacity: 300,
    location: "Caixa B-2",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-3",
    name: "Conector FAST SC/UPC Azul",
    category: "Conectores & Passivos",
    unit: "unidades",
    quantity: 35,
    minStock: 40, // Trigger low stock warning!
    totalCapacity: 200,
    location: "Caixa B-3",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-4",
    name: "Splitter PLC 1x8 SC/APC",
    category: "Caixas & Passivos",
    unit: "unidades",
    quantity: 12,
    minStock: 15, // Low stock
    totalCapacity: 50,
    location: "Gaveta C-1",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-5",
    name: "Splitter PLC 1x16 SC/APC",
    category: "Caixas & Passivos",
    unit: "unidades",
    quantity: 0, // Critical / Out of stock!
    minStock: 10,
    totalCapacity: 40,
    location: "Gaveta C-2",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-6",
    name: "ONT / ONU GPON Wi-Fi 5 Dual Band",
    category: "Equipamentos",
    unit: "unidades",
    quantity: 25,
    minStock: 8,
    totalCapacity: 50,
    location: "Prateleira D-1",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-7",
    name: "Esticador de Cabo Drop (Passador Plastic)",
    category: "Conectores & Passivos",
    unit: "unidades",
    quantity: 450,
    minStock: 100,
    totalCapacity: 800,
    location: "Caixa A-4",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-8",
    name: "Roldana Plástica de Ancoragem 2 Vias",
    category: "Conectores & Passivos",
    unit: "unidades",
    quantity: 300,
    minStock: 80,
    totalCapacity: 500,
    location: "Caixa A-5",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-9",
    name: "Fita de Aço Inox 3/4 (Rolo 30m)",
    category: "Ferragens",
    unit: "rolos",
    quantity: 4,
    minStock: 2,
    totalCapacity: 10,
    location: "Escaninho E-1",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-10",
    name: "Fecho de Aço Inox 3/4",
    category: "Ferragens",
    unit: "unidades",
    quantity: 120,
    minStock: 30,
    totalCapacity: 250,
    location: "Caixa E-2",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-11",
    name: "Tubete de Proteção de Fusão 60mm",
    category: "Insumos",
    unit: "pacotes",
    quantity: 15,
    minStock: 5,
    totalCapacity: 30,
    location: "Gaveta F-1",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mat-12",
    name: "Álcool Isopropílico 99.8% (1 Litro)",
    category: "Insumos",
    unit: "frascos",
    quantity: 2,
    minStock: 3, // Low stock
    totalCapacity: 10,
    location: "Armário G-1",
    lastUpdated: new Date().toISOString()
  }
];

export const INITIAL_SUPERVISORS = [
  { id: "sup-1", name: "Você (Supervisor 1)", active: true, color: "#3b82f6" },
  { id: "sup-2", name: "Seu Colega (Supervisor 2)", active: false, color: "#10b981" }
];

export const INITIAL_LOGS = [
  {
    id: "log-101",
    type: "out", // 'out' (baixa) or 'in' (entrada)
    materialId: "mat-2",
    materialName: "Conector FAST SC/APC Verde",
    quantity: 20,
    unit: "unidades",
    technician: "Técnico Carlos Silva",
    osNumber: "OS-84920",
    supervisor: "Você (Supervisor 1)",
    notes: "Atendimento de instalação Residencial Bairro Flores",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "log-102",
    type: "out",
    materialId: "mat-1",
    materialName: "Cabo Drop Óptico Flat 1FO",
    quantity: 150,
    unit: "metros",
    technician: "Técnico Marcos Souza",
    osNumber: "OS-84925",
    supervisor: "Você (Supervisor 1)",
    notes: "Lançamento de drop cliente comercial",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: "log-103",
    type: "in",
    materialId: "mat-6",
    materialName: "ONT / ONU GPON Wi-Fi 5 Dual Band",
    quantity: 10,
    unit: "unidades",
    technician: "Almoxarifado Central",
    osNumber: "NF-9921",
    supervisor: "Seu Colega (Supervisor 2)",
    notes: "Reabastecimento semanal recebido da base",
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  }
];
