import { ContentItem } from './content-pools';

type WordsByCategory = Record<string, string[]>;

const generateItems = (
  category: string,
  count: number,
  startId: string,
  categoryWords: string[]
): ContentItem[] => {
  const items: ContentItem[] = [];
  for (let i = 0; i < Math.min(count, categoryWords.length); i++) {
    items.push({
      id: `${startId}${i + 1}`,
      word: categoryWords[i],
      category: category,
      hint: '',
      level: i < 30 ? 'easy' : i < 70 ? 'medium' : 'hard',
      association: category.toLowerCase(),
      curiosity: '',
      isTrue: Math.random() > 0.3,
    });
  }
  return items;
};

// ============================================================================
// ESPAÑOL — LATAM genérico (válido para MX, AR, CO, CL, PE, etc.)
// ============================================================================

const ES_WORDS: WordsByCategory = {
  Biblia: [
    'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut', 'Samuel', 'Reyes',
    'Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Isaías', 'Jeremías',
    'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahum',
    'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías', 'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos',
    'Romanos', 'Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', 'Tesalonicenses', 'Timoteo', 'Tito', 'Filemón',
    'Hebreos', 'Santiago', 'Pedro', 'Judas', 'Apocalipsis', 'Arca', 'Diluvio', 'Egipto', 'Desierto', 'Sinaí',
    'Tabernáculo', 'Templo', 'Jerusalén', 'Galilea', 'Belén', 'Nazaret', 'Jordán', 'Querubín', 'Serafín', 'Ángel',
    'Profeta', 'Sacerdote', 'Sacrificio', 'Alianza', 'Gracia', 'Perdón', 'Misericordia', 'Sabiduría', 'Justicia', 'Paz',
    'Amor', 'Esperanza', 'Fe', 'Oración', 'Ayuno', 'Diezmo', 'Ofrenda', 'Parábola', 'Milagro', 'Sanidad',
    'Resurrección', 'Pentecostés', 'Sinagoga', 'Bautismo', 'Cena', 'Cayado', 'Arpa', 'Corona', 'Trono', 'Altar',
  ],
  Cocina: [
    'Arroz', 'Frijol', 'Pasta', 'Carne', 'Pollo', 'Pescado', 'Huevo', 'Ensalada', 'Tomate', 'Lechuga',
    'Cebolla', 'Ajo', 'Papa', 'Zanahoria', 'Calabaza', 'Chile', 'Pimiento', 'Aguacate', 'Betabel', 'Repollo',
    'Espinaca', 'Brócoli', 'Coliflor', 'Maíz', 'Arveja', 'Lenteja', 'Garbanzo', 'Soya', 'Trigo', 'Azúcar',
    'Sal', 'Aceite', 'Mantequilla', 'Margarina', 'Leche', 'Queso', 'Yogurt', 'Crema', 'Harina', 'Levadura',
    'Chocolate', 'Cacao', 'Miel', 'Mermelada', 'Pan', 'Galleta', 'Pastel', 'Tarta', 'Flan', 'Helado',
    'Manzana', 'Plátano', 'Naranja', 'Limón', 'Uva', 'Fresa', 'Piña', 'Mango', 'Papaya', 'Sandía',
    'Pera', 'Durazno', 'Ciruela', 'Cereza', 'Café', 'Té', 'Jugo', 'Refresco', 'Vino', 'Cerveza',
    'Agua', 'Pimienta', 'Comino', 'Laurel', 'Canela', 'Clavo', 'Nuez moscada', 'Orégano', 'Albahaca', 'Romero',
    'Tomillo', 'Perejil', 'Cilantro', 'Hierbabuena', 'Jengibre', 'Azafrán', 'Mostaza', 'Mayonesa', 'Vinagre', 'Salsa',
    'Tortilla', 'Empanada', 'Tamale', 'Ceviche', 'Asado', 'Guacamole', 'Mole', 'Arepa', 'Chimichurri', 'Dulce de leche',
  ],
  Geografía: [
    'Argentina', 'Brasil', 'Chile', 'Uruguay', 'Paraguay', 'Bolivia', 'Perú', 'Ecuador', 'Colombia', 'Venezuela',
    'México', 'Cuba', 'República Dominicana', 'Puerto Rico', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá',
    'España', 'Portugal', 'Francia', 'Italia', 'Alemania', 'Inglaterra', 'Irlanda', 'Grecia', 'Suiza', 'Austria',
    'Bélgica', 'Holanda', 'Suecia', 'Noruega', 'Dinamarca', 'Finlandia', 'Rusia', 'China', 'Japón', 'India',
    'Egipto', 'Sudáfrica', 'Marruecos', 'Canadá', 'EE.UU.', 'Australia', 'Nueva Zelanda', 'Buenos Aires', 'Ciudad de México', 'Bogotá',
    'Lima', 'Santiago', 'Caracas', 'Quito', 'La Paz', 'Asunción', 'Montevideo', 'San José', 'La Habana', 'Madrid',
    'Barcelona', 'París', 'Roma', 'Londres', 'Berlín', 'Tokio', 'Pekín', 'El Cairo', 'Amazonas', 'Nilo',
    'Misisipi', 'Danubio', 'Sena', 'Ganges', 'Everest', 'Andes', 'Himalaya', 'Alpes', 'Pirineos', 'Sahara',
    'Atacama', 'Patagonia', 'Pampa', 'Caribe', 'Océano', 'Atlántico', 'Pacífico', 'Índico', 'Mediterráneo', 'Continente',
    'Isla', 'Península', 'Ecuador', 'Trópico', 'Polo', 'Norte', 'Sur', 'Este', 'Oeste', 'Cordillera',
  ],
  Salud: [
    'Corazón', 'Pulmón', 'Cerebro', 'Hígado', 'Riñón', 'Estómago', 'Intestino', 'Piel', 'Hueso', 'Músculo',
    'Sangre', 'Célula', 'Neurona', 'Arteria', 'Vena', 'Vitamina', 'Proteína', 'Calcio', 'Hierro', 'Magnesio',
    'Ejercicio', 'Caminata', 'Natación', 'Yoga', 'Sueño', 'Descanso', 'Agua', 'Hidratación', 'Higiene', 'Prevención',
    'Médico', 'Enfermera', 'Dentista', 'Fisioterapeuta', 'Psicólogo', 'Nutricionista', 'Medicamento', 'Vacuna', 'Examen', 'Chequeo',
    'Presión', 'Diabetes', 'Colesterol', 'Inmunidad', 'Respiración', 'Digestión', 'Memoria', 'Visión', 'Audición', 'Olfato',
    'Gusto', 'Tacto', 'Equilibrio', 'Postura', 'Columna', 'Articulación', 'Rodilla', 'Hombro', 'Pierna', 'Brazo',
    'Mano', 'Pie', 'Cabeza', 'Cuello', 'Espalda', 'Vientre', 'Pecho', 'Sonrisa', 'Alegría', 'Bienestar',
    'Salud', 'Vida', 'Longevidad', 'Vitalidad', 'Energía', 'Fuerza', 'Flexibilidad', 'Calma', 'Relajación', 'Meditación',
    'Fruta', 'Verdura', 'Cereal', 'Grano', 'Natural', 'Orgánico', 'Integral', 'Fibra', 'Antioxidante', 'Suplemento',
    'Aire', 'Sol', 'Naturaleza', 'Paz', 'Mente', 'Cuerpo', 'Equilibrio', 'Armonía', 'Amor', 'Felicidad',
  ],
  Animales: [
    'Perro', 'Gato', 'Caballo', 'Vaca', 'Toro', 'Cerdo', 'Oveja', 'Cabra', 'Gallina', 'Pato',
    'León', 'Tigre', 'Elefante', 'Jirafa', 'Cebra', 'Hipopótamo', 'Rinoceronte', 'Oso', 'Lobo', 'Zorro',
    'Mono', 'Gorila', 'Chimpancé', 'Canguro', 'Koala', 'Panda', 'Águila', 'Halcón', 'Búho', 'Colibrí',
    'Loro', 'Guacamayo', 'Gorrión', 'Paloma', 'Cisne', 'Flamenco', 'Pingüino', 'Ballena', 'Delfín', 'Tiburón',
    'Pulpo', 'Calamar', 'Cangrejo', 'Langosta', 'Tortuga', 'Cocodrilo', 'Serpiente', 'Sapo', 'Lagarto', 'Camaleón',
    'Abeja', 'Hormiga', 'Mariposa', 'Araña', 'Escarabajo', 'Grillo', 'Saltamontes', 'Mosca', 'Mosquito', 'Mariquita',
    'Pez', 'Salmón', 'Atún', 'Sardina', 'Bacalao', 'Trucha', 'Tilapia', 'Piraña', 'Anguila', 'Raya',
    'Ardilla', 'Conejo', 'Hámster', 'Ratón', 'Murciélago', 'Venado', 'Alce', 'Búfalo', 'Camello', 'Dromedario',
    'Avestruz', 'Pavo real', 'Pavo', 'Ganso', 'Codorniz', 'Faisán', 'Tucán', 'Pelícano', 'Gaviota', 'Albatros',
    'Escorpión', 'Ciempiés', 'Caracol', 'Lombriz', 'Medusa', 'Estrella de mar', 'Coral', 'Esponja', 'Caballito de mar', 'Foca',
  ],
  Historia: [
    'Egipto', 'Grecia', 'Roma', 'Imperio', 'Reino', 'Rey', 'Reina', 'Príncipe', 'Princesa', 'Castillo',
    'Caballero', 'Espada', 'Escudo', 'Guerra', 'Batalla', 'Paz', 'Tratado', 'Revolución', 'Independencia', 'Libertad',
    'Descubrimiento', 'Navegación', 'Carabela', 'Mapa', 'Brújula', 'Pirámide', 'Faraón', 'Esfinge', 'Templo', 'Arena',
    'Coliseo', 'Senado', 'Democracia', 'República', 'Dictadura', 'Constitución', 'Ley', 'Ciudadano', 'Pueblo', 'Cultura',
    'Arte', 'Música', 'Pintura', 'Escultura', 'Arquitectura', 'Filosofía', 'Ciencia', 'Invención', 'Tecnología', 'Industria',
    'Renacimiento', 'Ilustración', 'Edad Media', 'Antigüedad', 'Modernidad', 'Prehistoria', 'Fósil', 'Arqueología', 'Museo', 'Archivo',
    'Colonia', 'Conquista', 'Virreinato', 'Independencia', 'Revolución', 'Constituyente', 'Elección', 'Voto', 'Presidente', 'Congreso',
    'Bolívar', 'San Martín', 'Hidalgo', 'Juárez', 'Sarmiento', 'Martí', 'O\'Higgins', 'Sucre', 'Allende', 'Perón',
    'Colón', 'Cortés', 'Pizarro', 'Magallanes', 'Marco Polo', 'Napoleón', 'César', 'Alejandro', 'Lincoln', 'Churchill',
    'Gandhi', 'Mandela', 'Luther King', 'Einstein', 'Da Vinci', 'Galileo', 'Newton', 'Darwin', 'Marx', 'Freud',
  ],
  Objetos: [
    'Silla', 'Mesa', 'Cama', 'Armario', 'Sofá', 'Estante', 'Alfombra', 'Cortina', 'Lámpara', 'Velador',
    'Refrigerador', 'Estufa', 'Microondas', 'Licuadora', 'Batidora', 'Cafetera', 'Tostadora', 'Filtro', 'Olla', 'Sartén',
    'Plato', 'Vaso', 'Cubierto', 'Tenedor', 'Cuchillo', 'Cuchara', 'Taza', 'Tazón', 'Bote', 'Cuenco',
    'Escoba', 'Trapo', 'Cubo', 'Paño', 'Esponja', 'Jabón', 'Detergente', 'Suavizante', 'Plancha', 'Tabla',
    'Televisor', 'Radio', 'Teléfono', 'Celular', 'Computadora', 'Reloj', 'Cámara', 'Calculadora', 'Linterna', 'Pila',
    'Libro', 'Cuaderno', 'Bolígrafo', 'Lápiz', 'Goma', 'Regla', 'Tijera', 'Pegamento', 'Papel', 'Sobre',
    'Llave', 'Candado', 'Martillo', 'Alicate', 'Destornillador', 'Clavo', 'Tornillo', 'Serrucho', 'Escalera', 'Cuerda',
    'Florero', 'Cuadro', 'Espejo', 'Portarretrato', 'Adorno', 'Vela', 'Puerta', 'Ventana', 'Manija', 'Cerrojo',
    'Mochila', 'Bolsa', 'Cartera', 'Lentes', 'Reloj de pulsera', 'Paraguas', 'Maletín', 'Caja', 'Cesto', 'Basurero',
    'Peine', 'Cepillo', 'Secador', 'Toalla', 'Jabón', 'Champú', 'Cepillo de dientes', 'Pasta', 'Hilo dental', 'Rasuradora',
  ],
  Profesiones: [
    'Profesor', 'Médico', 'Enfermero', 'Dentista', 'Veterinario', 'Ingeniero', 'Arquitecto', 'Abogado', 'Juez', 'Policía',
    'Bombero', 'Militar', 'Piloto', 'Marinero', 'Chofer', 'Camionero', 'Taxista', 'Cartero', 'Barrendero', 'Jardinero',
    'Albañil', 'Carpintero', 'Electricista', 'Plomero', 'Pintor', 'Mecánico', 'Soldador', 'Ebanista', 'Herrero', 'Minero',
    'Agricultor', 'Pescador', 'Ganadero', 'Cocinero', 'Mesero', 'Panadero', 'Pastelero', 'Carnicero', 'Vendedor', 'Comerciante',
    'Gerente', 'Secretaria', 'Contador', 'Administrador', 'Economista', 'Periodista', 'Escritor', 'Poeta', 'Editor', 'Bibliotecario',
    'Actor', 'Cantante', 'Músico', 'Bailarín', 'Pintor', 'Escultor', 'Fotógrafo', 'Diseñador', 'Cineasta', 'Productor',
    'Programador', 'Analista', 'Técnico', 'Científico', 'Investigador', 'Biólogo', 'Químico', 'Físico', 'Astrónomo', 'Geólogo',
    'Psicólogo', 'Sociólogo', 'Filósofo', 'Historiador', 'Geógrafo', 'Arqueólogo', 'Antropólogo', 'Teólogo', 'Misionero', 'Pastor',
    'Atleta', 'Entrenador', 'Árbitro', 'Salvavidas', 'Guía turístico', 'Azafata', 'Recepcionista', 'Cajero', 'Operador', 'Vigilante',
    'Costurera', 'Sastre', 'Zapatero', 'Barbero', 'Peluquero', 'Manicurista', 'Esteticista', 'Maquillador', 'Artesano', 'Modista',
  ],
  Familia: [
    'Padre', 'Madre', 'Hijo', 'Hija', 'Hermano', 'Hermana', 'Abuelo', 'Abuela', 'Nieto', 'Nieta',
    'Bisabuelo', 'Bisabuela', 'Bisnieto', 'Bisnieta', 'Tío', 'Tía', 'Sobrino', 'Sobrina', 'Primo', 'Prima',
    'Suegro', 'Suegra', 'Yerno', 'Nuera', 'Cuñado', 'Cuñada', 'Padrastro', 'Madrastra', 'Hijastro', 'Hijastra',
    'Padrino', 'Madrina', 'Ahijado', 'Ahijada', 'Compadre', 'Comadre', 'Esposo', 'Esposa', 'Novio', 'Novia',
    'Casamiento', 'Unión', 'Familia', 'Parentesco', 'Antepasado', 'Descendiente', 'Generación', 'Linaje', 'Apellido', 'Nombre',
    'Infancia', 'Juventud', 'Adultez', 'Vejez', 'Nacimiento', 'Cumpleaños', 'Bautismo', 'Graduación', 'Fiesta', 'Reunión',
    'Amor', 'Cariño', 'Respeto', 'Cuidado', 'Protección', 'Educación', 'Ejemplo', 'Herencia', 'Tradición', 'Historia',
    'Casa', 'Hogar', 'Convivencia', 'Diálogo', 'Apoyo', 'Consejo', 'Abrazo', 'Beso', 'Sonrisa', 'Lágrima',
    'Añoranza', 'Recuerdo', 'Álbum', 'Retrato', 'Regalo', 'Viaje', 'Paseo', 'Almuerzo', 'Cena', 'Desayuno',
    'Seguridad', 'Confianza', 'Lealtad', 'Amistad', 'Gratitud', 'Paciencia', 'Perdón', 'Unión', 'Fuerza', 'Pilar',
  ],
  Ciudades: [
    'Buenos Aires', 'Ciudad de México', 'Bogotá', 'Lima', 'Santiago', 'Caracas', 'Quito', 'La Paz', 'Asunción', 'Montevideo',
    'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Mérida', 'Cancún', 'Acapulco', 'Veracruz', 'Oaxaca',
    'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata', 'Salta', 'Tucumán', 'San Juan', 'Bariloche', 'Ushuaia',
    'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Santa Marta', 'Manizales', 'Pereira', 'Cúcuta', 'Ibagué',
    'Arequipa', 'Trujillo', 'Cusco', 'Chiclayo', 'Piura', 'Iquitos', 'Tacna', 'Huancayo', 'Pucallpa', 'Ayacucho',
    'Valparaíso', 'Concepción', 'Antofagasta', 'Viña del Mar', 'Temuco', 'Iquique', 'Punta Arenas', 'La Serena', 'Rancagua', 'Talca',
    'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'San Cristóbal', 'Maturín', 'Barcelona', 'Cumaná', 'Mérida',
    'Guayaquil', 'Cuenca', 'Manta', 'Ambato', 'Loja', 'Riobamba', 'Esmeraldas', 'Machala', 'Portoviejo', 'Ibarra',
    'Santa Cruz', 'Cochabamba', 'Sucre', 'Oruro', 'Tarija', 'Potosí', 'El Alto', 'Trinidad', 'Cobija', 'Camiri',
    'San José', 'Tegucigalpa', 'Managua', 'Panamá', 'San Salvador', 'Guatemala', 'Santo Domingo', 'La Habana', 'San Juan', 'Madrid',
  ],
};

