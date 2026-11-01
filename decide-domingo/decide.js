/* Quiz de decisión: cada duelo suma afinidad a los planes y el resultado sale en porcentaje. */
(function () {
  const app = document.getElementById('app');
  const URL_QUIZ = 'https://marcosfp.github.io/paginas-claude/decide-domingo/';
  const claves = Object.keys(PLANES);
  let estado = null;

  const srcFoto = k => (FOTOS_TEST.includes(k) ? '../test-viaje/' : '') + k + '.jpg';

  function el(etiqueta, clase, texto) {
    const n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  function foto(k, alt) {
    const i = el('img');
    i.src = srcFoto(k);
    i.alt = alt || '';
    return i;
  }

  /* ---------- Portada ---------- */
  function portada() {
    estado = null;
    app.innerHTML = '';
    const s = el('section', 'portada');
    const tira = el('div', 'tira');
    ['ponte', 'montebello', 'morcote'].forEach(k => tira.appendChild(foto(k)));
    s.appendChild(tira);
    s.appendChild(el('p', 'kicker', 'Domingo 8 de noviembre · Suiza'));
    s.appendChild(el('h1', '', 'Decide el domingo'));
    s.appendChild(el('p', 'lede', `Lago, río o castillos: no cabe todo en un día. Responde ${DUELOS.length} duelos, foto contra foto, y te decimos qué domingo os encaja, con su horario.`));
    s.appendChild(el('h2', 'pregunta-inicio', '¿Quién juega?'));
    const b = el('div', 'quien');
    [[1, 'Una persona', 'Tarda un par de minutos'], [2, 'Dos personas', 'Por turnos, con el mismo móvil']].forEach(([n, t, d]) => {
      const x = el('button', 'quien-boton');
      x.type = 'button';
      x.appendChild(el('strong', '', t));
      x.appendChild(el('span', '', d));
      x.addEventListener('click', () => empezar(n));
      b.appendChild(x);
    });
    s.appendChild(b);
    app.appendChild(s);
    window.scrollTo(0, 0);
  }

  function empezar(n) {
    estado = { jugadores: n, jugador: 0, i: 0, resp: [[], []] };
    pintarDuelo();
  }

  /* ---------- Duelo ---------- */
  function tarjeta(op, lado) {
    const b = el('button', 'opcion');
    b.type = 'button';
    if (op.img) {
      const f = el('div', 'opcion-foto');
      f.appendChild(foto(op.img, op.titulo));
      b.appendChild(f);
    } else {
      b.appendChild(el('div', 'opcion-grande', op.grande));
    }
    b.appendChild(el('strong', '', op.titulo));
    b.appendChild(el('span', '', op.dato));
    b.addEventListener('click', () => elegir(lado, b));
    return b;
  }

  function pintarDuelo() {
    const d = DUELOS[estado.i];
    app.innerHTML = '';
    const s = el('section', 'duelo');
    const cab = el('div', 'cabecera');
    const quien = estado.jugadores === 2 ? `Persona ${estado.jugador + 1} · ` : '';
    cab.appendChild(el('span', 'contador', `${quien}Duelo ${estado.i + 1} de ${DUELOS.length}`));
    if (estado.i > 0) {
      const v = el('button', 'volver', 'Anterior');
      v.type = 'button';
      v.addEventListener('click', () => {
        estado.i--;
        estado.resp[estado.jugador].pop();
        pintarDuelo();
      });
      cab.appendChild(v);
    }
    s.appendChild(cab);
    const barra = el('div', 'barra');
    const relleno = el('i');
    relleno.style.width = (estado.i / DUELOS.length * 100) + '%';
    barra.appendChild(relleno);
    s.appendChild(barra);
    s.appendChild(el('h2', 'enunciado', d.q));
    const par = el('div', 'par');
    par.appendChild(tarjeta(d.a, 'a'));
    par.appendChild(el('span', 'o', 'o'));
    par.appendChild(tarjeta(d.b, 'b'));
    s.appendChild(par);
    app.appendChild(s);
    window.scrollTo(0, 0);
    const sig = DUELOS[estado.i + 1];
    if (sig) [sig.a, sig.b].forEach(o => { if (o.img) new Image().src = srcFoto(o.img); });
  }

  function elegir(lado, boton) {
    if (estado.bloqueo) return;
    estado.bloqueo = true;
    boton.classList.add('elegida');
    estado.resp[estado.jugador].push(lado);
    setTimeout(() => {
      estado.bloqueo = false;
      estado.i++;
      if (estado.i < DUELOS.length) pintarDuelo();
      else if (estado.jugador + 1 < estado.jugadores) cambioTurno();
      else resultado();
    }, 320);
  }

  function cambioTurno() {
    app.innerHTML = '';
    const s = el('section', 'turno');
    s.appendChild(el('p', 'kicker', 'Turno terminado'));
    s.appendChild(el('h1', '', 'Pasa el móvil'));
    s.appendChild(el('p', 'lede', 'Ahora responde la segunda persona, sin mirar lo que ha elegido la primera.'));
    const b = el('button', 'boton principal', 'Empezar el turno');
    b.type = 'button';
    b.addEventListener('click', () => {
      estado.jugador = 1;
      estado.i = 0;
      pintarDuelo();
    });
    s.appendChild(b);
    app.appendChild(s);
    window.scrollTo(0, 0);
  }

  /* ---------- Resultado ---------- */
  function calcular() {
    const suma = Object.fromEntries(claves.map(k => [k, 0]));
    const max = Object.fromEntries(claves.map(k => [k, 0]));
    DUELOS.forEach((d, i) => {
      claves.forEach(k => { max[k] += Math.max(d.a.puntos[k] || 0, d.b.puntos[k] || 0) * estado.jugadores; });
      for (let j = 0; j < estado.jugadores; j++) {
        const op = d[estado.resp[j][i]];
        claves.forEach(k => { suma[k] += op.puntos[k] || 0; });
      }
    });
    return claves.map(k => ({ k, pct: Math.round(suma[k] / max[k] * 100) })).sort((x, y) => y.pct - x.pct);
  }

  function fichaPlan(p, conFotos) {
    const c = el('div', 'ficha');
    if (conFotos) {
      const t = el('div', 'tira');
      p.fotos.forEach(k => t.appendChild(foto(k)));
      c.appendChild(t);
    }
    const datos = el('dl', 'datos');
    [['Distancia', p.km], ['Coche', p.coche], ['Viñeta', p.vineta]].forEach(([a, b]) => {
      const f = el('div');
      f.appendChild(el('dt', '', a));
      f.appendChild(el('dd', '', b));
      datos.appendChild(f);
    });
    c.appendChild(datos);
    const mejor = el('p', 'pro');
    mejor.appendChild(el('b', '', 'Lo mejor: '));
    mejor.appendChild(document.createTextNode(p.mejor));
    c.appendChild(mejor);
    const pierdes = el('p', 'pro');
    pierdes.appendChild(el('b', '', 'A cambio: '));
    pierdes.appendChild(document.createTextNode(p.pierdes));
    c.appendChild(pierdes);
    const h = el('ol', 'horario');
    p.horario.forEach(([a, b]) => {
      const li = el('li');
      li.appendChild(el('time', '', a));
      li.appendChild(el('span', '', b));
      h.appendChild(li);
    });
    c.appendChild(h);
    return c;
  }

  function resultado() {
    const orden = calcular();
    const g = orden[0], p = PLANES[g.k];
    const empate = orden[1].pct === g.pct;
    app.innerHTML = '';
    const s = el('section', 'final');
    s.appendChild(el('p', 'kicker', estado.jugadores === 2 ? 'Vuestro domingo' : 'Tu domingo'));
    s.appendChild(el('h1', '', p.nombre));
    s.appendChild(el('p', 'lede', p.lema));
    if (empate) s.appendChild(el('p', 'aviso', `Empate con «${PLANES[orden[1].k].nombre}». Mirad los dos horarios y decidid a cara o cruz.`));
    s.appendChild(fichaPlan(p, true));

    const tiempo = el('p', 'aviso');
    tiempo.hidden = true;
    s.appendChild(tiempo);
    cargarTiempo(tiempo, g.k);

    if (estado.jugadores === 2) {
      const dif = DUELOS.filter((d, i) => estado.resp[0][i] !== estado.resp[1][i]);
      s.appendChild(el('h2', 'sub', `Coincidís en ${DUELOS.length - dif.length} de ${DUELOS.length} duelos`));
      if (dif.length) {
        const ul = el('ul', 'dudas');
        dif.forEach(d => ul.appendChild(el('li', '', `${d.a.titulo} o ${d.b.titulo}`)));
        s.appendChild(ul);
      }
    }

    s.appendChild(el('h2', 'sub', 'Cómo han quedado los planes'));
    const rank = el('div', 'ranking');
    orden.forEach((o, i) => {
      const det = el('details');
      if (i === 0) det.className = 'ganador';
      const sum = el('summary');
      sum.appendChild(el('span', 'rank-nombre', PLANES[o.k].nombre));
      sum.appendChild(el('span', 'rank-pct', o.pct + ' %'));
      det.appendChild(sum);
      det.appendChild(fichaPlan(PLANES[o.k], false));
      rank.appendChild(det);
    });
    s.appendChild(rank);
    s.appendChild(el('p', 'nota', 'El porcentaje indica cuánto encajan vuestras respuestas con cada plan. Toca uno para ver su horario.'));

    const acc = el('div', 'acciones');
    const texto = `Para el domingo en Suiza nos sale: ${p.nombre} (${g.pct} %). ¿A ti qué te sale?`;
    const tg = el('a', 'boton principal', 'Compartir en Telegram');
    tg.href = 'https://t.me/share/url?url=' + encodeURIComponent(URL_QUIZ) + '&text=' + encodeURIComponent(texto);
    tg.target = '_blank';
    tg.rel = 'noopener';
    const otra = el('button', 'boton', 'Volver a empezar');
    otra.type = 'button';
    otra.addEventListener('click', portada);
    const plan = el('a', 'boton', 'Ver el plan del viaje');
    plan.href = '../como-suiza/';
    acc.append(tg, otra, plan);
    s.appendChild(acc);
    s.appendChild(el('p', 'nota', 'Este resultado no cambia el plan publicado, que sigue siendo «Lagos y miradores». Horarios y distancias son aproximados.'));
    app.appendChild(s);
    window.scrollTo(0, 0);
  }

  function cargarTiempo(nodo, plan) {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=46.003&longitude=8.952&daily=precipitation_sum,precipitation_probability_max&timezone=Europe%2FRome&start_date=2026-11-08&end_date=2026-11-08';
    fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => {
      const mm = Math.round(d.daily.precipitation_sum[0] * 10) / 10;
      const prob = d.daily.precipitation_probability_max[0];
      const lluvia = mm >= 3 || prob >= 60;
      let t = `Previsión de ahora para Lugano el domingo: ${mm.toLocaleString('es-ES')} mm de lluvia.`;
      if (lluvia && plan !== 'castillos') t += ' Si se mantiene, el río y los miradores lucirán menos: «Castillos y Lugano» aguanta mejor.';
      nodo.textContent = t;
      nodo.hidden = false;
    }).catch(() => { /* sin previsión, el resultado sigue siendo válido */ });
  }

  /* Créditos */
  const cred = document.getElementById('creditos');
  Object.keys(CREDITOS).sort().forEach(k => {
    const c = CREDITOS[k];
    const li = el('li');
    const a = el('a', '', k);
    a.href = c.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = c.autor;
    li.appendChild(a);
    li.appendChild(document.createTextNode(' · ' + c.licencia));
    cred.appendChild(li);
  });

  portada();
})();
