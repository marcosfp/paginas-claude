/* Recorrido del sábado, escena a escena. Debe tener tantas entradas como escenas el guion. */
const HOTEL = [45.89525, 9.33422];
const PUNTOS = {
  varenna: [46.0140, 9.2829], bellagio: [45.9868, 9.2605], cadenabbia: [45.9946, 9.2392],
  salita: [45.9866, 9.2616], giacomo: [45.98795, 9.26205], spartivento: [45.99128, 9.26553],
  lido: [45.97058, 9.19756], balbianello: [45.96509, 9.2025],
  funi: [45.81816, 9.08603], brunate: [45.81947, 9.09599],
  duomo: [45.81177, 9.08366], broletto: [45.81189, 9.08305], fedele: [45.80967, 9.08458], cavour: [45.81304, 9.08097]
};
const RUTA = [
  { camara: 'todo', inicio: HOTEL, tipo: 'coche' },
  { camara: { centro: HOTEL, zoom: 12 }, parada: [HOTEL, 'Hotel'] },
  { pasos: [{ tipo: 'coche', r: 'abbadia_varenna' }], parada: [PUNTOS.varenna, 'Varenna'] },
  { pasos: [{ tipo: 'ferri', pts: [PUNTOS.varenna, PUNTOS.bellagio] }], parada: [PUNTOS.bellagio, 'Bellagio'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.bellagio, PUNTOS.salita] }], parada: [PUNTOS.salita, 'Salita Serbelloni'], zoomMax: 14.5 },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.salita, PUNTOS.giacomo] }], parada: [PUNTOS.giacomo, 'San Giacomo'], zoomMax: 14.5 },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.giacomo, PUNTOS.spartivento] }], parada: [PUNTOS.spartivento, 'Punta Spartivento'], zoomMax: 14.5 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.spartivento, PUNTOS.bellagio] },
      { tipo: 'ferri', pts: [PUNTOS.bellagio, PUNTOS.cadenabbia] },
      { tipo: 'coche', r: 'cadenabbia_lenno' }
    ], parada: [PUNTOS.lido, 'Lenno'] },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.lido, PUNTOS.balbianello] }], parada: [PUNTOS.balbianello, 'Balbianello'], zoomMax: 14 },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.balbianello, PUNTOS.lido] },
      { tipo: 'coche', r: 'lenno_como' }
    ], parada: [PUNTOS.cavour, 'Como'] },
  { pasos: [
      { tipo: 'pie', pts: [PUNTOS.cavour, PUNTOS.funi] },
      { tipo: 'funicular', pts: [PUNTOS.funi, PUNTOS.brunate] }
    ], parada: [PUNTOS.brunate, 'Brunate'], zoomMax: 14.5 },
  { camara: { centro: PUNTOS.brunate, zoom: 13 }, parada: [PUNTOS.brunate, 'Atardecer'] },
  { pasos: [
      { tipo: 'funicular', pts: [PUNTOS.brunate, PUNTOS.funi] },
      { tipo: 'pie', pts: [PUNTOS.funi, PUNTOS.duomo] }
    ], parada: [PUNTOS.duomo, 'Duomo'], zoomMax: 14.5 },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.duomo, PUNTOS.broletto, PUNTOS.fedele] }], parada: [PUNTOS.fedele, 'San Fedele'], zoomMax: 15 },
  { pasos: [{ tipo: 'pie', pts: [PUNTOS.fedele, PUNTOS.cavour] }], parada: [PUNTOS.cavour, 'Piazza Cavour'], zoomMax: 15 },
  { pasos: [{ tipo: 'coche', r: 'como_abbadia' }], parada: [HOTEL, 'Hotel'], camara: 'todo' }
];