const EN_WORDS: WordsByCategory = {
  Bible: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 'Samuel', 'Kings',
    'Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
    'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', 'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus', 'Philemon',
    'Hebrews', 'James', 'Peter', 'Jude', 'Revelation', 'Ark', 'Flood', 'Egypt', 'Desert', 'Sinai',
    'Tabernacle', 'Temple', 'Jerusalem', 'Galilee', 'Bethlehem', 'Nazareth', 'Jordan', 'Cherub', 'Seraph', 'Angel',
    'Prophet', 'Priest', 'Sacrifice', 'Covenant', 'Grace', 'Forgiveness', 'Mercy', 'Wisdom', 'Justice', 'Peace',
    'Love', 'Hope', 'Faith', 'Prayer', 'Fasting', 'Tithe', 'Offering', 'Parable', 'Miracle', 'Healing',
    'Resurrection', 'Pentecost', 'Synagogue', 'Baptism', 'Supper', 'Staff', 'Harp', 'Crown', 'Throne', 'Altar',
  ],
  Cooking: [
    'Rice', 'Beans', 'Pasta', 'Beef', 'Chicken', 'Fish', 'Egg', 'Salad', 'Tomato', 'Lettuce',
    'Onion', 'Garlic', 'Potato', 'Carrot', 'Pumpkin', 'Pepper', 'Avocado', 'Beet', 'Cabbage', 'Spinach',
    'Broccoli', 'Cauliflower', 'Corn', 'Pea', 'Lentil', 'Chickpea', 'Soy', 'Wheat', 'Sugar', 'Salt',
    'Oil', 'Butter', 'Margarine', 'Milk', 'Cheese', 'Yogurt', 'Cream', 'Flour', 'Yeast', 'Chocolate',
    'Cocoa', 'Honey', 'Jam', 'Bread', 'Cookie', 'Cake', 'Pie', 'Pudding', 'Mousse', 'Ice cream',
    'Apple', 'Banana', 'Orange', 'Lemon', 'Grape', 'Strawberry', 'Pineapple', 'Mango', 'Papaya', 'Watermelon',
    'Pear', 'Peach', 'Plum', 'Cherry', 'Coffee', 'Tea', 'Juice', 'Soda', 'Wine', 'Beer',
    'Water', 'Black pepper', 'Cumin', 'Bay leaf', 'Cinnamon', 'Clove', 'Nutmeg', 'Oregano', 'Basil', 'Rosemary',
    'Thyme', 'Parsley', 'Cilantro', 'Mint', 'Ginger', 'Saffron', 'Mustard', 'Mayo', 'Vinegar', 'Soy sauce',
    'Pancake', 'Burger', 'Pizza', 'Sandwich', 'Steak', 'Bacon', 'Sausage', 'Toast', 'Donut', 'Muffin',
  ],
  Geography: [
    'USA', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Cuba',
    'UK', 'Ireland', 'France', 'Spain', 'Portugal', 'Italy', 'Germany', 'Switzerland', 'Austria', 'Belgium',
    'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Greece', 'Russia', 'China', 'Japan', 'India',
    'Egypt', 'South Africa', 'Morocco', 'Australia', 'New Zealand', 'Washington', 'New York', 'Los Angeles', 'Chicago', 'Miami',
    'Boston', 'Seattle', 'Dallas', 'Houston', 'Denver', 'Atlanta', 'Philadelphia', 'San Francisco', 'Las Vegas', 'Phoenix',
    'London', 'Paris', 'Rome', 'Berlin', 'Madrid', 'Lisbon', 'Athens', 'Tokyo', 'Beijing', 'Sydney',
    'Amazon', 'Nile', 'Mississippi', 'Thames', 'Seine', 'Ganges', 'Yangtze', 'Danube', 'Volga', 'Rhine',
    'Everest', 'Andes', 'Himalayas', 'Alps', 'Rockies', 'Sahara', 'Gobi', 'Atacama', 'Atlantic', 'Pacific',
    'Indian Ocean', 'Arctic', 'Mediterranean', 'Caribbean', 'Continent', 'Island', 'Peninsula', 'Equator', 'Tropic', 'Pole',
    'North', 'South', 'East', 'West', 'Mountain', 'Valley', 'River', 'Lake', 'Forest', 'Beach',
  ],
  Health: [
    'Heart', 'Lung', 'Brain', 'Liver', 'Kidney', 'Stomach', 'Intestine', 'Skin', 'Bone', 'Muscle',
    'Blood', 'Cell', 'Neuron', 'Artery', 'Vein', 'Vitamin', 'Protein', 'Calcium', 'Iron', 'Magnesium',
    'Exercise', 'Walking', 'Swimming', 'Yoga', 'Sleep', 'Rest', 'Water', 'Hydration', 'Hygiene', 'Prevention',
    'Doctor', 'Nurse', 'Dentist', 'Physiotherapist', 'Psychologist', 'Nutritionist', 'Medicine', 'Vaccine', 'Exam', 'Checkup',
    'Pressure', 'Diabetes', 'Cholesterol', 'Immunity', 'Breathing', 'Digestion', 'Memory', 'Vision', 'Hearing', 'Smell',
    'Taste', 'Touch', 'Balance', 'Posture', 'Spine', 'Joint', 'Knee', 'Shoulder', 'Leg', 'Arm',
    'Hand', 'Foot', 'Head', 'Neck', 'Back', 'Belly', 'Chest', 'Smile', 'Joy', 'Wellbeing',
    'Health', 'Life', 'Longevity', 'Vitality', 'Energy', 'Strength', 'Flexibility', 'Calm', 'Relaxation', 'Meditation',
    'Fruit', 'Vegetable', 'Cereal', 'Grain', 'Natural', 'Organic', 'Whole', 'Fiber', 'Antioxidant', 'Supplement',
    'Air', 'Sun', 'Nature', 'Peace', 'Mind', 'Body', 'Balance', 'Harmony', 'Love', 'Happiness',
  ],
  Animals: [
    'Dog', 'Cat', 'Horse', 'Cow', 'Bull', 'Pig', 'Sheep', 'Goat', 'Hen', 'Duck',
    'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra', 'Hippo', 'Rhino', 'Bear', 'Wolf', 'Fox',
    'Monkey', 'Gorilla', 'Chimp', 'Kangaroo', 'Koala', 'Panda', 'Eagle', 'Hawk', 'Owl', 'Hummingbird',
    'Parrot', 'Macaw', 'Sparrow', 'Pigeon', 'Swan', 'Flamingo', 'Penguin', 'Whale', 'Dolphin', 'Shark',
    'Octopus', 'Squid', 'Crab', 'Lobster', 'Turtle', 'Crocodile', 'Snake', 'Frog', 'Lizard', 'Chameleon',
    'Bee', 'Ant', 'Butterfly', 'Spider', 'Beetle', 'Cricket', 'Grasshopper', 'Fly', 'Mosquito', 'Ladybug',
    'Fish', 'Salmon', 'Tuna', 'Sardine', 'Cod', 'Trout', 'Tilapia', 'Piranha', 'Eel', 'Ray',
    'Squirrel', 'Rabbit', 'Hamster', 'Mouse', 'Bat', 'Deer', 'Moose', 'Buffalo', 'Camel', 'Llama',
    'Ostrich', 'Peacock', 'Turkey', 'Goose', 'Quail', 'Pheasant', 'Toucan', 'Pelican', 'Seagull', 'Albatross',
    'Scorpion', 'Centipede', 'Snail', 'Worm', 'Jellyfish', 'Starfish', 'Coral', 'Sponge', 'Seahorse', 'Seal',
  ],
  History: [
    'Egypt', 'Greece', 'Rome', 'Empire', 'Kingdom', 'King', 'Queen', 'Prince', 'Princess', 'Castle',
    'Knight', 'Sword', 'Shield', 'War', 'Battle', 'Peace', 'Treaty', 'Revolution', 'Independence', 'Freedom',
    'Discovery', 'Navigation', 'Caravel', 'Map', 'Compass', 'Pyramid', 'Pharaoh', 'Sphinx', 'Temple', 'Arena',
    'Colosseum', 'Senate', 'Democracy', 'Republic', 'Dictatorship', 'Constitution', 'Law', 'Citizen', 'People', 'Culture',
    'Art', 'Music', 'Painting', 'Sculpture', 'Architecture', 'Philosophy', 'Science', 'Invention', 'Technology', 'Industry',
    'Renaissance', 'Enlightenment', 'Middle Ages', 'Antiquity', 'Modernity', 'Prehistory', 'Fossil', 'Archaeology', 'Museum', 'Archive',
    'Colony', 'Revolution', 'Civil War', 'World War', 'Cold War', 'Election', 'Vote', 'President', 'Congress', 'Senate',
    'Washington', 'Lincoln', 'Jefferson', 'Roosevelt', 'Kennedy', 'Obama', 'Edison', 'Franklin', 'Tesla', 'Ford',
    'Columbus', 'Magellan', 'Marco Polo', 'Napoleon', 'Caesar', 'Alexander', 'Churchill', 'Stalin', 'Mao', 'De Gaulle',
    'Gandhi', 'Mandela', 'MLK', 'Einstein', 'Da Vinci', 'Galileo', 'Newton', 'Darwin', 'Marx', 'Freud',
  ],
  Objects: [
    'Chair', 'Table', 'Bed', 'Wardrobe', 'Sofa', 'Shelf', 'Rug', 'Curtain', 'Lamp', 'Nightstand',
    'Fridge', 'Stove', 'Microwave', 'Blender', 'Mixer', 'Coffee maker', 'Toaster', 'Filter', 'Pot', 'Pan',
    'Plate', 'Glass', 'Cutlery', 'Fork', 'Knife', 'Spoon', 'Cup', 'Mug', 'Jar', 'Bowl',
    'Broom', 'Mop', 'Bucket', 'Cloth', 'Sponge', 'Soap', 'Detergent', 'Softener', 'Iron', 'Board',
    'TV', 'Radio', 'Phone', 'Cell phone', 'Computer', 'Clock', 'Camera', 'Calculator', 'Flashlight', 'Battery',
    'Book', 'Notebook', 'Pen', 'Pencil', 'Eraser', 'Ruler', 'Scissors', 'Glue', 'Paper', 'Envelope',
    'Key', 'Padlock', 'Hammer', 'Pliers', 'Screwdriver', 'Nail', 'Screw', 'Saw', 'Ladder', 'Rope',
    'Vase', 'Picture', 'Mirror', 'Frame', 'Ornament', 'Candle', 'Door', 'Window', 'Handle', 'Latch',
    'Backpack', 'Bag', 'Wallet', 'Glasses', 'Watch', 'Umbrella', 'Briefcase', 'Box', 'Basket', 'Trash can',
    'Comb', 'Brush', 'Dryer', 'Towel', 'Soap', 'Shampoo', 'Toothbrush', 'Toothpaste', 'Floss', 'Razor',
  ],
  Professions: [
    'Teacher', 'Doctor', 'Nurse', 'Dentist', 'Vet', 'Engineer', 'Architect', 'Lawyer', 'Judge', 'Police',
    'Firefighter', 'Soldier', 'Pilot', 'Sailor', 'Driver', 'Trucker', 'Cab driver', 'Postman', 'Janitor', 'Gardener',
    'Mason', 'Carpenter', 'Electrician', 'Plumber', 'Painter', 'Mechanic', 'Welder', 'Cabinetmaker', 'Blacksmith', 'Miner',
    'Farmer', 'Fisherman', 'Rancher', 'Cook', 'Waiter', 'Baker', 'Pastry chef', 'Butcher', 'Salesperson', 'Trader',
    'Manager', 'Secretary', 'Accountant', 'Administrator', 'Economist', 'Journalist', 'Writer', 'Poet', 'Editor', 'Librarian',
    'Actor', 'Singer', 'Musician', 'Dancer', 'Painter', 'Sculptor', 'Photographer', 'Designer', 'Filmmaker', 'Producer',
    'Programmer', 'Analyst', 'Technician', 'Scientist', 'Researcher', 'Biologist', 'Chemist', 'Physicist', 'Astronomer', 'Geologist',
    'Psychologist', 'Sociologist', 'Philosopher', 'Historian', 'Geographer', 'Archaeologist', 'Anthropologist', 'Theologian', 'Missionary', 'Pastor',
    'Athlete', 'Coach', 'Referee', 'Lifeguard', 'Tour guide', 'Flight attendant', 'Receptionist', 'Cashier', 'Operator', 'Guard',
    'Seamstress', 'Tailor', 'Shoemaker', 'Barber', 'Hairdresser', 'Manicurist', 'Esthetician', 'Makeup artist', 'Craftsman', 'Stylist',
  ],
  Family: [
    'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Grandson', 'Granddaughter',
    'Great-grandfather', 'Great-grandmother', 'Great-grandson', 'Great-granddaughter', 'Uncle', 'Aunt', 'Nephew', 'Niece', 'Cousin', 'Cousin',
    'Father-in-law', 'Mother-in-law', 'Son-in-law', 'Daughter-in-law', 'Brother-in-law', 'Sister-in-law', 'Stepfather', 'Stepmother', 'Stepson', 'Stepdaughter',
    'Godfather', 'Godmother', 'Godson', 'Goddaughter', 'Friend', 'Buddy', 'Husband', 'Wife', 'Boyfriend', 'Girlfriend',
    'Wedding', 'Union', 'Family', 'Kinship', 'Ancestor', 'Descendant', 'Generation', 'Lineage', 'Surname', 'Name',
    'Childhood', 'Youth', 'Adulthood', 'Old age', 'Birth', 'Birthday', 'Baptism', 'Graduation', 'Party', 'Reunion',
    'Love', 'Affection', 'Respect', 'Care', 'Protection', 'Education', 'Example', 'Inheritance', 'Tradition', 'History',
    'House', 'Home', 'Coexistence', 'Dialogue', 'Support', 'Advice', 'Hug', 'Kiss', 'Smile', 'Tear',
    'Longing', 'Memory', 'Album', 'Portrait', 'Gift', 'Trip', 'Outing', 'Lunch', 'Dinner', 'Breakfast',
    'Safety', 'Trust', 'Loyalty', 'Friendship', 'Gratitude', 'Patience', 'Forgiveness', 'Union', 'Strength', 'Pillar',
  ],
  Cities: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
    'Boston', 'Nashville', 'Baltimore', 'Oklahoma City', 'Las Vegas', 'Portland', 'Detroit', 'Memphis', 'Louisville', 'Milwaukee',
    'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Raleigh', 'Miami',
    'Cleveland', 'Tulsa', 'Oakland', 'Minneapolis', 'Wichita', 'Arlington', 'New Orleans', 'Bakersfield', 'Tampa', 'Honolulu',
    'Anaheim', 'Aurora', 'Santa Ana', 'St. Louis', 'Riverside', 'Corpus Christi', 'Lexington', 'Pittsburgh', 'Anchorage', 'Stockton',
    'Cincinnati', 'St. Paul', 'Toledo', 'Greensboro', 'Newark', 'Plano', 'Henderson', 'Lincoln', 'Buffalo', 'Jersey City',
    'Chula Vista', 'Orlando', 'Norfolk', 'Chandler', 'Laredo', 'Madison', 'Winston-Salem', 'Lubbock', 'Baton Rouge', 'Durham',
    'Garland', 'Glendale', 'Reno', 'Hialeah', 'Chesapeake', 'Scottsdale', 'North Las Vegas', 'Irving', 'Fremont', 'Irvine',
    'Birmingham', 'Rochester', 'San Bernardino', 'Spokane', 'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton',
  ],
};

const buildPool = (words: WordsByCategory, idPrefix: string): Record<string, ContentItem[]> => {
  const pool: Record<string, ContentItem[]> = {};
  let i = 0;
  for (const [cat, list] of Object.entries(words)) {
    const key = cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    pool[key] = generateItems(cat, 100, `${idPrefix}${i}_`, list);
    i++;
  }
  return pool;
};

export const ES_POOLS = buildPool(ES_WORDS, 'es');
export const EN_POOLS = buildPool(EN_WORDS, 'en');
