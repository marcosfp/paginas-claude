/* El test del viaje: elige preguntas, las muestra de una en una y corrige al momento. */
(function () {
  const app = document.getElementById('app');
  const URL_TEST = 'https://marcosfp.github.io/paginas-claude/test-viaje/';
  const CLAVE_MARCA = 'test-viaje-mejor';

  const NIVELES = [
    { min: 0, nombre: 'Principiante', sello: 'Principiante',
      texto: 'Sabes que hay un lago y que hay que coger un avión. Repasa el plan antes de pisar Malpensa, o te pasarás el fin de semana preguntando dónde estamos.' },
    { min: 50, nombre: 'Medio', sello: 'Medio',
      texto: 'Vas bien: llegarías a Como sin perderte, aunque quizá en el ferri equivocado. Un repaso más al plan y ya no te hace falta nadie.' },
    { min: 80, nombre: 'Avanzado', sello: 'Avanzado',
      texto: 'Sí: ya eres un total conocedor de lo que vamos a hacer en el viaje. A partir de ahora, tú llevas el mapa y tú das las explicaciones en cada parada.' }
  ];

  let estado = null;

  function barajar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* Reparte el test para que siempre haya fotos, rutas y alguna parida. */
  function elegirPreguntas(total) {
    const porCat = {};
    barajar(PREGUNTAS).forEach(p => { (porCat[p.c] = porCat[p.c] || []).push(p); });
    const cupos = { ruta: total >= 20 ? 2 : 1, foto: Math.round(total * 0.25), parida: Math.max(2, Math.round(total * 0.15)), plan: Math.round(total * 0.2) };
    const elegidas = [];
    Object.keys(cupos).forEach(c => { elegidas.push(...porCat[c].splice(0, cupos[c])); });
    const resto = barajar(Object.keys(porCat).flatMap(c => porCat[c]));
    while (elegidas.length < total && resto.length) elegidas.push(resto.shift());
    return barajar(elegidas);
  }

  function el(etiqueta, clase, texto) {
    const n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  function leerMarca() {
    try { return JSON.parse(localStorage.getItem(CLAVE_MARCA)); } catch (e) { return null; }
  }
  function guardarMarca(pct, aciertos, total) {
    try {
      const m = leerMarca();
      if (!m || pct > m.pct) localStorage.setItem(CLAVE_MARCA, JSON.stringify({ pct, aciertos, total }));
    } catch (e) { /* sin almacenamiento, sin marca */ }
  }

  function subir() { window.scrollTo(0, 0); }

  /* ---------- Portada ---------- */
  function portada() {
    estado = null;
    app.innerHTML = '';
    const s = el('section', 'portada');
    const foto = el('img', 'portada-foto');
    foto.src = 'balbianello.jpg';
    foto.alt = 'Villa del Balbianello, a orillas del Lago de Como';
    s.appendChild(foto);
    s.appendChild(el('p', 'kicker', 'Lago de Como y Suiza · 6–9 de noviembre'));
    s.appendChild(el('h1', '', 'El test del viaje'));
    s.appendChild(el('p', 'lede', 'Plan, monumentos, comida, frontera y alguna pregunta parida. No hace falta saber nada: si fallas, te decimos la respuesta correcta y aprendes por el camino.'));
    s.appendChild(el('h2', 'pregunta-inicio', '¿Cuántas preguntas quieres?'));
    const botones = el('div', 'cuantas');
    [10, 15, 20].forEach(n => {
      const b = el('button', 'cuanta');
      b.type = 'button';
      b.appendChild(el('strong', '', String(n)));
      b.appendChild(el('span', '', n === 10 ? 'Café rápido' : n === 15 ? 'Cruce en ferri' : 'Vuelta al lago'));
      b.addEventListener('click', () => empezar(n));
      botones.appendChild(b);
    });
    s.appendChild(botones);
    const m = leerMarca();
    if (m) s.appendChild(el('p', 'marca', `Tu mejor resultado en este móvil: ${m.aciertos} de ${m.total} (${m.pct} %).`));
    s.appendChild(el('p', 'cuenta-banco', `Hay ${PREGUNTAS.length} preguntas y cada partida elige otras al azar.`));
    app.appendChild(s);
    subir();
  }

  function empezar(total) {
    estado = { lista: elegirPreguntas(total), i: 0, aciertos: 0, fallos: [] };
    pintarPregunta();
  }

  /* ---------- Pregunta ---------- */
  function pintarPregunta() {
    const p = estado.lista[estado.i];
    app.innerHTML = '';
    const s = el('section', 'billete');

    const ruta = el('ol', 'recorrido');
    ruta.setAttribute('aria-hidden', 'true');
    estado.lista.forEach((_, n) => {
      const li = el('li');
      if (n < estado.i) li.className = estado.resultados && estado.resultados[n] === false ? 'hecha mal' : 'hecha';
      if (n === estado.i) li.className = 'actual';
      ruta.appendChild(li);
    });
    s.appendChild(ruta);

    const cab = el('div', 'cabecera');
    cab.appendChild(el('span', 'parada', `Parada ${estado.i + 1} de ${estado.lista.length}`));
    cab.appendChild(el('span', 'chip', CATEGORIAS[p.c]));
    s.appendChild(cab);

    if (p.img) {
      const fig = el('div', 'foto');
      const img = el('img');
      img.src = p.img + '.jpg';
      img.alt = 'Foto del lugar por el que se pregunta';
      fig.appendChild(img);
      s.appendChild(fig);
    }

    s.appendChild(el('h2', 'enunciado', p.q));
    s.appendChild(el('hr', 'corte'));

    if (p.orden) pintarOrden(s, p); else pintarOpciones(s, p);
    app.appendChild(s);
    subir();
    precargar();
  }

  function precargar() {
    const sig = estado.lista[estado.i + 1];
    if (sig && sig.img) { const i = new Image(); i.src = sig.img + '.jpg'; }
  }

  function pintarOpciones(s, p) {
    const correcta = p.o[0];
    const opciones = el('div', 'opciones');
    barajar(p.o).forEach(texto => {
      const b = el('button', 'opcion', texto);
      b.type = 'button';
      b.addEventListener('click', () => {
        const bien = texto === correcta;
        opciones.querySelectorAll('button').forEach(x => {
          x.disabled = true;
          if (x.textContent === correcta) x.classList.add('correcta');
        });
        if (!bien) b.classList.add('incorrecta');
        responder(s, p, bien, correcta);
      });
      opciones.appendChild(b);
    });
    s.appendChild(opciones);
  }

  /* Ordenar: se toca cada elemento en el orden correcto. Funciona igual en el móvil. */
  function pintarOrden(s, p) {
    const elegidos = [];
    const caja = el('div', 'orden');
    const ayuda = el('p', 'ayuda', 'Toca las paradas por orden. Si te equivocas, tócala otra vez para quitarla.');
    const lista = el('div', 'opciones');
    const comprobar = el('button', 'siguiente', 'Comprobar');
    comprobar.type = 'button';
    comprobar.disabled = true;

    barajar(p.orden).forEach(texto => {
      const b = el('button', 'opcion con-numero');
      b.type = 'button';
      const num = el('span', 'numero', '');
      b.appendChild(num);
      b.appendChild(el('span', '', texto));
      b.addEventListener('click', () => {
        const i = elegidos.indexOf(texto);
        if (i >= 0) elegidos.splice(i, 1); else elegidos.push(texto);
        lista.querySelectorAll('button').forEach(x => {
          const t = x.lastChild.textContent;
          const pos = elegidos.indexOf(t);
          x.firstChild.textContent = pos >= 0 ? String(pos + 1) : '';
          x.classList.toggle('marcada', pos >= 0);
        });
        comprobar.disabled = elegidos.length !== p.orden.length;
      });
      lista.appendChild(b);
    });

    comprobar.addEventListener('click', () => {
      const bien = elegidos.every((t, i) => t === p.orden[i]);
      lista.querySelectorAll('button').forEach(x => {
        x.disabled = true;
        const t = x.lastChild.textContent;
        x.classList.add(elegidos.indexOf(t) === p.orden.indexOf(t) ? 'correcta' : 'incorrecta');
      });
      comprobar.remove();
      responder(s, p, bien, p.orden.join(' → '));
    });

    caja.appendChild(ayuda);
    caja.appendChild(lista);
    caja.appendChild(comprobar);
    s.appendChild(caja);
  }

  function responder(s, p, bien, correcta) {
    if (bien) estado.aciertos++;
    else estado.fallos.push({ q: p.q, correcta });
    estado.resultados = estado.resultados || [];
    estado.resultados[estado.i] = bien;

    const fb = el('div', 'respuesta ' + (bien ? 'bien' : 'mal'));
    fb.setAttribute('role', 'status');
    fb.appendChild(el('strong', '', bien ? '¡Correcto!' : 'Pues no.'));
    if (!bien) fb.appendChild(el('p', 'era', 'Era: ' + correcta));
    fb.appendChild(el('p', '', p.d));
    s.appendChild(fb);

    const ultima = estado.i === estado.lista.length - 1;
    const sig = el('button', 'siguiente', ultima ? 'Ver mi resultado' : 'Siguiente parada');
    sig.type = 'button';
    sig.addEventListener('click', () => {
      if (ultima) resultado();
      else { estado.i++; pintarPregunta(); }
    });
    s.appendChild(sig);
    sig.scrollIntoView({ block: 'nearest' });
    sig.focus({ preventScroll: true });
  }

  /* ---------- Resultado ---------- */
  function resultado() {
    const total = estado.lista.length;
    const pct = Math.round(estado.aciertos / total * 100);
    const nivel = NIVELES.slice().reverse().find(n => pct >= n.min);
    guardarMarca(pct, estado.aciertos, total);

    app.innerHTML = '';
    const s = el('section', 'billete final');
    s.appendChild(el('p', 'kicker', 'Fin del trayecto'));
    const sello = el('div', 'sello nivel-' + nivel.nombre.toLowerCase());
    sello.appendChild(el('span', 'sello-nivel', nivel.sello));
    sello.appendChild(el('span', 'sello-nota', `${estado.aciertos} de ${total}`));
    s.appendChild(sello);
    s.appendChild(el('h1', '', 'Nivel ' + nivel.nombre.toLowerCase()));
    s.appendChild(el('p', 'lede', nivel.texto));
    if (pct === 100) s.appendChild(el('p', 'pleno', 'Pleno absoluto. Vas tú delante en el coche, y las multas también son tuyas.'));

    const acciones = el('div', 'acciones');
    const texto = `He sacado ${estado.aciertos} de ${total} en el test del viaje: nivel ${nivel.nombre.toLowerCase()}. ¿Lo superas?`;
    const compartir = el('a', 'boton principal', 'Compartir en Telegram');
    compartir.href = 'https://t.me/share/url?url=' + encodeURIComponent(URL_TEST) + '&text=' + encodeURIComponent(texto);
    compartir.target = '_blank';
    compartir.rel = 'noopener';
    const otra = el('button', 'boton', 'Otra partida');
    otra.type = 'button';
    otra.addEventListener('click', portada);
    const plan = el('a', 'boton', 'Ver el plan del viaje');
    plan.href = '../como-suiza/';
    acciones.append(compartir, otra, plan);
    s.appendChild(acciones);

    if (estado.fallos.length) {
      s.appendChild(el('h2', 'repaso-titulo', 'Para repasar'));
      const ul = el('ul', 'repaso');
      estado.fallos.forEach(f => {
        const li = el('li');
        li.appendChild(el('span', 'repaso-q', f.q));
        li.appendChild(el('span', 'repaso-a', f.correcta));
        ul.appendChild(li);
      });
      s.appendChild(ul);
    }
    app.appendChild(s);
    subir();
  }

  /* Créditos de las fotos */
  const cred = document.getElementById('creditos');
  Object.keys(CREDITOS).sort().forEach(k => {
    const c = CREDITOS[k];
    const li = el('li');
    const a = el('a', '', c.titulo);
    a.href = c.url;
    a.target = '_blank';
    a.rel = 'noopener';
    li.appendChild(a);
    li.appendChild(document.createTextNode(` · ${c.autor} · ${c.licencia}`));
    cred.appendChild(li);
  });

  document.documentElement.classList.add('js');
  portada();
})();
