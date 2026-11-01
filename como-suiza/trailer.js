/* Reproductor del trailer: la pista de voz manda; las escenas, la foto y el coche siguen su tiempo. */
(function () {
  const FOTOS = '../test-viaje/';
  const ICONO = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    atras: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
    adelante: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>'
  };
  const LINEA = '#17252E';
  const VEHICULOS = {
    coche: `<svg viewBox="0 0 64 48" aria-hidden="true"><rect x="22" y="3" width="22" height="7" rx="2" fill="#8A3FD1" stroke="${LINEA}" stroke-width="2"/><path d="M6 33c-2 0-3-2-3-4v-3c0-3 2-5 5-5l9-1 6-9c1-1 2-2 4-2h13c2 0 3 1 4 2l6 9 6 1c3 1 5 3 5 6v2c0 2-1 4-3 4z" fill="#E3262E" stroke="${LINEA}" stroke-width="2.5" stroke-linejoin="round"/><path d="M21 20l5-7c.4-.6 1-1 2-1h5v8zM36 12h6c1 0 1.500.3 2 1l5 7H36z" fill="#BFE6F5" stroke="${LINEA}" stroke-width="2"/><circle cx="17" cy="35" r="7" fill="#26323A" stroke="${LINEA}" stroke-width="2"/><circle cx="17" cy="35" r="2.800" fill="#E8EDF0"/><circle cx="47" cy="35" r="7" fill="#26323A" stroke="${LINEA}" stroke-width="2"/><circle cx="47" cy="35" r="2.800" fill="#E8EDF0"/><circle cx="58" cy="26" r="2" fill="#FFE27A"/></svg>`,
    ferri: `<svg viewBox="0 0 64 48" aria-hidden="true"><rect x="27" y="6" width="9" height="10" fill="#E3262E" stroke="${LINEA}" stroke-width="2"/><rect x="14" y="14" width="36" height="13" rx="2" fill="#FFFFFF" stroke="${LINEA}" stroke-width="2.500"/><rect x="19" y="18" width="6" height="5" fill="#BFE6F5" stroke="${LINEA}" stroke-width="1.500"/><rect x="29" y="18" width="6" height="5" fill="#BFE6F5" stroke="${LINEA}" stroke-width="1.500"/><rect x="39" y="18" width="6" height="5" fill="#BFE6F5" stroke="${LINEA}" stroke-width="1.500"/><path d="M4 27h56l-6 12c-.5 1-1.500 2-3 2H13c-1.500 0-2.500-1-3-2z" fill="#1763B8" stroke="${LINEA}" stroke-width="2.500" stroke-linejoin="round"/><path d="M2 45c5-3 9-3 14 0s9 3 14 0 9-3 14 0 9 3 14 0" fill="none" stroke="#FFFFFF" stroke-width="2.500" stroke-linecap="round"/></svg>`,
    pie: `<svg viewBox="0 0 64 48" aria-hidden="true"><g stroke="${LINEA}" stroke-width="2.500" stroke-linecap="round"><path d="M23 19v12M23 31l-6 12M23 31l5 12M23 22l-7 7M23 22l7 6" fill="none"/><circle cx="23" cy="11" r="6.500" fill="#FFD2A6"/><path d="M42 21v11M42 32l-5 11M42 32l6 11M42 24l-7 6M42 24l7 6" fill="none"/><circle cx="42" cy="13" r="6.500" fill="#FFD2A6"/></g><path d="M18 18h10v13H18z" fill="#E3262E" stroke="${LINEA}" stroke-width="2"/><path d="M37 20h10v12H37z" fill="#1763B8" stroke="${LINEA}" stroke-width="2"/></svg>`,
    funicular: `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M2 44L62 18" stroke="${LINEA}" stroke-width="3.500" stroke-linecap="round"/><path d="M12 36l-1-16c0-2 1-3 3-3l32-8c2-.5 3.500.5 3.500 2.500L50 24z" fill="#F4B400" stroke="${LINEA}" stroke-width="2.500" stroke-linejoin="round"/><path d="M12 36l38-12 .5 5-38.500 12z" fill="#E3262E" stroke="${LINEA}" stroke-width="2.500" stroke-linejoin="round"/><path d="M18 22l9-2v7l-9 2zM31 19l11-3v7l-11 3z" fill="#BFE6F5" stroke="${LINEA}" stroke-width="1.800"/></svg>`
  };
  const PUEBLOS = [
    ['Abbadia Lariana',45.89525,9.33422,'to-r'],['Varenna',46.0100,9.2833,'to-r'],['Bellagio',45.9868,9.2620,'to-r'],
    ['Cadenabbia',45.9946,9.2392,'to-l'],['Menaggio',46.0198,9.2390,'to-l'],['Lenno',45.9706,9.1976,'to-l'],
    ['Como',45.8060,9.0840,'to-r'],['Brunate',45.8195,9.0960,'to-r'],['Lecco',45.8566,9.3977,'to-r'],
    ['Porlezza',46.0375,9.1290,'to-u'],['Gandria',46.0057,9.0028,'to-u'],['Lugano',46.0095,8.9530,'to-u'],
    ['Morcote',45.9227,8.9150,'to-l'],['Mendrisio',45.8710,8.9875,'to-l'],['Chiasso',45.8352,9.0363,'to-r'],
    ['ITALIA',45.905,9.215,'pais'],['ITALIA',46.075,9.11,'pais'],['SUIZA',46.075,8.93,'pais']
  ];
  const ESTILO = {
    coche: { className: 'tr-coche', weight: 6, opacity: 1, dashArray: null, lineCap: 'round' },
    ferri: { className: 'tr-ferri', weight: 5, opacity: 1, dashArray: '2 11', lineCap: 'round' },
    pie: { className: 'tr-pie', weight: 4, opacity: 1, dashArray: '1 8', lineCap: 'round' },
    funicular: { className: 'tr-funicular', weight: 6, opacity: 1, dashArray: null, lineCap: 'round' }
  };
  const VELOCIDADES = [1, 1.25, 1.5];

  const $ = s => document.querySelector(s);
  const escenas = TRAILER.escenas;
  const audio = $('#voz');
  const esc = $('#escenario');
  let actual = -1, enMarcha = false, sinAudio = false, relojInicio = 0, relojPausa = 0;
  let velocidad = 0, escenaMapa = -1, tramoHecho = -1;

  /* ---------- Mapa ---------- */
  const mapa = L.map('mapa', { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false, zoomSnap: 0.25, minZoom: 7, maxZoom: 16 });
  mapa.attributionControl.setPrefix(false);
  mapa.attributionControl.addAttribution('© OpenStreetMap');
  L.polygon(GEO.ticino.coords, { className: 'geo-suiza', interactive: false }).addTo(mapa);
  Object.keys(ROUTES).forEach(k => L.polyline(ROUTES[k], { className: 'geo-carretera', weight: 2.5, interactive: false }).addTo(mapa));
  ['como', 'lugano', 'varese', 'maggiore'].forEach(k => L.polygon(GEO[k].coords, { className: 'geo-agua', interactive: false }).addTo(mapa));
  PUEBLOS.forEach(([n, lat, lng, d]) => L.marker([lat, lng], { interactive: false, keyboard: false, zIndexOffset: -1000, icon: L.divIcon({ className: 'pueblo', iconSize: [0, 0], html: `<span class="${d}">${n}</span>` }) }).addTo(mapa));

  /* Prepara cada tramo: puntos, longitud acumulada y peso dentro de la escena */
  const dist = (a, b) => L.latLng(a).distanceTo(L.latLng(b));
  let posicion = RUTA[0].inicio, tipoActual = RUTA[0].tipo;
  const plan = RUTA.map(r => {
    const segs = (r.pasos || []).map(p => {
      const pts = p.r ? ROUTES[p.r] : p.pts;
      const acum = [0];
      for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + dist(pts[i - 1], pts[i]));
      return { tipo: p.tipo, pts, acum, largo: acum[acum.length - 1] };
    });
    const total = segs.reduce((s, x) => s + x.largo, 0);
    const salida = posicion, tipoSalida = tipoActual;
    if (segs.length) {
      const u = segs[segs.length - 1];
      posicion = u.pts[u.pts.length - 1];
      tipoActual = u.tipo;
    }
    return { r, segs, total, salida, tipoSalida, llegada: posicion, tipoLlegada: tipoActual };
  });
  const todos = [];
  plan.forEach(p => p.segs.forEach(s => s.pts.forEach(x => todos.push(x))));
  todos.push(RUTA[0].inicio);
  const limitesTodo = L.latLngBounds(todos);

  const fantasma = L.layerGroup().addTo(mapa);
  plan.forEach(p => p.segs.forEach(s => L.polyline(s.pts, { className: 'tr-' + s.tipo, weight: 2.5, opacity: .3, dashArray: '4 7', interactive: false }).addTo(fantasma)));
  const hecho = L.layerGroup().addTo(mapa);
  const paradas = L.layerGroup().addTo(mapa);
  const lineaActual = L.polyline([], { interactive: false, ...ESTILO.coche }).addTo(mapa);
  const vehiculo = L.marker(RUTA[0].inicio, { interactive: false, keyboard: false, zIndexOffset: 2000, icon: iconoVehiculo('coche', false) }).addTo(mapa);
  let etiqueta = null, vehiculoTipo = 'coche', vehiculoIzq = false;

  function iconoVehiculo(tipo, izq) {
    return L.divIcon({ className: '', iconSize: [64, 48], iconAnchor: [32, 40], html: `<div class="vehiculo${izq ? ' izq' : ''}">${VEHICULOS[tipo]}</div>` });
  }

  function margenes() {
    const h = innerHeight, w = innerWidth;
    const fi = $('#ficha').getBoundingClientRect();
    const po = $('#postal').getBoundingClientRect();
    const abajo = Math.max(h - fi.top, 90) + 36;
    if (w > h * 1.1) return { paddingTopLeft: [50, 60], paddingBottomRight: [Math.max(po.width, 240) + 50, abajo] };
    return { paddingTopLeft: [40, Math.min(Math.max(po.bottom, 190) + 40, h * 0.42)], paddingBottomRight: [50, abajo] };
  }

  function moverCamara(n, animar) {
    const p = plan[n], c = p.r.camara;
    const opc = { ...margenes(), animate: animar, duration: 1 };
    if (c && c.centro) {
      mapa.flyTo(c.centro, c.zoom, { animate: animar, duration: 1 });
      return;
    }
    let lim;
    if (c === 'todo' || !p.segs.length) lim = limitesTodo;
    else {
      const pts = [p.salida];
      p.segs.forEach(s => s.pts.forEach(x => pts.push(x)));
      lim = L.latLngBounds(pts);
    }
    opc.maxZoom = p.r.zoomMax || 13.5;
    if (animar) mapa.flyToBounds(lim, opc); else mapa.fitBounds(lim, { ...margenes(), maxZoom: opc.maxZoom, animate: false });
  }

  /* Devuelve dónde está el vehículo en una fracción de la escena */
  function situar(p, f) {
    if (!p.segs.length || p.total === 0) return { punto: p.llegada, tipo: p.tipoLlegada, seg: -1, parcial: [], izq: null, moviendo: false };
    const objetivo = Math.min(f, 1) * p.total;
    let cuenta = 0;
    for (let s = 0; s < p.segs.length; s++) {
      const seg = p.segs[s];
      if (objetivo <= cuenta + seg.largo || s === p.segs.length - 1) {
        const d = Math.min(objetivo - cuenta, seg.largo);
        let i = 1;
        while (i < seg.pts.length - 1 && seg.acum[i] < d) i++;
        const a = seg.pts[i - 1], b = seg.pts[i];
        const tramo = seg.acum[i] - seg.acum[i - 1] || 1;
        const k = Math.max(0, Math.min(1, (d - seg.acum[i - 1]) / tramo));
        const punto = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
        return { punto, tipo: seg.tipo, seg: s, parcial: seg.pts.slice(0, i).concat([punto]), izq: b[1] < a[1], moviendo: f > 0 && f < 1 };
      }
      cuenta += seg.largo;
    }
    return { punto: p.llegada, tipo: p.tipoLlegada, seg: -1, parcial: [], izq: null, moviendo: false };
  }

  function redibujarHecho(n, seg) {
    hecho.clearLayers();
    for (let k = 0; k <= n; k++) {
      plan[k].segs.forEach((s, i) => {
        if (k < n || i < seg) L.polyline(s.pts, { interactive: false, ...ESTILO[s.tipo] }).addTo(hecho);
      });
    }
  }

  function redibujarParadas(n) {
    paradas.clearLayers();
    if (etiqueta) { mapa.removeLayer(etiqueta); etiqueta = null; }
    for (let k = 1; k < n; k++) {
      const pa = RUTA[k].parada;
      if (pa) L.marker(pa[0], { interactive: false, keyboard: false, icon: L.divIcon({ className: '', iconSize: [14, 14], html: '<div class="parada-punto"></div>' }) }).addTo(paradas);
    }
  }

  function pintarMapa(t) {
    const n = escenaEn(t);
    const s = escenas[n], p = plan[n];
    if (n !== escenaMapa) {
      escenaMapa = n;
      tramoHecho = -2;
      redibujarParadas(n);
      moverCamara(n, enMarcha);
    }
    const f = Math.max(0, Math.min(1, ((t - s.inicio) / s.duracion - 0.08) / 0.84));
    const v = situar(p, f);
    if (v.seg !== tramoHecho) {
      tramoHecho = v.seg;
      redibujarHecho(n, v.seg < 0 ? p.segs.length : v.seg);
      if (v.seg >= 0) lineaActual.setStyle(ESTILO[v.tipo]);
    }
    lineaActual.setLatLngs(v.parcial);
    vehiculo.setLatLng(v.punto);
    const izq = v.izq === null ? vehiculoIzq : v.izq;
    if (v.tipo !== vehiculoTipo || izq !== vehiculoIzq) {
      vehiculoTipo = v.tipo; vehiculoIzq = izq;
      vehiculo.setIcon(iconoVehiculo(v.tipo, izq));
    }
    esc.classList.toggle('moviendo', enMarcha && v.moviendo);
    if (f >= 1 && !etiqueta && p.r.parada) {
      etiqueta = L.marker(p.r.parada[0], { interactive: false, keyboard: false, zIndexOffset: 1000, icon: L.divIcon({ className: 'parada-etiqueta', iconSize: [0, 0], html: `<span>${p.r.parada[1]}</span>` }) }).addTo(mapa);
    }
  }

  /* ---------- Foto y textos ---------- */
  const cajaFoto = $('#postal-foto');
  const imagenes = {};
  function foto(k) {
    if (!imagenes[k]) {
      const i = document.createElement('img');
      i.src = FOTOS + k + '.jpg';
      i.alt = '';
      cajaFoto.appendChild(i);
      imagenes[k] = i;
    }
    return imagenes[k];
  }

  const tramos = $('#tramos');
  const barras = escenas.map((s, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Ir a ${s.hora}: ${s.titulo}`);
    b.style.flexGrow = Math.max(s.duracion, 4);
    b.innerHTML = '<span><i></i></span>';
    b.addEventListener('click', () => irA(n, true));
    tramos.appendChild(b);
    return b.querySelector('i');
  });

  function fmt(s) {
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }

  function ahora() {
    if (!sinAudio) return audio.currentTime;
    return enMarcha ? (performance.now() - relojInicio) / 1000 : relojPausa;
  }

  function escenaEn(t) {
    for (let n = escenas.length - 1; n >= 0; n--) if (t >= escenas[n].inicio) return n;
    return 0;
  }

  function pintarEscena(n) {
    if (n === actual) return;
    actual = n;
    const s = escenas[n];
    const img = foto(s.img);
    img.alt = s.titulo;
    Object.values(imagenes).forEach(i => i.classList.toggle('visible', i === img));
    if (escenas[n + 1]) foto(escenas[n + 1].img);
    const postal = $('#postal');
    postal.classList.remove('salta');
    void postal.offsetWidth;
    postal.classList.add('salta');
    const hora = $('#hora');
    hora.textContent = s.hora;
    hora.classList.toggle('palabra', !/^\d/.test(s.hora));
    $('#titulo').textContent = s.titulo;
    $('#narracion').textContent = s.voz;
    const c = CREDITOS[s.img];
    const cr = $('#credito');
    cr.textContent = 'Foto: ';
    const a = document.createElement('a');
    a.href = c.url; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = c.autor;
    cr.appendChild(a);
    cr.appendChild(document.createTextNode(' · ' + c.licencia));
  }

  function pintarProgreso(t) {
    barras.forEach((b, n) => {
      const s = escenas[n];
      const p = t >= s.inicio + s.duracion ? 100 : t <= s.inicio ? 0 : (t - s.inicio) / s.duracion * 100;
      b.style.width = p + '%';
    });
    $('#tiempo').textContent = fmt(t) + ' / ' + fmt(TRAILER.total);
  }

  function pintar(t) {
    pintarEscena(escenaEn(t));
    pintarProgreso(t);
    pintarMapa(t);
  }

  function bucle() {
    if (!enMarcha) return;
    const t = ahora();
    if (t >= TRAILER.total - 0.05 && (sinAudio || audio.ended)) { terminar(); return; }
    pintar(t);
    requestAnimationFrame(bucle);
  }

  /* ---------- Reproducción ---------- */
  function ponerIcono() {
    const b = $('#btn-play');
    b.innerHTML = enMarcha ? ICONO.pausa : ICONO.play;
    b.setAttribute('aria-label', enMarcha ? 'Pausar' : 'Reproducir');
    esc.classList.toggle('en-pausa', !enMarcha);
    if (!enMarcha) esc.classList.remove('moviendo');
  }

  function quitarCapas() {
    $('#portada').classList.add('oculto');
    $('#final').classList.add('oculto');
    esc.classList.remove('con-capa');
  }

  function arrancar() {
    quitarCapas();
    escenaMapa = -1;
    reproducir();
  }

  function reproducir() {
    enMarcha = true;
    ponerIcono();
    if (sinAudio) relojInicio = performance.now() - relojPausa * 1000;
    else {
      audio.playbackRate = VELOCIDADES[velocidad];
      const p = audio.play();
      if (p && p.catch) p.catch(e => {
        if (e && e.name === 'AbortError') return;
        if (e && e.name === 'NotAllowedError') { enMarcha = false; ponerIcono(); return; }
        usarSinAudio();
      });
    }
    requestAnimationFrame(bucle);
  }

  function pausar() {
    if (sinAudio) relojPausa = ahora(); else audio.pause();
    enMarcha = false;
    ponerIcono();
  }

  function usarSinAudio() {
    if (sinAudio) return;
    relojPausa = audio.currentTime || 0;
    sinAudio = true;
    relojInicio = performance.now() - relojPausa * 1000;
  }

  function irA(n, seguir) {
    n = Math.max(0, Math.min(escenas.length - 1, n));
    const t = escenas[n].inicio + 0.01;
    if (sinAudio) { relojPausa = t; relojInicio = performance.now() - t * 1000; }
    else { try { audio.currentTime = t; } catch (e) { /* aún sin cargar: empieza desde el principio */ } }
    quitarCapas();
    escenaMapa = -1;
    actual = -1;
    pintar(t);
    if (seguir && !enMarcha) reproducir();
  }

  function terminar() {
    enMarcha = false;
    ponerIcono();
    pintarProgreso(TRAILER.total);
    const u = plan[plan.length - 1];
    redibujarHecho(plan.length - 1, u.segs.length);
    lineaActual.setLatLngs([]);
    vehiculo.setLatLng(u.llegada);
    mapa.flyToBounds(limitesTodo, { ...margenes(), maxZoom: 13.5, duration: 1 });
    esc.classList.add('con-capa');
    $('#final').classList.remove('oculto');
  }

  /* ---------- Controles ---------- */
  $('#btn-empezar').addEventListener('click', arrancar);
  $('#btn-otra').addEventListener('click', () => { irA(0, false); arrancar(); });
  $('#btn-play').addEventListener('click', () => { enMarcha ? pausar() : reproducir(); });
  $('#btn-atras').addEventListener('click', () => irA(escenaEn(ahora()) - 1, true));
  $('#btn-adelante').addEventListener('click', () => {
    const n = escenaEn(ahora());
    if (n >= escenas.length - 1) terminar(); else irA(n + 1, true);
  });
  $('#btn-velocidad').addEventListener('click', e => {
    velocidad = (velocidad + 1) % VELOCIDADES.length;
    audio.playbackRate = VELOCIDADES[velocidad];
    e.currentTarget.textContent = '×' + String(VELOCIDADES[velocidad]).replace('.', ',');
  });
  $('#btn-texto').addEventListener('click', e => {
    const on = esc.classList.toggle('con-texto');
    e.currentTarget.setAttribute('aria-pressed', on);
  });
  $('#btn-atras').innerHTML = ICONO.atras;
  $('#btn-adelante').innerHTML = ICONO.adelante;
  document.querySelector('#btn-empezar .icono').innerHTML = ICONO.play;
  document.querySelector('#btn-otra .icono').innerHTML = ICONO.play;
  document.addEventListener('keydown', e => {
    if (!$('#portada').classList.contains('oculto')) return;
    if (e.key === ' ') { e.preventDefault(); enMarcha ? pausar() : reproducir(); }
    if (e.key === 'ArrowRight') irA(escenaEn(ahora()) + 1, true);
    if (e.key === 'ArrowLeft') irA(escenaEn(ahora()) - 1, true);
  });
  audio.addEventListener('error', usarSinAudio);
  audio.addEventListener('ended', () => { if (enMarcha) terminar(); });
  window.addEventListener('resize', () => { mapa.invalidateSize(); moverCamara(Math.max(escenaMapa, 0), false); });

  /* ---------- Estado inicial ---------- */
  const m = Math.floor(TRAILER.total / 60), sg = Math.round(TRAILER.total % 60);
  $('#duracion').textContent = `Dura ${m} min ${sg} s. Sube el volumen.`;
  ponerIcono();
  mapa.fitBounds(limitesTodo, { paddingTopLeft: [40, 40], paddingBottomRight: [50, innerHeight * 0.45], maxZoom: 13.5, animate: false });
  pintarEscena(0);
  pintarProgreso(0);
  vehiculo.setLatLng(RUTA[0].inicio);
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: TRAILER.titulo, artist: 'Viaje al Lago de Como y Suiza' });
  }
})();
