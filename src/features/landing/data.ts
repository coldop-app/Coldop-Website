import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Globe,
  MessageSquare,
  NotebookPen,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

export type DemoFloor = {
  id: string;
  floor: string;
  bags: number;
  capacity: number;
};

export type DemoChamber = {
  id: string;
  name: string;
  floors: DemoFloor[];
};

export const DEMO_CHAMBERS: DemoChamber[] = [
  {
    id: 'ch-1',
    name: 'Chamber 1',
    floors: [
      { id: 'ch-1-f1', floor: 'Floor 1', bags: 1800, capacity: 5000 },
      { id: 'ch-1-f2', floor: 'Floor 2', bags: 4200, capacity: 5000 },
      { id: 'ch-1-f3', floor: 'Floor 3', bags: 4750, capacity: 5000 },
      { id: 'ch-1-f4', floor: 'Floor 4', bags: 3100, capacity: 5000 },
    ],
  },
  {
    id: 'ch-2',
    name: 'Chamber 2',
    floors: [
      { id: 'ch-2-f1', floor: 'Floor 1', bags: 2200, capacity: 4000 },
      { id: 'ch-2-f2', floor: 'Floor 2', bags: 3600, capacity: 4000 },
      { id: 'ch-2-f3', floor: 'Floor 3', bags: 900, capacity: 4000 },
    ],
  },
  {
    id: 'ch-3',
    name: 'Chamber 3',
    floors: [
      { id: 'ch-3-f1', floor: 'Floor 1', bags: 4500, capacity: 5000 },
      { id: 'ch-3-f2', floor: 'Floor 2', bags: 2800, capacity: 5000 },
      { id: 'ch-3-f3', floor: 'Floor 3', bags: 1500, capacity: 5000 },
      { id: 'ch-3-f4', floor: 'Floor 4', bags: 4900, capacity: 5000 },
    ],
  },
];

export const GATE_PASSES = [
  {
    gatePassNo: 104,
    farmer: 'Balwinder Singh',
    account: '#23',
    variety: 'Chipsona 1',
    lotNo: '104 / 250',
    location: 'Ch 1 / Fl 1 / Row 2',
    bags: 250,
    status: 'OPEN',
    createdAt: '11 Jul 2026, 09:42 AM',
  },
  {
    gatePassNo: 105,
    farmer: 'Gurpreet Singh',
    account: '#4',
    variety: 'Kufri Jyoti',
    lotNo: '105 / 180',
    location: 'Ch 2 / Fl 3 / Row 1',
    bags: 180,
    status: 'OPEN',
    createdAt: '11 Jul 2026, 10:15 AM',
  },
  {
    gatePassNo: 106,
    farmer: 'Satnam Singh',
    account: '#35',
    variety: 'Kufri Pukhraj',
    lotNo: '106 / 320',
    location: 'Ch 1 / Fl 2 / Row 4',
    bags: 320,
    status: 'OPEN',
    createdAt: '11 Jul 2026, 11:03 AM',
  },
];

export const STATS = [
  { value: 1000000, format: 'lakh', label: 'Potato Bags Managed' },
  { value: 5000, format: 'k', label: 'Receipts Created' },
  { value: 50, format: 'plus', label: 'Chambers Digitized' },
  { value: 99.9, format: 'percent', label: 'Preservation Accuracy' },
] as const;

export const ENTERPRISE_PARTNERS = [
  {
    name: 'Bhatti Agri Tech',
    logo: 'https://res.cloudinary.com/dakh64xhy/image/upload/v1759410800/Bhatti-Agritech_gwqywg.jpg',
  },
  {
    name: 'Kapur Farms',
    logo: 'https://res.cloudinary.com/dakh64xhy/image/upload/v1783787856/Screenshot_2026-07-11_at_10.07.28_PM_dfofqs.png',
  },
] as const;

export const BASE_OPERATORS = [
  { name: 'Raghav Cold Storage', address: 'Brahmpur', logo: '' },
  { name: 'Satnam Cold Storage', address: 'Madhojhanda', logo: '' },
  {
    name: 'Bolina Farms',
    address: 'Karari',
    logo: 'https://res.cloudinary.com/dakh64xhy/image/upload/v1771577081/WhatsApp_Image_2026-02-20_at_14.13.32_phrbc8.jpg',
  },
  { name: 'Dihati Cold Storage', address: 'Kagniwal', logo: '' },
  { name: 'Shri Guru Harigobind Cold Storage', address: 'Beas Pind', logo: '' },
  {
    name: 'Mandip Farms',
    address: 'Nakodar Road',
    logo: 'https://res.cloudinary.com/dakh64xhy/image/upload/v1771318114/WhatsApp_Image_2026-02-17_at_14.17.00_anwnpv.jpg',
  },
  { name: 'Kartarpur Cold Storage', address: 'Kartarpur', logo: '' },
  { name: 'HS Cold Storage', address: 'Rani Bhatti', logo: '' },
  { name: 'Guri Kirpa Cold Storage', address: 'Kala Sanghian', logo: '' },
  { name: 'Gagan Cold Storage', address: 'Sham Chaurasi', logo: '' },
  { name: 'Gill Cold Storage', address: 'Kala Sangha Road', logo: '' },
  { name: 'Hazara Cold Storage', address: 'Hazara', logo: '' },
] as const;

export const STEPS = [
  {
    icon: Truck,
    num: '01',
    title: 'Farmer arrives with material',
    desc: 'A trolley pulls up at the gate with bags ready to store. Identify the farmer, commodity, and bag count — no register, no carbon copy.',
  },
  {
    icon: MessageSquare,
    num: '02',
    title: 'Create receipt on Coldop',
    desc: 'Issue a digital parchi in seconds. Transparent weights, zero disputes.',
  },
  {
    icon: NotebookPen,
    num: '03',
    title: 'The ledger writes itself',
    desc: 'Stock positions, FIFO order, rent dues, and farmer ledgers update automatically across every chamber.',
  },
];

export const FEATURES = [
  {
    icon: Globe,
    title: 'Access from anywhere',
    desc: 'Run your cold storage from anywhere in the world — on phone, tablet, or desktop. Your chambers, ledgers, and daybook stay with you.',
  },
  {
    icon: BookOpen,
    title: 'Daybook operations',
    desc: "Find, create, and manage today's stock movements from one screen — gate passes, transfers, and edit history included.",
  },
  {
    icon: Users,
    title: 'Farmer stock ledgers',
    desc: 'Per-farmer inventory, gate-pass history, and printable stock ledgers so balances stay clear for every account.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Stock transfers',
    desc: 'Move stored bags between farmer accounts without rewriting the books by hand or inventing a new weighment.',
  },
  {
    icon: BarChart3,
    title: 'Chamber occupancy analytics',
    desc: 'Capacity utilization, variety and size mix, top farmers, and location-wise views by chamber and floor.',
  },
  {
    icon: Wallet,
    title: 'Books & reports',
    desc: 'Vouchers and ledgers for the cold-storage books, plus Incoming, Outgoing, and Transfer reports in PDF and Excel.',
  },
];

export const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Chamber Map', id: 'chamber-map' },
  { label: 'Features', id: 'features' },
  { label: 'In the Field', id: 'in-the-field' },
];
