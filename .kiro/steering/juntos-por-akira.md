# Steering: Juntos por Akira

Documento de referencia. Si me pierdo o el contexto se corta, vuelvo aqui antes de seguir.

## Que es

Aplicacion web REAL, final, completa y funcional para una rifa solidaria llamada
"Juntos por Akira". No es demo, no es mockup, no es ejercicio. Situacion real: la
gata del usuario (Sean Alexander Vargas Romero) esta enferma y la pagina debe
recaudar dinero de verdad desde el momento del despliegue. Todo debe funcionar en
produccion con datos reales.

## Requisitos funcionales (no negociables)

- 300 numeros (del 1 al 300), cada uno a mil colones (₡1.000).
- Sistema para marcar numeros como vendidos. Solo el admin puede marcar.
- Ticker infinito de agradecimientos. Solo el admin agrega mensajes.
- Seccion "Quien es Akira" con fotos y texto, editable por el admin.
- Instrucciones de pago claras y visibles:
  - Sinpe al numero: 506 8556 9584
  - Nombre: Sean Alexander Vargas Romero
  - En el motivo del Sinpe se indica el numero que se esta comprando.
  - Si el numero ya no esta disponible, la persona escribe por WhatsApp al mismo numero.

## Requisitos visuales

- Estilo 100% hand-drawn / sketchy. Usar rough.js + react-rough-fiber.
- Gatos de fondo SOLO en outline / line-art / vector (Lottie de linea o SVG outline animados).
  Nada de gatos con relleno o fotorealistas de fondo.
- Colores pastel cottagecore: crema, rosa palido, verde menta, lavanda, beige.
- Tipografias gruesas y legibles.
- Cero emojis normales.
- Sin em-dashes (ni guiones largos tipograficos).
- Totalmente responsive.

## Requisitos tecnicos y de seguridad

- React + Vite + TypeScript.
- Backend real y persistente. Supabase preferido. Firebase o Google Sheets solo si
  es claramente superior en este caso (no lo es: Supabase gana por Postgres + RLS + Auth).
- Panel de administracion real y protegido.
- Nadie puede modificar datos desde fuera sin autenticacion.
- Codigo limpio: sin placeholders, sin TODO, sin datos de ejemplo falsos.

## Arquitectura elegida (Supabase)

- Postgres con Row Level Security (RLS) activado en todas las tablas.
- Lectura publica (anon) permitida solo para SELECT de estado de rifa/ticker/contenido Akira.
- Toda escritura (marcar vendido, agregar ticker, editar Akira) requiere sesion admin
  autenticada via Supabase Auth. RLS debe validar el rol/usuario, no confiar en el cliente.
- Nunca exponer la service_role key en el frontend. El frontend solo usa la anon key.
- Tablas base sugeridas:
  - `numbers` (id 1..300, status: available/sold, updated_at)
  - `ticker_messages` (id, message, created_at)
  - `akira_content` (id fijo/singleton, texto, urls de fotos en Supabase Storage)
- Storage bucket para fotos de Akira; escritura solo admin, lectura publica.

## Proceso obligatorio (6 pasos, internos, tras bambalinas)

Seguir en orden. NO mostrar razonamiento, analisis parcial, codigo intermedio,
listas de tareas ni comentarios sobre los pasos. Solo la respuesta final limpia.

1. Analisis profundo de requisitos (funcionales, visuales, seguridad, usabilidad;
   identificar puntos de falla; decidir arquitectura solida y realista).
2. Diseno de arquitectura y backend (tablas/colecciones, reglas de seguridad, auth
   admin, flujo de datos; elegir backend y justificar internamente).
3. Diseno de frontend y componentes (estructura, flujo, panel admin, ticker,
   cuadricula de numeros, seccion Akira; estilo hand-drawn en todo lo importante).
4. Implementacion completa del codigo (config del proyecto, componentes, logica admin,
   conexion backend, estilos, animaciones; nada a medias).
