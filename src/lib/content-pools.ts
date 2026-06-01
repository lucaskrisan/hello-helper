export interface ContentItem {
  id: string;
  word: string;
  category: string;
  hint: string;
  level: 'easy' | 'medium' | 'hard';
  association: string;
  curiosity: string;
  isTrue?: boolean;
}

const generateItems = (category: string, count: number, startId: string): ContentItem[] => {
  const items: ContentItem[] = [];
  const words: Record<string, string[]> = {
    'Bíblia': [
      "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "Samuel", "Reis",
      "Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Isaías", "Jeremias",
      "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias", "Naum",
      "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias", "Mateus", "Marcos", "Lucas", "João", "Atos",
      "Romanos", "Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "Tessalonicenses", "Timóteo", "Tito", "Filemon",
      "Hebreus", "Tiago", "Pedro", "Judas", "Apocalipse", "Arca", "Dilúvio", "Egito", "Deserto", "Sinai",
      "Tabernáculo", "Templo", "Jerusalém", "Galileia", "Belém", "Nazaré", "Jordão", "Querubim", "Serafim", "Anjo",
      "Profeta", "Sacerdote", "Sacrifício", "Aliança", "Graça", "Perdão", "Misericórdia", "Sabedoria", "Justiça", "Paz",
      "Amor", "Esperança", "Fé", "Oração", "Jejum", "Dízimo", "Oferta", "Parábola", "Milagre", "Cura",
      "Ressurreição", "Pentecostes", "Sinagoga", "Batismo", "Ceia", "Cajado", "Harpa", "Coroa", "Trono", "Altar"
    ],
    'Culinária': [
      "Arroz", "Feijão", "Macarrão", "Carne", "Frango", "Peixe", "Ovo", "Salada", "Tomate", "Alface",
      "Cebola", "Alho", "Batata", "Cenoura", "Abóbora", "Chuchu", "Quiabo", "Jiló", "Beterraba", "Repolho",
      "Couve", "Espinafre", "Brócolis", "Couve-flor", "Milho", "Ervilha", "Lentilha", "Grão-de-bico", "Soja", "Trigo",
      "Açúcar", "Sal", "Óleo", "Azeite", "Manteiga", "Margarina", "Leite", "Queijo", "Iogurte", "Creme de Leite",
      "Leite Condensado", "Farinha", "Fermento", "Chocolate", "Cacau", "Mel", "Geleia", "Pão", "Biscoito", "Bolo",
      "Torta", "Quindim", "Pudim", "Mousse", "Sorvete", "Fruta", "Maçã", "Banana", "Laranja", "Limão",
      "Uva", "Morango", "Abacaxi", "Manga", "Mamão", "Melancia", "Pera", "Pêssego", "Ameixa", "Cereja",
      "Café", "Chá", "Suco", "Refrigerante", "Vinho", "Cerveja", "Água", "Tempero", "Pimenta", "Cominho",
      "Louro", "Canela", "Cravo", "Noz-moscada", "Orégano", "Manjericão", "Alecrim", "Tomilho", "Salsa", "Cebolinha",
      "Coentro", "Hortelã", "Gengibre", "Açafrão", "Curry", "Mostarda", "Ketchup", "Maionese", "Vinagre", "Shoyu"
    ],
    'Geografia': [
      "Brasil", "Argentina", "Chile", "Uruguai", "Paraguai", "Bolívia", "Peru", "Equador", "Colômbia", "Venezuela",
      "Portugal", "Espanha", "França", "Itália", "Alemanha", "Inglaterra", "Irlanda", "Grécia", "Suíça", "Áustria",
      "Bélgica", "Holanda", "Suécia", "Noruega", "Dinamarca", "Finlândia", "Rússia", "China", "Japão", "Índia",
      "Egito", "África do Sul", "Marrocos", "Angola", "Moçambique", "Canadá", "EUA", "México", "Austrália", "Nova Zelândia",
      "Brasília", "São Paulo", "Rio de Janeiro", "Salvador", "Belo Horizonte", "Curitiba", "Fortaleza", "Manaus", "Recife", "Porto Alegre",
      "Lisboa", "Madrid", "Paris", "Roma", "Londres", "Berlim", "Tóquio", "Pequim", "Nova Deli", "Cairo",
      "Amazonas", "Nilo", "Mississipi", "Danúbio", "Tâmisa", "Sena", "Tibre", "Ganges", "Amarelo", "Paraná",
      "Everest", "Andes", "Himalaia", "Alpes", "Pirineus", "Saara", "Gobi", "Atacama", "Pantanal", "Cerrado",
      "Oceano", "Atlântico", "Pacífico", "Índico", "Ártico", "Antártico", "Mar", "Mediterrâneo", "Vermelho", "Cáspio",
      "Ilha", "Arquipélago", "Península", "Continente", "Equador", "Trópico", "Meridiano", "Polo", "Norte", "Sul"
    ],
    'Saúde': [
      "Coração", "Pulmão", "Cérebro", "Fígado", "Rim", "Estômago", "Intestino", "Pele", "Osso", "Músculo",
      "Sangue", "Célula", "Neurônio", "Artéria", "Veia", "Vitamina", "Proteína", "Cálcio", "Ferro", "Magnésio",
      "Exercício", "Caminhada", "Natação", "Yoga", "Sono", "Descanso", "Água", "Hidratação", "Higiene", "Prevenção",
      "Médico", "Enfermeiro", "Dentista", "Fisioterapeuta", "Psicólogo", "Nutricionista", "Remédio", "Vacina", "Exame", "Check-up",
      "Pressão", "Diabetes", "Colesterol", "Imunidade", "Respiração", "Digestão", "Memória", "Visão", "Audição", "Olfato",
      "Paladar", "Tato", "Equilíbrio", "Postura", "Coluna", "Articulação", "Joelho", "Ombro", "Perna", "Braço",
      "Mão", "Pé", "Cabeça", "Pescoço", "Costas", "Barriga", "Peito", "Sorriso", "Alegria", "Bem-estar",
      "Saúde", "Vida", "Longevidade", "Vitalidade", "Energia", "Força", "Flexibilidade", "Calma", "Relaxamento", "Meditação",
      "Fruta", "Vegetal", "Cereal", "Grão", "Natural", "Orgânico", "Integral", "Fibra", "Antioxidante", "Suplemento"
    ],
    'Animais': [
      "Cachorro", "Gato", "Cavalo", "Vaca", "Boi", "Porco", "Ovelha", "Cabra", "Galinha", "Pato",
      "Leão", "Tigre", "Elefante", "Girafa", "Zebra", "Hipopótamo", "Rinoceronte", "Urso", "Lobo", "Raposa",
      "Macaco", "Gorila", "Chimpanzé", "Canguru", "Coala", "Panda", "Águia", "Gavião", "Coruja", "Beija-flor",
      "Papagaio", "Arara", "Pardal", "Pombo", "Cisne", "Flamingo", "Pinguim", "Baleia", "Golfinho", "Tubarão",
      "Polvo", "Lula", "Caranguejo", "Lagosta", "Tartaruga", "Jacaré", "Cobra", "Sapo", "Lagarto", "Camaleão",
      "Abelha", "Formiga", "Borboleta", "Aranha", "Besouro", "Grilo", "Gafanhoto", "Mosca", "Mosquito", "Joaninha",
      "Peixe", "Dourado", "Salmão", "Atum", "Sardinha", "Bacalhau", "Truta", "Tilápia", "Piranha", "Bagre",
      "Esquilo", "Coelho", "Hamster", "Rato", "Morcego", "Veado", "Alce", "Búfalo", "Camelo", "Dromedário",
      "Avestruz", "Pavão", "Peru", "Ganso", "Codorna", "Faisão", "Tucano", "Pelicano", "Gaivota", "Albatroz",
      "Escorpião", "Centopeia", "Caracol", "Minhoca", "Água-viva", "Estrela-do-mar", "Coral", "Esponja", "Cavalo-marinho", "Raia"
    ],
    'História': [
      "Egito", "Grécia", "Roma", "Império", "Reino", "Rei", "Rainha", "Príncipe", "Princesa", "Castelo",
      "Cavaleiro", "Espada", "Escudo", "Guerra", "Batalha", "Paz", "Tratado", "Revolução", "Independência", "Liberdade",
      "Descobrimento", "Navegação", "Caravela", "Mapa", "Bússola", "Pirâmide", "Faraó", "Esfinge", "Templo", "Arena",
      "Coliseu", "Senado", "Democracia", "República", "Ditadura", "Constituição", "Lei", "Cidadão", "Povo", "Cultura",
      "Arte", "Música", "Pintura", "Escultura", "Arquitetura", "Filosofia", "Ciência", "Invenção", "Tecnologia", "Indústria",
      "Renascimento", "Iluminismo", "Idade Média", "Antiguidade", "Modernidade", "Pré-história", "Fóssil", "Arqueologia", "Museu", "Arquivo",
      "Brasil Colônia", "Império do Brasil", "República Velha", "Era Vargas", "Ditadura Militar", "Redemocratização", "Constituinte", "Eleição", "Voto", "Presidente",
      "Pedro I", "Pedro II", "Deodoro", "Getúlio", "JK", "Tancredo", "Sarney", "Collor", "Itamar", "FHC",
      "Cabral", "Colombo", "Vasco da Gama", "Magalhães", "Marco Polo", "Napoleão", "César", "Alexandre", "Lincoln", "Churchill",
      "Gandhi", "Mandela", "Luther King", "Einstein", "Leonardo da Vinci", "Galileu", "Newton", "Darwin", "Marx", "Freud"
    ],
    'Objetos': [
      "Cadeira", "Mesa", "Cama", "Armário", "Sofá", "Estante", "Tapete", "Cortina", "Luminária", "Abajur",
      "Geladeira", "Fogão", "Micro-ondas", "Liquidificador", "Batedeira", "Cafeteira", "Torradeira", "Filtro", "Panela", "Frigideira",
      "Prato", "Copo", "Talher", "Garfo", "Faca", "Colher", "Xícara", "Caneca", "Pote", "Bacia",
      "Vassoura", "Rodo", "Balde", "Pano", "Esponja", "Sabão", "Detergente", "Amaciante", "Ferro", "Tábua",
      "Televisão", "Rádio", "Telefone", "Celular", "Computador", "Relógio", "Câmera", "Calculadora", "Lanterna", "Pilha",
      "Livro", "Caderno", "Caneta", "Lápis", "Borracha", "Régua", "Tesoura", "Cola", "Papel", "Envelope",
      "Chave", "Cadeado", "Martelo", "Alicate", "Chave de Fenda", "Prego", "Parafuso", "Serrote", "Escada", "Corda",
      "Vaso", "Quadro", "Espelho", "Porta-retrato", "Enfeite", "Vela", "Porta", "Janela", "Maçaneta", "Trinco",
      "Mochila", "Bolsa", "Carteira", "Óculos", "Relógio de Pulso", "Guarda-chuva", "Maleta", "Caixa", "Cesto", "Lixeira",
      "Pente", "Escova", "Secador", "Toalha", "Sabonete", "Shampoo", "Escova de Dente", "Pasta", "Fio Dental", "Barbeador"
    ],
    'Profissões': [
      "Professor", "Médico", "Enfermeiro", "Dentista", "Veterinário", "Engenheiro", "Arquiteto", "Advogado", "Juiz", "Policial",
      "Bombeiro", "Militar", "Piloto", "Marinheiro", "Motorista", "Caminhoneiro", "Taxista", "Carteiro", "Gari", "Jardineiro",
      "Pedreiro", "Carpinteiro", "Eletricista", "Encanador", "Pintor", "Mecânico", "Soldador", "Marceneiro", "Ferreiro", "Mineiro",
      "Agricultor", "Pescador", "Pecuarista", "Cozinheiro", "Garçom", "Padeiro", "Confeiteiro", "Açougueiro", "Feirante", "Vendedor",
      "Gerente", "Secretária", "Contador", "Administrador", "Economista", "Jornalista", "Escritor", "Poeta", "Editor", "Bibliotecário",
      "Ator", "Cantor", "Músico", "Dançarino", "Pintor", "Escultor", "Fotógrafo", "Designer", "Cineasta", "Produtor",
      "Programador", "Analista", "Técnico", "Cientista", "Pesquisador", "Biólogo", "Químico", "Físico", "Astrônomo", "Geólogo",
      "Psicólogo", "Sociólogo", "Filósofo", "Historiador", "Geógrafo", "Arqueólogo", "Antropólogo", "Teólogo", "Missionário", "Pastor",
      "Atleta", "Treinador", "Árbitro", "Salva-vidas", "Guia Turístico", "Aeromoça", "Recepcionista", "Atendente", "Operador", "Vigilante",
      "Costureira", "Alfaiate", "Sapateiro", "Barbeiro", "Cabeleireiro", "Manicure", "Esteticista", "Maquiador", "Artesão", "Modelista"
    ],
    'Família': [
      "Pai", "Mãe", "Filho", "Filha", "Irmão", "Irmã", "Avô", "Avó", "Neto", "Neta",
      "Bisavô", "Bisavó", "Bisneto", "Bisneta", "Tio", "Tia", "Sobrinho", "Sobrinha", "Primo", "Prima",
      "Sogro", "Sogra", "Genro", "Nora", "Cunhado", "Cunhada", "Padrasto", "Madrasta", "Enteado", "Enteada",
      "Padrinho", "Madrinha", "Afilhado", "Afilhada", "Compadre", "Comadre", "Esposo", "Esposa", "Noivo", "Noiva",
      "Casamento", "União", "Família", "Parentesco", "Ancestral", "Descendente", "Geração", "Linhagem", "Sobrenome", "Nome",
      "Infância", "Juventude", "Adultez", "Velhice", "Nascimento", "Aniversário", "Batizado", "Formatura", "Festa", "Reunião",
      "Amor", "Carinho", "Respeito", "Cuidado", "Proteção", "Educação", "Exemplo", "Herança", "Tradição", "História",
      "Casa", "Lar", "Convivência", "Diálogo", "Apoio", "Conselho", "Abraço", "Beijo", "Sorriso", "Lágrima",
      "Saudade", "Lembrança", "Álbum", "Retrato", "Presente", "Viagem", "Passeio", "Almoço", "Jantar", "Café",
      "Segurança", "Confiança", "Lealdade", "Amizade", "Gratidão", "Paciência", "Perdão", "União", "Força", "Pilar"
    ],
    'Cidades': [
      "Rio de Janeiro", "São Paulo", "Belo Horizonte", "Salvador", "Fortaleza", "Brasília", "Curitiba", "Manaus", "Recife", "Porto Alegre",
      "Belém", "Goiânia", "Guarulhos", "Campinas", "São Luís", "São Gonçalo", "Maceió", "Duque de Caxias", "Natal", "Teresina",
      "São Bernardo", "Nova Iguaçu", "Campo Grande", "João Pessoa", "Santo André", "Osasco", "Jaboatão", "Ribeirão Preto", "Uberlândia", "Contagem",
      "Sorocaba", "Aracaju", "Feira de Santana", "Cuiabá", "Joinville", "Juiz de Fora", "Londrina", "Aparecida de Goiânia", "Ananindeua", "Porto Velho",
      "Niterói", "Belford Roxo", "Serra", "Caxias do Sul", "Campos dos Goytacazes", "Macapá", "Florianópolis", "Vila Velha", "Mauá", "São João de Meriti",
      "Piracicaba", "Santos", "São José dos Campos", "Betim", "Mogi das Cruzes", "Diadema", "Campina Grande", "Jundiaí", "Maringá", "Montes Claros",
      "Rio Branco", "Anápolis", "Caruaru", "Vitória", "Caucaia", "Itapevi", "Santana de Parnaíba", "Barueri", "Indaiatuba", "Cotia",
      "Americana", "Jacareí", "Marília", "Presidente Prudente", "Bauru", "Franca", "Limeira", "Taubaté", "Sumaré", "São Carlos",
      "Araraquara", "Hortolândia", "Valinhos", "Vinhedo", "Itatiba", "Bragança Paulista", "Atibaia", "Pouso Alegre", "Varginha", "Poços de Caldas",
      "Uberaba", "Patos de Minas", "Divinópolis", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Passo Fundo", "Santa Maria", "Pelotas", "Canoas"
    ]
  };

  const categoryWords = words[category] || [];
  for (let i = 0; i < Math.min(count, categoryWords.length); i++) {
    items.push({
      id: `${startId}${i + 1}`,
      word: categoryWords[i],
      category: category,
      hint: `Item de ${category}`,
      level: i < 30 ? 'easy' : i < 70 ? 'medium' : 'hard',
      association: category.toLowerCase(),
      curiosity: `${categoryWords[i]} é um elemento importante em ${category}.`,
      isTrue: Math.random() > 0.3
    });
  }
  return items;
};

export const CONTENT_POOLS: Record<string, ContentItem[]> = {
  biblia: generateItems('Bíblia', 100, 'b'),
  culinaria: generateItems('Culinária', 100, 'c'),
  geografia: generateItems('Geografia', 100, 'g'),
  saude: generateItems('Saúde', 100, 's'),
  animais: generateItems('Animais', 100, 'a'),
  historia: generateItems('História', 100, 'h'),
  objetos: generateItems('Objetos', 100, 'o'),
  profissoes: generateItems('Profissões', 100, 'p'),
  familia: generateItems('Família', 100, 'f'),
  cidades: generateItems('Cidades', 100, 'ci')
};

export const generateExtendedPool = () => {
  return CONTENT_POOLS;
};
