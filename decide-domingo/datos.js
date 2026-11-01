/* Planes posibles para el domingo y duelos del quiz. "puntos" suma afinidad a cada plan. */
const PLANES = {
  lagos: {
    nombre: 'Lagos y miradores',
    lema: 'Gandria, Lugano, San Salvatore y Morcote',
    fotos: ['gandria', 'salvatore', 'morcote'],
    km: 'Unos 130 km',
    coche: 'Unas 3 h, más el ferri',
    vineta: 'No hace falta',
    mejor: 'Pocas horas de coche, sin gasto de viñeta y un gran mirador en su último día de temporada.',
    pierdes: 'Se parece más al sábado: vuelve a ser un día de lago y pueblos.',
    horario: [
      ['08:00', 'Coche a Varenna y paseo corto'],
      ['09:15', 'Ferri a Menaggio'],
      ['09:45', 'Coche a la frontera de Gandria'],
      ['10:30', 'Gandria'],
      ['11:35', 'Lugano y comida'],
      ['14:30', 'Monte San Salvatore'],
      ['16:30', 'Morcote al atardecer'],
      ['17:30', 'Vuelta por Chiasso, sin autopista suiza'],
      ['19:30', 'Llegada al hotel']
    ]
  },
  mezcla: {
    nombre: 'Lugano, Verzasca y Locarno',
    lema: 'Ciudad, río de montaña y atardecer en otro lago',
    fotos: ['gandria', 'ponte', 'piazzagrande'],
    km: 'Unos 220 km',
    coche: 'Unas 5 h, con el ferri',
    vineta: 'Muy recomendable: 40 francos',
    mejor: 'Es el domingo más distinto al sábado: montaña, río y una ciudad nueva.',
    pierdes: 'Os quedáis sin San Salvatore, Morcote y Bellinzona, y el día queda apretado.',
    horario: [
      ['08:00', 'Varenna, ferri a Menaggio y frontera de Gandria'],
      ['10:30', 'Gandria'],
      ['11:30', 'Lugano y comida'],
      ['14:00', 'Ponte dei Salti, en el valle de Verzasca'],
      ['15:30', 'Locarno y atardecer en el Lago Maggiore'],
      ['17:00', 'Vuelta por la A2, Chiasso y Lecco'],
      ['19:15', 'Llegada al hotel']
    ]
  },
  castillos: {
    nombre: 'Castillos y Lugano',
    lema: 'Gandria, Lugano y las fortalezas de Bellinzona',
    fotos: ['riforma', 'castelgrande', 'montebello'],
    km: 'Unos 170 km',
    coche: 'Unas 3 h 30, con el ferri',
    vineta: 'Recomendable: 40 francos',
    mejor: 'Historia y ciudad. Es el plan que mejor aguanta si llueve.',
    pierdes: 'Os quedáis sin San Salvatore, Morcote y el valle de Verzasca.',
    horario: [
      ['08:00', 'Varenna, ferri a Menaggio y frontera de Gandria'],
      ['10:30', 'Gandria'],
      ['11:30', 'Lugano y comida'],
      ['14:00', 'Bellinzona: Castelgrande y Montebello'],
      ['16:30', 'Vuelta por la A2, Chiasso y Lecco'],
      ['18:15', 'Llegada al hotel']
    ]
  },
  completo: {
    nombre: 'Ruta completa del Ticino',
    lema: 'Bellinzona, Locarno, Verzasca y Lugano',
    fotos: ['castelgrande', 'ponte', 'riforma'],
    km: 'Unos 255 km',
    coche: 'Más de 4 h 30',
    vineta: 'Muy recomendable: 40 francos',
    mejor: 'Veis todo lo imprescindible del Ticino en un día.',
    pierdes: 'Menos tiempo en cada sitio, sin ferri, Varenna ni Gandria. Es el día más cansado.',
    horario: [
      ['08:00', 'Coche por Lecco, Chiasso y la A2'],
      ['09:40', 'Bellinzona y sus castillos'],
      ['11:45', 'Locarno y comida'],
      ['13:45', 'Ponte dei Salti, en el valle de Verzasca'],
      ['15:20', 'Lugano'],
      ['16:50', 'Vuelta por la A2 y Chiasso'],
      ['18:15', 'Llegada al hotel']
    ]
  }
};

