/* Recorrido del domingo, escena a escena, en sus dos opciones. Cada ruta tiene tantas entradas como escenas su guion. */
const HOTEL = [45.89525, 9.33422];
const PUNTOS = {
  varenna: [46.0140, 9.2829], menaggio: [46.0178, 9.2415],
  gandria: [46.0056, 9.0029], gandriaLago: [46.0046, 9.0031],
  balestra: [46.0076, 8.95355], ciani: [46.00392, 8.95993], riforma: [46.00363, 8.95164], angioli: [45.99998, 8.94904],
  funi: [45.99035, 8.94539], cima: [45.97711, 8.9473],
  morcote: [45.9224, 8.915], sasso: [45.92325, 8.91414],
  bellinzona: [46.1940, 9.0260], castelgrande: [46.1929, 9.02175], montebello: [46.19129, 9.02657],
  locarno: [46.1680, 8.7960], piazzaGrande: [46.16922, 8.79497], madonna: [46.17519, 8.79397], lagoLocarno: [46.17049, 8.80091],
  lavertezzo: [46.2590, 8.8370], ponte: [46.26001, 8.83592]
};

const RUTA_A = [
  { camara: 'todo', inicio: HOTEL, tipo: 'coche' },
  { camara: { centro: HOTEL, zoom: 12 }, parada: [HOTEL, 'Hotel'] },
  { pasos: [{ tipo: 'coche', r: 'abbadia_varenna' }], parada: [PUNTOS.varenna, 'Varenna'] },
  { pasos: [{ tipo: 'ferri', pts: [PUNTOS.varenna, PUNTOS.menaggio] }], parada: [PUNTOS.menaggio, 'Menaggio'] },
  { pasos: [{ tipo: 'coche', r: 'menaggio_gandria' }], parada: [PUNTOS.gandria, 'Suiza'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.gandria, PUNTOS.gandriaLago] }], parada: [PUNTOS.gandriaLago, 'Gandria'], zoomMax: 15 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.gandriaLago, PUNTOS.gandria] },
      { tipo: 'coche', r: 'gandria_lugano' },
      { tipo: 'pie', pts: [PUNTOS.balestra, PUNTOS.ciani] }
    ], parada: [PUNTOS.ciani, 'Parco Ciani'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.ciani, PUNTOS.riforma] }], parada: [PUNTOS.riforma, 'Riforma'], zoomMax: 15 },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.riforma, PUNTOS.angioli] }], parada: [PUNTOS.angioli, 'Angioli'], zoomMax: 15 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.angioli, PUNTOS.riforma, PUNTOS.balestra] },
      { tipo: 'coche', r: 'lugano_paradiso' }
    ], parada: [PUNTOS.funi, 'Funicular'], zoomMax: 14.5 },
  { pasos: [{ tipo: 'funicular', pts: [PUNTOS.funi, PUNTOS.cima] }], parada: [PUNTOS.cima, 'San Salvatore'], zoomMax: 14 },
  { pasos: [
      { tipo: 'funicular', pts: [PUNTOS.cima, PUNTOS.funi] },
      { tipo: 'coche', r: 'paradiso_morcote' }
    ], parada: [PUNTOS.morcote, 'Morcote'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.morcote, PUNTOS.sasso] }], parada: [PUNTOS.sasso, 'Santa Maria del Sasso'], zoomMax: 15.5 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.sasso, PUNTOS.morcote] },
      { tipo: 'coche', r: 'morcote_chiasso' },
      { tipo: 'coche', r: 'chiasso_abbadia' }
    ], parada: [HOTEL, 'Hotel'], camara: 'todo' }
];

const RUTA_B = [
  { camara: 'todo', inicio: HOTEL, tipo: 'coche' },
  { camara: { centro: HOTEL, zoom: 12 }, parada: [HOTEL, 'Hotel'] },
  { pasos: [{ tipo: 'coche', r: 'abbadia_bellinzona' }], parada: [PUNTOS.bellinzona, 'Bellinzona'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.bellinzona, PUNTOS.castelgrande] }], parada: [PUNTOS.castelgrande, 'Castelgrande'], zoomMax: 15.5 },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.castelgrande, PUNTOS.montebello] }], parada: [PUNTOS.montebello, 'Montebello'], zoomMax: 15.5 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.montebello, PUNTOS.bellinzona] },
      { tipo: 'coche', r: 'bellinzona_locarno' },
      { tipo: 'pie', pts: [PUNTOS.locarno, PUNTOS.piazzaGrande] }
    ], parada: [PUNTOS.piazzaGrande, 'Piazza Grande'] },
  { camara: { centro: PUNTOS.madonna, zoom: 15 }, parada: [PUNTOS.madonna, 'Madonna del Sasso'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.piazzaGrande, PUNTOS.lagoLocarno] }], parada: [PUNTOS.lagoLocarno, 'Lago Maggiore'], zoomMax: 15 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.lagoLocarno, PUNTOS.locarno] },
      { tipo: 'coche', r: 'locarno_lavertezzo' }
    ], parada: [PUNTOS.lavertezzo, 'Lavertezzo'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.lavertezzo, PUNTOS.ponte] }], parada: [PUNTOS.ponte, 'Ponte dei Salti'], zoomMax: 15.5 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.ponte, PUNTOS.lavertezzo] },
      { tipo: 'coche', r: 'lavertezzo_lugano' },
      { tipo: 'pie', pts: [PUNTOS.balestra, PUNTOS.riforma] }
    ], parada: [PUNTOS.riforma, 'Lugano'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.riforma, PUNTOS.ciani] }], parada: [PUNTOS.ciani, 'Parco Ciani'], zoomMax: 15 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.ciani, PUNTOS.balestra] },
      { tipo: 'coche', r: 'lugano_chiasso' },
      { tipo: 'coche', r: 'chiasso_abbadia' }
    ], parada: [HOTEL, 'Hotel'], camara: 'todo' }
];

const MODOS = {
  a: { etiqueta: 'Opción A: lagos y miradores', detalle: 'Gandria, Lugano, San Salvatore y Morcote', etiqueta_ru: 'Вариант А: озёра и виды', detalle_ru: 'Гандрия, Лугано, Сан-Сальваторе и Моркоте', datos: 'domingo-a', audio: 'trailer-domingo-a.mp3', ruta: RUTA_A },
  b: { etiqueta: 'Opción B: ruta completa del Ticino', detalle: 'Bellinzona, Locarno, Verzasca y Lugano', etiqueta_ru: 'Вариант Б: весь Тичино', detalle_ru: 'Беллинцона, Локарно, Верцаска и Лугано', datos: 'domingo-b', audio: 'trailer-domingo-b.mp3', ruta: RUTA_B }
};
const CLAVE_MODO = 'viaje-modo-domingo';
const TEXTOS_PAGINA = {
  es: { kicker: 'Domingo 8 de noviembre · Suiza', h1: 'Trailer del domingo', finKicker: 'Fin del domingo', finH1: 'Mañana, de vuelta a casa', finP: '¿Os quedáis con esta opción o con la otra? Podéis verla también, o decidirlo con el quiz.' },
  ru: { kicker: 'Воскресенье, 8 ноября · Швейцария', h1: 'Трейлер воскресенья', finKicker: 'Конец воскресенья', finH1: 'Завтра — домой', finP: 'Какой вариант выбираете? Посмотрите и второй или решите с помощью теста.' }
};
const FOTOS_DECIDE = ['castelgrande', 'montebello', 'ponte', 'verzasca', 'piazzagrande', 'madonna', 'locarnolago'];
