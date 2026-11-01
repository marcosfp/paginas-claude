/* Reproductor del trailer: la pista de voz manda; las escenas, la foto y el vehículo siguen su tiempo. */
(function () {
  const FOTOS = '../test-viaje/';
  const CLAVE_MODO = 'viaje-modo-sabado';
  const ICONO = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    atras: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
    adelante: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>'
  };
  /* Personajes: ancho, alto y archivo. A pie van más pequeños que en los vehículos. */
  const VEHICULOS = {
    coche: { w: 132, h: 79, src: 'pj-coche.svg' },
    ferri: { w: 132, h: 84, src: 'pj-ferri.svg' },
    funicular: { w: 120, h: 76, src: 'pj-funicular.svg' },
    pie: { w: 62, h: 72, src: 'pj-pie.svg' }
  };
  Object.values(VEHICULOS).forEach(v => { new Image().src = v.src; });

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
  const audio = $('#voz');
  const esc = $('#escenario');
  const clavesModo = Object.keys(MODOS);
  let modo = clavesModo[0], TRAILER = null, escenas = [], plan = [], limitesTodo = null, barras = [];
  let actual = -1, enMarcha = false, sinAudio = false, relojInicio = 0, relojPausa = 0;
  let velocidad = 0, escenaMapa = -1, tramoHecho = -2;

  /* ---------- Mapa base ---------- */
  const mapa = L.map('mapa', { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false, zoomSnap: 0.25, minZoom: 7, maxZoom: 16 });
  mapa.attributionControl.setPrefix(false);
  mapa.attributionControl.addAttribution('© OpenStreetMap');
  L.polygon(GEO.ticino.coords, { className: 'geo-suiza', interactive: false }).addTo(mapa);
  Object.keys(ROUTES).forEach(k => L.polyline(ROUTES[k], { className: 'geo-carretera', weight: 2.5, interactive: false }).addTo(mapa));
  ['como', 'lugano', 'varese', 'maggiore'].forEach(k => L.polygon(GEO[k].coords, { className: 'geo-agua', interactive: false }).addTo(mapa));
  PUEBLOS.forEach(([n, lat, lng, d]) => L.marker([lat, lng], { interactive: false, keyboard: false, zIndexOffset: -1000, icon: L.divIcon({ className: 'pueblo', iconSize: [0, 0], html: `<span class="${d}">${n}</span>` }) }).addTo(mapa));

  const dist = (a, b) => L.latLng(a).distanceTo(L.latLng(b));
  const fantasma = L.layerGroup().addTo(mapa);
  const hecho = L.layerGroup().addTo(mapa);
  const paradas = L.layerGroup().addTo(mapa);
  const lineaActual = L.polyline([], { interactive: false, ...ESTILO.coche }).addTo(mapa);
  let vehiculoTipo = 'coche', vehiculoIzq = false, etiqueta = null;
  const vehiculo = L.marker(HOTEL, { interactive: false, keyboard: false, zIndexOffset: 2000, icon: iconoVehiculo('coche', false) }).addTo(mapa);

  function iconoVehiculo(tipo, izq) {
    const v = VEHICULOS[tipo];
    return L.divIcon({ className: '', iconSize: [v.w, v.h], iconAnchor: [v.w / 2, v.h - 6], html: `<div class="vehiculo${izq ? ' izq' : ''}" style="width:${v.w}px;height:${v.h}px"><img src="${v.src}" alt=""></div>` });
  }

  /* Prepara cada escena: puntos, longitud acumulada y salida y llegada */
  function prepararPlan(ruta) {
    let posicion = ruta[0].inicio, tipoActual = ruta[0].tipo;
    const salida = ruta.map(r => {
      const segs = (r.pasos || []).map(p => {
        let pts = p.r ? ROUTES[p.r] : p.pts;
        if (p.inv) pts = pts.slice().reverse();
        const acum = [0];
        for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + dist(pts[i - 1], pts[i]));
        return { tipo: p.tipo, pts, acum, largo: acum[acum.length - 1] };
      });
      const total = segs.reduce((s, x) => s + x.largo, 0);
      const inicio = posicion;
      if (segs.length) {
        const u = segs[segs.length - 1];
        posicion = u.pts[u.pts.length - 1];
        tipoActual = u.tipo;
      }
      return { r, segs, total, salida: inicio, llegada: posicion, tipoLlegada: tipoActual };
    });
    const todos = [ruta[0].inicio];
    salida.forEach(p => p.segs.forEach(s => s.pts.forEach(x => todos.push(x))));
    limitesTodo = L.latLngBounds(todos);
    return salida;
  }

  function margenes() {
    const h = innerHeight, w = innerWidth;
    const fi = $('#ficha').getBoundingClientRect();
    const po = $('#postal').getBoundingClientRect();
    const abajo = Math.max(h - fi.top, 90) + 36;
    if (w > h * 1.1) return { paddingTopLeft: [60, 90], paddingBottomRight: [Math.max(po.width, 240) + 60, abajo] };
    return { paddingTopLeft: [50, Math.min(Math.max(po.bottom, 190) + 70, h * 0.46)], paddingBottomRight: [60, abajo] };
  }

  function moverCamara(n, animar) {
    const p = plan[n], c = p.r.camara;
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
    const maxZoom = p.r.zoomMax || 13.5;
    if (animar) mapa.flyToBounds(lim, { ...margenes(), maxZoom, duration: 1 });
    else mapa.fitBounds(lim, { ...margenes(), maxZoom, animate: false });
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
      const pa = plan[k].r.parada;
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

  /* ---------- Plan elegido ---------- */
  function pintarSelectores() {
    document.querySelectorAll('[data-selector]').forEach(c => {
      c.hidden = clavesModo.length < 2;
      c.innerHTML = clavesModo.map(k => `<button type="button" data-modo="${k}" aria-pressed="${k === modo}">${MODOS[k].etiqueta}<span>${MODOS[k].detalle} · ${fmt(TRAILERS[MODOS[k].datos].total)}</span></button>`).join('');
    });
    const otro = clavesModo.find(k => k !== modo);
    const b = $('#btn-otro-plan');
    if (b) {
      b.hidden = !otro;
      if (otro) b.lastChild.textContent = 'Ver ' + MODOS[otro].etiqueta.toLowerCase();
    }
  }

  function cargarModo(m) {
    modo = m;
    const cfg = MODOS[m];
    TRAILER = TRAILERS[cfg.datos];
    escenas = TRAILER.escenas;
    plan = prepararPlan(cfg.ruta);
    if (clavesModo.length > 1) { try { localStorage.setItem(CLAVE_MODO, m); } catch (e) { /* sin almacenamiento */ } }

    audio.pause();
    sinAudio = false;
    audio.src = cfg.audio;
    audio.load();
    enMarcha = false;

    fantasma.clearLayers();
    hecho.clearLayers();
    paradas.clearLayers();
    if (etiqueta) { mapa.removeLayer(etiqueta); etiqueta = null; }
    lineaActual.setLatLngs([]);
    plan.forEach(p => p.segs.forEach(s => L.polyline(s.pts, { className: 'tr-' + s.tipo, weight: 2.5, opacity: .3, dashArray: '4 7', interactive: false }).addTo(fantasma)));

    const tramos = $('#tramos');
    tramos.innerHTML = '';
    barras = escenas.map((s, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Ir a ${s.hora}: ${s.titulo}`);
      b.style.flexGrow = Math.max(s.duracion, 4);
      b.innerHTML = '<span><i></i></span>';
      b.addEventListener('click', () => irA(n, true));
      tramos.appendChild(b);
      return b.querySelector('i');
    });

    actual = -1; escenaMapa = -1; tramoHecho = -2;
    vehiculoTipo = cfg.ruta[0].tipo; vehiculoIzq = false;
    vehiculo.setIcon(iconoVehiculo(vehiculoTipo, false));
    vehiculo.setLatLng(cfg.ruta[0].inicio);
    mapa.fitBounds(limitesTodo, { paddingTopLeft: [40, 60], paddingBottomRight: [50, innerHeight * 0.42], maxZoom: 13.5, animate: false });
    pintarEscena(0);
    pintarProgreso(0);
    ponerIcono();

    $('#plan-chip').textContent = clavesModo.length > 1 ? cfg.etiqueta : '';
    $('#duracion').textContent = `Dura ${Math.floor(TRAILER.total / 60)} min ${Math.floor(TRAILER.total % 60)} s. Sube el volumen.`;
    pintarSelectores();
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
    mapa.flyToBounds(limitesTodo, { paddingTopLeft: [40, 60], paddingBottomRight: [50, innerHeight * 0.42], maxZoom: 13.5, duration: 1 });
    esc.classList.add('con-capa');
    $('#final').classList.remove('oculto');
  }

  /* ---------- Controles ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-modo]');
    if (b && b.dataset.modo !== modo) cargarModo(b.dataset.modo);
  });
  $('#btn-empezar').addEventListener('click', arrancar);
  $('#btn-otra').addEventListener('click', () => { irA(0, false); arrancar(); });
  $('#btn-otro-plan').addEventListener('click', () => {
    const otro = clavesModo.find(k => k !== modo);
    if (otro) { cargarModo(otro); arrancar(); }
  });
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
  document.querySelectorAll('.boton .icono').forEach(i => { i.innerHTML = ICONO.play; });
  document.addEventListener('keydown', e => {
    if (!$('#portada').classList.contains('oculto')) return;
    if (e.key === ' ') { e.preventDefault(); enMarcha ? pausar() : reproducir(); }
    if (e.key === 'ArrowRight') irA(escenaEn(ahora()) + 1, true);
    if (e.key === 'ArrowLeft') irA(escenaEn(ahora()) - 1, true);
  });
  audio.addEventListener('error', () => { if (audio.getAttribute('src')) usarSinAudio(); });
  audio.addEventListener('ended', () => { if (enMarcha) terminar(); });
  window.addEventListener('resize', () => { mapa.invalidateSize(); if (escenaMapa >= 0) moverCamara(escenaMapa, false); });

  /* ---------- Estado inicial ---------- */
  let inicial = clavesModo[0];
  try {
    const guardado = localStorage.getItem(CLAVE_MODO);
    if (guardado && MODOS[guardado]) inicial = guardado;
  } catch (e) { /* sin almacenamiento */ }
  cargarModo(inicial);
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: TRAILER.titulo, artist: 'Viaje al Lago de Como y Suiza' });
  }
})();