5. Instrucciones de configuracion y deployment (crear/configurar backend, variables de
   entorno, deploy en Vercel o plataforma adecuada, primer acceso al panel admin).
6. Revision interna exhaustiva como auditor estricto (placeholders/codigo incompleto,
   fallos de seguridad, errores de logica, cosas que no funcionarian en produccion,
   instrucciones ambiguas). Corregir todo lo hallado antes de responder.

## Formato de la unica respuesta permitida

Al terminar los 6 pasos internos, responder UNICAMENTE con:

1. Codigo completo y organizado (listo para copiar).
2. Instrucciones exactas de configuracion y deployment.
3. Notas criticas necesarias para que la app funcione de verdad.

Sin introducciones, sin explicar lo que se hizo, sin mostrar los pasos. Solo el
resultado final usable.

## Datos fijos (usar textualmente)

- Nombre de la rifa: Juntos por Akira
- Numeros: 1 a 300, precio ₡1.000 c/u
- Premio: ₡50.000. El sorteo se hace cuando los 300 numeros esten vendidos.
- Sinpe / WhatsApp: 506 8556 9584
- Titular: Sean Alexander Vargas Romero
- Motivo del Sinpe: el numero que se compra

## Decisiones tras feedback del usuario (2026-08-01)

- Panel admin OCULTO: no hay boton visible. Solo aparece con ruta secreta en el
  hash: `#/panel-akira-8f3k29` (constante `ADMIN_SECRET_PATH` en src/lib/supabase.ts).
  Aunque conozcan la ruta, RLS + login lo protegen. El usuario cambia esa ruta.
- Sonidos pop cute via Web Audio API (src/lib/sfx.ts, sin archivos): playPop (hover),
  playSuccess (vender), playUndo (liberar). Toggle de mute fijo abajo a la derecha,
  persiste en localStorage. Respeta prefers-reduced-motion.
- Mas movimiento: heartbeat header, cell-pop escalonado, stamp al vender, hover wobble,
  estrella del premio girando, barra de progreso con rayas animadas.
- Banner de premio (PrizeBanner) con barra de progreso de vendidos.
- Fotos: se suben desde panel admin > Editar seccion Akira. Recomendado ~1000x1000px,
  JPG/PNG <2MB, se recortan a cuadrado con object-fit cover.

## Rediseno del banner de premio (2026-08-01, feedback: "no pertenece ahi")

Banner rehecho como CARTEL HANDMADE tipo tiza sobre pizarra/papel (PrizeBanner.tsx):
- Fondo pizarra (gradiente morado oscuro) + grano de tiza (SVG feTurbulence data-URI
  embebido en ::before, opacity ~0.09, mix-blend screen). Marco interior de tiza
  punteado con filtro rough. Bunting (guirnalda) colgada arriba.
- Mezcla de fuentes handmade (Google Fonts, todas verificadas 200): Amatic SC (titulo
  chalk-sign), Caveat (el monto grande), Patrick Hand (texto). Body sigue en Nunito.
- rough-notation (react-friendly, instalado): circulo dibujado a mano alrededor del
  monto, subrayado en "Gana". Wrapper propio en components/Annotate.tsx.
- Doodles SVG inline hechos a mano en components/Doodles.tsx: Sparkle, Star, Heart,
  Leaf, Bunting. Dispersos con filtro rough y floaty.