const DUELOS = [
  { q: '¿Qué os apetece más ver?', a: {
      img: 'salvatore', titulo: 'Monte San Salvatore', dato: 'Funicular de 12 minutos y 32 francos. El domingo 8 es su último día hasta marzo.', puntos: { lagos: 2 }
    }, b: {
      img: 'verzasca', titulo: 'Valle de Verzasca', dato: 'Río turquesa entre montañas. La foto es de verano: en noviembre, sin bañistas.', puntos: { mezcla: 2, completo: 2 }
    } },
  { q: '¿Pueblo con encanto o castillo?', a: {
      img: 'morcote', titulo: 'Morcote', dato: 'Soportales y casas lombardas a orillas del lago de Lugano.', puntos: { lagos: 2 }
    }, b: {
      img: 'montebello', titulo: 'Castillo de Montebello', dato: 'Almenas y viñedos sobre Bellinzona. Temporada hasta el 8 de noviembre.', puntos: { castillos: 2, completo: 1 }
    } },
  { q: 'Solo podéis elegir una foto para el recuerdo', a: {
      img: 'ponte', titulo: 'Ponte dei Salti', dato: 'Puente de piedra de doble arco sobre el río Verzasca. Gratis y siempre abierto.', puntos: { mezcla: 2, completo: 2 }
    }, b: {
      img: 'castelgrande', titulo: 'Castelgrande', dato: 'La gran fortaleza de Bellinzona, Patrimonio de la Humanidad.', puntos: { castillos: 2, completo: 1 }
    } },
  { q: '¿En qué plaza os tomáis el café?', a: {
      img: 'riforma', titulo: 'Piazza della Riforma', dato: 'El corazón de Lugano, con terrazas y aire italiano.', puntos: { lagos: 1, castillos: 1 }
    }, b: {
      img: 'piazzagrande', titulo: 'Piazza Grande', dato: 'La plaza empedrada de Locarno, sede de su festival de cine.', puntos: { mezcla: 2, completo: 1 }
    } },
  { q: 'Dos iglesias con el mismo nombre. ¿Cuál visitáis?', a: {
      img: 'sasso', titulo: 'Santa Maria del Sasso', dato: 'En lo alto de Morcote, a unos 400 escalones y con vistas al lago.', puntos: { lagos: 2 }
    }, b: {
      img: 'madonna', titulo: 'Madonna del Sasso', dato: 'El santuario amarillo que vigila Locarno desde la ladera.', puntos: { mezcla: 1, completo: 1 }
    } },
  { q: '¿Qué orilla os llama más?', a: {
      img: 'gandria', titulo: 'Gandria', dato: 'Callejones y escaleras de piedra sobre el lago de Lugano.', puntos: { lagos: 1, mezcla: 1, castillos: 1 }
    }, b: {
      img: 'locarnolago', titulo: 'Locarno', dato: 'Palmeras y montañas junto al Lago Maggiore. La foto es de verano.', puntos: { mezcla: 2, completo: 1 }
    } },
  { q: '¿Cómo queréis empezar el día?', a: {
      img: 'varenna', titulo: 'Varenna y ferri', dato: 'Paseo a primera hora y cruce del lago con el coche.', puntos: { lagos: 1, mezcla: 1, castillos: 1 }
    }, b: {
      grande: 'A2', titulo: 'Directos a Suiza', dato: 'Sin ferri, por autopista. En Bellinzona hacia las 09:40.', puntos: { completo: 2 }
    } },
  { q: '¿Cuánto coche aguantáis el domingo?', a: {
      grande: '3 h', titulo: 'Lo justo', dato: 'Más tiempo paseando y menos mirando la carretera.', puntos: { lagos: 2, castillos: 2 }
    }, b: {
      grande: '5 h', titulo: 'Lo que haga falta', dato: 'La carretera también es parte del viaje, si a cambio se ve más.', puntos: { mezcla: 1, completo: 2 }
    } },
  { q: '¿A qué ritmo?', a: {
      grande: '3–4', titulo: 'Pocas paradas', dato: 'Calma, tiempo para comer sin prisa y sin mirar el reloj.', puntos: { lagos: 2, castillos: 1 }
    }, b: {
      grande: '+', titulo: 'Ver todo lo posible', dato: 'Menos tiempo en cada sitio, pero más sitios.', puntos: { completo: 2, mezcla: 1 }
    } },
  { q: '¿40 francos por usar la autopista suiza?', a: {
      grande: '0', titulo: 'Sin viñeta', dato: 'Solo carreteras normales, y ese dinero para la comida.', puntos: { lagos: 3 }
    }, b: {
      grande: '40', titulo: 'Se paga', dato: 'Ganáis tiempo y podéis ir más lejos. No hay versión de un día.', puntos: { mezcla: 1, castillos: 1, completo: 1 }
    } },
  { q: 'Y si llueve el domingo…', a: {
      img: 'castelgrande', titulo: 'A cubierto', dato: 'Castillos y ciudad, que aguantan mejor la lluvia.', puntos: { castillos: 3 }
    }, b: {
      grande: '☂', titulo: 'Paraguas y adelante', dato: 'Mantenemos lo elegido, aunque se pierdan las vistas.', puntos: { lagos: 1, mezcla: 1, completo: 1 }
    } }
];

/* Fotos que ya estaban en la carpeta del test */
const FOTOS_TEST = ['gandria', 'salvatore', 'morcote', 'riforma', 'sasso', 'varenna'];
