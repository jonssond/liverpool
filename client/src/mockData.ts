export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: number;
  price: number;
  coverUrl: string;
  stock: number;
}

export interface Address {
  id: string;
  type: 'cobranca' | 'entrega';
  tipoResidencia: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface CreditCard {
  id: string;
  number: string;
  name: string;
  brand: string;
  cvv: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  cpf: string;
  gender: string;
  birthdate: string;
  phone: string;
  active: boolean;
  addresses: Address[];
  cards: CreditCard[];
}

export interface OrderItem {
  vinylId: string;
  title: string;
  artist: string;
  coverUrl: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  freight: number;
  discount: number;
  total: number;
  status:
    | 'EM ABERTO'
    | 'EM PROCESSAMENTO'
    | 'PAGAMENTO REALIZADO'
    | 'EM TRÂNSITO'
    | 'ENTREGUE'
    | 'TROCA SOLICITADA'
    | 'TROCA ACEITA'
    | 'TROCA NEGADA'
    | 'ITEM ENVIADO'
    | 'ITEM RECEBIDO'
    | 'TROCA PROCESSADA'
    | 'CANCELADO';
  paymentDetails: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  value: number;
  type: 'promocional' | 'troca';
  active: boolean;
}

export const INITIAL_VINYLS: Vinyl[] = [
  {
    id: "v1",
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    genre: "Progressive Rock",
    year: 1973,
    price: 249.90,
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/e635a8510c1a74bc089b3566ebbb9cb8/250x250-000000-80-0-0.jpg",
    stock: 8
  },
  {
    id: "v2",
    title: "Kind of Blue",
    artist: "Miles Davis",
    genre: "Jazz",
    year: 1959,
    price: 199.90,
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/fb9fbd93db667e24d4f5dee781e83f7d/250x250-000000-80-0-0.jpg",
    stock: 5
  },
  {
    id: "v3",
    title: "Abbey Road",
    artist: "The Beatles",
    genre: "Rock",
    year: 1969,
    price: 229.90,
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/aa94ab293730bb7845d2aa8c672b2c29/250x250-000000-80-0-0.jpg",
    stock: 12
  },
  {
    id: "v4",
    title: "Random Access Memories",
    artist: "Daft Punk",
    genre: "Electronic",
    year: 2013,
    price: 299.90,
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/311bba0fc112d15f72c8b5a65f0456c1/250x250-000000-80-0-0.jpg",
    stock: 3
  },
  {
    id: "v5",
    title: "Rumours",
    artist: "Fleetwood Mac",
    genre: "Classic Rock",
    year: 1977,
    price: 189.90,
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/9732751ce91d786dcf30069853697078/250x250-000000-80-0-0.jpg",
    stock: 6
  },
  {
    id: "v6",
    title: "Thriller",
    artist: "Michael Jackson",
    genre: "Pop",
    year: 1982,
    price: 179.90,
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/f01e09ceb8ad1e96707c1b4aadb5911b/250x250-000000-80-0-0.jpg",
    stock: 10
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Diogo Jonsson",
    email: "diogo@discos.com",
    cpf: "123.456.789-00",
    gender: "Masculino",
    birthdate: "1998-05-15",
    phone: "Celular (11) 98765-4321",
    active: true,
    addresses: [
      {
        id: "a1",
        type: "entrega",
        tipoResidencia: "Apartamento",
        tipoLogradouro: "Avenida",
        logradouro: "Paulista",
        numero: "1000",
        bairro: "Bela Vista",
        cep: "01310-100",
        cidade: "São Paulo",
        estado: "SP",
        pais: "Brasil"
      },
      {
        id: "a2",
        type: "cobranca",
        tipoResidencia: "Casa",
        tipoLogradouro: "Rua",
        logradouro: "Augusta",
        numero: "250",
        bairro: "Consolação",
        cep: "01305-000",
        cidade: "São Paulo",
        estado: "SP",
        pais: "Brasil"
      }
    ],
    cards: [
      {
        id: "card1",
        number: "**** **** **** 4321",
        name: "DIOGO JONSSON",
        brand: "Visa",
        cvv: "123"
      },
      {
        id: "card2",
        number: "**** **** **** 8765",
        name: "DIOGO JONSSON",
        brand: "Mastercard",
        cvv: "456"
      }
    ]
  },
  {
    id: "c2",
    name: "Clara Maria",
    email: "clara@discos.com",
    cpf: "987.654.321-11",
    gender: "Feminino",
    birthdate: "1995-10-22",
    phone: "Celular (21) 99888-7766",
    active: true,
    addresses: [
      {
        id: "a3",
        type: "entrega",
        tipoResidencia: "Apartamento",
        tipoLogradouro: "Rua",
        logradouro: "Copacabana",
        numero: "450",
        bairro: "Copacabana",
        cep: "22020-001",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        pais: "Brasil"
      },
      {
        id: "a4",
        type: "cobranca",
        tipoResidencia: "Apartamento",
        tipoLogradouro: "Rua",
        logradouro: "Copacabana",
        numero: "450",
        bairro: "Copacabana",
        cep: "22020-001",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        pais: "Brasil"
      }
    ],
    cards: [
      {
        id: "card3",
        number: "**** **** **** 9911",
        name: "CLARA MARIA",
        brand: "Elo",
        cvv: "789"
      }
    ]
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { id: "cp1", code: "LIVERPOOL10", value: 10, type: "promocional", active: true },
  { id: "cp2", code: "VINYL20", value: 20, type: "promocional", active: true },
  { id: "cp3", code: "TROCA_DIOGO_50", value: 50.00, type: "troca", active: true },
  { id: "cp4", code: "TROCA_CLARA_30", value: 30.00, type: "troca", active: true }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "PED-001",
    customerId: "c1",
    customerName: "Diogo Jonsson",
    items: [
      {
        vinylId: "v1",
        title: "The Dark Side of the Moon",
        artist: "Pink Floyd",
        coverUrl: "https://cdn-images.dzcdn.net/images/cover/e635a8510c1a74bc089b3566ebbb9cb8/250x250-000000-80-0-0.jpg",
        price: 249.90,
        quantity: 1
      }
    ],
    subtotal: 249.90,
    freight: 15.00,
    discount: 0,
    total: 264.90,
    status: "ENTREGUE",
    paymentDetails: "Pago com Cartão Visa (4321)",
    createdAt: "2026-08-10 14:35"
  },
  {
    id: "PED-002",
    customerId: "c1",
    customerName: "Diogo Jonsson",
    items: [
      {
        vinylId: "v2",
        title: "Kind of Blue",
        artist: "Miles Davis",
        coverUrl: "https://cdn-images.dzcdn.net/images/cover/fb9fbd93db667e24d4f5dee781e83f7d/250x250-000000-80-0-0.jpg",
        price: 199.90,
        quantity: 1
      }
    ],
    subtotal: 199.90,
    freight: 15.00,
    discount: 10,
    total: 204.90,
    status: "EM ABERTO",
    paymentDetails: "Cupom LIVERPOOL10 (R$ 10) + Cartão Mastercard (8765)",
    createdAt: "2026-08-23 11:20"
  }
];