- Texturas: components/TextureDefs.tsx monta filtros SVG #akira-rough (borde
  tembloroso, baseFrequency 0.018/0.026 scale 4) y #akira-chalk (grano + blur).
  REGLA CLAVE: filter:url(#akira-rough) SOLO en marcos/doodles decorativos, NUNCA en
  texto de parrafo (borronea y mata legibilidad; lo advirtio la investigacion).
- Sonidos siguen en sfx.ts. Investigacion de tecnicas guardada; libs verificadas en
  npm: rough-notation, react-rough-notation, wired-elements, textures, svg-textures,
  simplex-noise, seedrandom, canvas-sketch, rough-viz (con guion).

## Ticker full-bleed + fondo con critters + cuadros scrapbook (2026-08-01)

- Ticker (Ticker.tsx): banda verde de borde a borde (width:100vw, margin-left:-50vw).
  Se movio FUERA de .container en App. Arranque aleatorio via animation-delay negativo
  (Math.random, ok en runtime de navegador). Fade en bordes izq/der. Doodles inline.
  ANTI-HUECOS: mide el ancho de una copia con un track .ticker-measure oculto
  (ResizeObserver + resize), repite la lista `half*2` veces (par, para bucle -50%
  sin costura) hasta superar el viewport, y ajusta duracion a velocidad constante
  (SPEED 70px/s). Asi nunca se ven espacios blancos aunque haya pocos nombres.
- Fondo (CatBackground.tsx + Critters.tsx): 15 motivos line-art variados (gato curled,
  gato sentado, bolita de lana, esqueleto de pez, pez, huella, raton, mariposa, flor,
  hoja, taza, hongo, abeja, estrella, corazon) en viewBox 0 0 100 100. Tres capas de
  profundidad (far/mid/near) con blur+opacidad decrecientes. Wrappers anidados
  float>bob>sway, cada uno con su duracion/delay para desincronizar. .bg-glow = luz
  calida radial. Movimiento lento y tenue (opacidad 0.10-0.17). Solo transform/opacity.
- Cuadros (.paper): grano de papel (2 radial-gradients desfasados), inclinacion
  handmade alternada (nth-of-type odd/even, se endereza en hover), washi tape arriba
  (prop washi en SketchBox, translucida, color rota por cuadro). Entrada = fade-in
  (antes rise, que pisaba el tilt). Investigacion de tecnicas verificada guardada.
- Tecnicas de reserva no usadas aun: torn/deckled edge (SVG displacement mask),
  scalloped/perforated edge (radial-gradient mask), photo mount corners, dog-ear,
  raffle-ticket perforado, polaroid de Akira, trail de huellas. Todas pure CSS/SVG.

## Outline imperfecto en todos los cuadros (2026-08-01)

Al usuario le gusto el marco "imperfecto pero lindo" del premio. Se aplico a TODOS
los .paper via .paper::after: borde 2px dashed var(--ink-soft), inset 10px, radius 10px,
opacity 0.55, filter:url(#akira-rough) para el temblor de tiza. Combina con el borde
exterior de rough.js (SketchBox). Mantiene la paleta pastel. NO se aplica a cuadros
anidados pequenos (stats, pay-row) para no saturar. Causa: caridad para operar a la
gata (le remueven todos los dientes).

## Reglas de estilo de escritura (recordatorio)

- Cero emojis. Sin em-dashes ni guiones largos. Espanol, tono calido.

## Seguimiento, sorteo, donaciones y dueno del numero (2026-08-02)

Se implementaron en la app real (ya no son machotes HTML). El machote
public/donaciones.html se borro porque su contenido paso a codigo.

### Base de datos (supabase/schema.sql, idempotente)
- raffle_numbers gana columna `buyer_phone text` (alter table add column if not
  exists) + indice. Agrupa los numeros de una misma persona.
- Tabla nueva `donations` (id uuid, donor_name, amount integer > 0, message,
  created_at). RLS: select publico; insert/update/delete solo con is_admin().
  Agregada a la publicacion supabase_realtime.
- supabase/seed-compradores.sql carga los 34 numeros de 13 personas, sus
  mensajes de ticker y las 2 donaciones. Idempotente (where not exists).
  Los telefonos quedan en null hasta que la persona escriba.

### Lista final de compradores (resuelta con el usuario)
Amanda 5 | Jeremy Andrey Villa 3,28 | Jessica Vanessa Arias 9,26 |
Katherine Valeria 30,146,177,260 (cambio el 7 por el 177) | Luis Vasquez 15,99 |
Meiling 206 | Miranda Villalobos 8,84 | Montero 56,57,59,65,67 |
Nazaret Godinez 25,77,89,197,222 | Ramirez Barrantes M 7,19 |
Rowdy 95,111,178,282 | Tania 4,22,27 | Victor 20,21,23 (el 19 quedo para
Ramirez Barrantes M, a Victor se le asigno el 23).
Donaciones: Angelo David Blando 5000 "con mucho amor";
Nunez Bosa Juan 2000 "para Akira de Felix".

### Dueno del numero al pasar el mouse
NumberCell.tsx: los vendidos con nombre muestran un globo .cell-owner arriba
("DUENO" en mayusculas chicas + nombre). Sutil, con flecha, sin robar clics.
La celda deja de estar `disabled` para el publico (aria-disabled en su lugar):
un boton disabled no entrega hover en varios navegadores y el globo no saldria.
Se quita el title nativo cuando hay globo para no duplicar el dato.
.cell.sold:hover sube z-index a 5 para que las celdas siguientes no lo tapen.

### Panel de seguimiento (TrackingPanel.tsx, solo admin)
Se abre desde la barra de admin con "Registrar compras". Dos pestanas:
- Registrar: telefono + nombre + numeros ("25, 77, 89"). Si el telefono ya
  existe, detecta a la persona y los numeros nuevos se AGREGAN a los que tenia.
  Chips verdes/rosados marcan validos vs ya vendidos a otro (esos no se toman).
  Vista previa del agradecimiento y check para mandarlo al ticker sin duplicar.
- Tabla: hoja de calculo con buscador por nombre, telefono o numero, resumen de
  totales, boton "Copiar tabla" (TSV al portapapeles, pegable en Sheets/Excel) y
  cada numero es un boton que lo libera.
Helpers en src/lib/buyers.ts: normalizePhone, formatPhone, groupBuyers,
findBuyerByPhone, buildThanks, parseNumberList.

### Mensajes de agradecimiento
THANKS_TEMPLATES en supabase.ts, las 3 que pidio el usuario:
"Gracias {nombre} por tu granito de arena", "Gracias por el apoyo {nombre}",
"Gracias de corazon {nombre}". THANKS_EMOJIS = manos y corazones. Excepcion
consciente a la regla de cero emojis: el usuario los pidio explicitamente.
buildThanks() elige plantilla y emoji por hash del nombre, no al azar, para que
la vista previa y lo guardado coincidan.

### Carril de la suerte (ReelDraw.tsx)
Sorteo A. Los 300 numeros en orden aleatorio (Fisher-Yates), cada tarjeta con su
numero y el nombre del dueno si esta vendido.
- En reposo: animacion CSS pura sobre DOS copias identicas de la tira,
  translate3d(0) a translate3d(-50%). Sin costura, sin huecos, sin JS por frame.
  Arranque en punto aleatorio via animation-delay negativo. Pausa en hover.
  IMPORTANTE: el separador va como margin-right de .reel-card, no como gap, para
  que el ancho de una copia sea exactamente cantidad*(96+12) y calce con
  CARD_W/GAP en el TSX. No cambiar el ancho de tarjeta en el media query.
- El boton "Escoger ganador" SOLO aparece con sesion de admin. El publico
  unicamente ve el carril moverse (lo pidio asi el usuario).
- Al girar: tira guiada con SPIN_LEAD=46 tarjetas antes de la ganadora y
  SPIN_TAIL=12 despues, para que la ganadora nunca quede sin nada a la derecha.
  cubic-bezier de desaceleracion, 5.2s, confeti CSS y playSuccess al terminar.

### Muro de donaciones (DonationsWall.tsx)
Version elegida: Muro A1, papelitos con washi tape girados a mano. Papelitos de
4 colores alternados con rotaciones distintas (nth-child 4n), se enderezan en
hover, cinta washi translucida arriba con extremos deshilachados (mask), huella
de gato tenue en la esquina y corazon abajo a la derecha. Encabezado con el total
en colones y el conteo de personas. El admin agrega y quita desde el mismo
cuadro. Si no hay donaciones y no hay sesion, la seccion no se renderiza.
Doodles.tsx gana el componente Paw (huella en trazo de lapiz).
