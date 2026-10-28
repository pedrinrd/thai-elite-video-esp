import type { BonusItem } from '../types';

export interface BonusChapter {
  chapterNumber: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  bulletPoints: string[];
  proTip: string;
}

export interface SpanishBonusManual {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  edition: string;
  author: string;
  estimatedReadTime: string;
  pageCount: number;
  introduction: string;
  chapters: BonusChapter[];
  finalChecklist: string[];
}

const MANUALS_BY_ID: Record<string, SpanishBonusManual> = {
  'bono-01': {
    id: 'bono-01',
    code: 'BONO 01',
    title: '20 COMBINACIONES DE ATAQUE PROFESIONALES',
    subtitle: 'Manual Táctico de Encadenamientos Ofensivos: Boxeo, Codos, Rodillas y Low Kicks',
    edition: 'Edición Oficial en Español · Thai Elite México',
    author: 'Cuerpo Técnico Thai Elite México',
    estimatedReadTime: '25 min de lectura práctica',
    pageCount: 5,
    introduction:
      'En el Muay Thai de alto nivel, un golpe aislado rara vez supera una guardia bien estructurada. El secreto de los peleadores tailandeses y campeones internacionales radica en el encadenamiento fluido de las 8 armas: abrir la guardia arriba con puños y codos para castigar abajo con low kicks, o fintar al cuerpo con teep para conectar rodillas y codos en corta distancia.',
    chapters: [
      {
        chapterNumber: 'CAPÍTULO 01',
        title: 'Principios del Encadenamiento Ofensivo Tailandés',
        subtitle: 'Ritmo, Alternancia de Niveles y Transferencia de Peso',
        paragraphs: [
          'Toda combinación efectiva en Muay Thai respeta el principio de carga de cadera: cada golpe de mano prepara la rotación para el siguiente impacto de pierna, rodilla o codo. Nunca lances golpes con los brazos desconectados del tronco.',
          'Alterna siempre entre niveles (Cabeza - Cuerpo - Piernas) y entre hemisferios (Izquierda - Derecha - Izquierda) para obligar a tu oponente a desplazar su peso en la dirección equivocada antes del golpe final de potencia.',
        ],
        bulletPoints: [
          'Regla 1 (Nivel Alto a Nivel Bajo): Usa el Jab y el Cross al rostro para elevar los guantes del rival y descarga el Low Kick a plena potencia sobre el muslo externo.',
          'Regla 2 (Hemisferios Cruzados): Después de un Hook izquierdo o Cross derecho, tu cadera opuesta ya está cargada para disparar rodilla o patada circular.',
          'Regla 3 (Retorno a Guardia): El último golpe de cada combinación debe ir seguido de un paso de salida en ángulo o un bloqueo preventivo de tibia (Check).',
        ],
        proTip:
          'CONSEJO DE RING: Exhala con un sonido corto ("Shhh" o "Oweee") en cada impacto para contraer el abdomen y proteger tus costillas ante cualquier contraataque.',
      },
      {
        chapterNumber: 'CAPÍTULO 02',
        title: 'Combinaciones 01 a 10: Boxeo Tailandés + Patadas Bajas y Medias',
        subtitle: 'Secuencias Fundamentales de Media y Larga Distancia',
        paragraphs: [
          'Estas diez primeras secuencias construyen la base del estilo Dutch-Thai moderno: volumen de manos precisas rematadas con patadas devastadoras de tibia.',
        ],
        bulletPoints: [
          'Combo 01: Jab izquierdo + Cross derecho + Hook izquierdo al mentón + Low Kick derecho externo al muslo.',
          'Combo 02: Jab doble avanzando + Low Kick interno izquierdo + Cross derecho al rostro + Patada Media izquierda (Switch Kick).',
          'Combo 03: Cross derecho directo + Hook izquierdo al hígado + Cross derecho arriba + Low Kick izquierdo en cambio de guardia.',
          'Combo 04: Teep frontal izquierdo al abdomen + Finta de Teep (paso adelante) + Cross derecho + Hook izquierdo + Patada Alta derecha.',
          'Combo 05: Jab al rostro + Cross al cuerpo + Hook izquierdo arriba + Patada Circular derecha a las costillas.',
          'Combo 06: Esquiva lateral izquierda + Cross derecho de poder + Uppercut izquierdo + Low Kick derecho.',
          'Combo 07: Jab + Low Kick derecho rápido + Jab + Cross + Patada Izquierda en Switch al cuerpo.',
          'Combo 08: Parada de mano derecha (Parry) + Jab + Cross + Hook izquierdo + Doble Patada Derecha (pierna y costillas).',
          'Combo 09: Uppercut derecho + Hook izquierdo + Cross derecho + Barrido al pie de apoyo con tibia izquierda.',
          'Combo 10: Finta de Jab + Low Kick interno izquierdo + Cross derecho + Hook izquierdo + Rodilla derecha recta.',
        ],
        proTip:
          'CONSEJO DE ENTRENAMIENTO: Practica cada combinación durante 3 minutos continuos en sombra frente al espejo antes de pasar al costal pesado.',
      },
      {
        chapterNumber: 'CAPÍTULO 03',
        title: 'Combinaciones 11 a 20: Rodillas, Codos (Sok) y Clinch',
        subtitle: 'Armas Letales de Corta Distancia y Contraataque',
        paragraphs: [
          'Cuando la distancia se cierra, los codos (Sok) y las rodillas (Khao) definen el combate. Estas diez combinaciones integran entradas seguras, bloqueos de tibia y remates contundentes.',
        ],
        bulletPoints: [
          'Combo 11: Jab + Cross + Paso adentro con Codo Diagonal derecho (Sok Ti) + Rodilla izquierda en Clinch.',
          'Combo 12: Bloqueo de tibia derecha (Check) + Cross derecho inmediato + Hook izquierdo + Patada Media derecha.',
          'Combo 13: Jab + Finta de Cross + Codo Ascendente izquierdo (Sok Ngad) + Codo Horizontal derecho + Salida con Teep.',
          'Combo 14: Captura de patada media + Cross derecho al mentón + Barrido de tibia sobre la pierna de apoyo del rival.',
          'Combo 15: Guardia Larga (Long Guard) para frenar avance + Rodilla derecha recta + Codo derecho descendente + Hook izquierdo.',
          'Combo 16: Jab + Cross + Hook izquierdo + Codo Giratorio derecho (Sokกลับ / Spinning Back Elbow).',
          'Combo 17: Entrada en Clinch de cuello (Plum) + Desequilibrio lateral + Rodilla derecha diagonal a las costillas + Codo corto de salida.',
          'Combo 18: Check izquierdo + Patada izquierda inmediata en devolución + Cross derecho + Rodilla izquierda en salto (Flying Knee).',
          'Combo 19: Desvío de Teep hacia afuera + Low Kick derecho a la pierna trasera + Hook izquierdo + Codo derecho.',
          'Combo 20 (Secuencia Élite de 6 Golpes): Jab + Cross + Hook izquierdo + Rodilla derecha + Codo izquierdo + Low Kick derecho de salida.',
        ],
        proTip:
          'CONSEJO TÉCNICO: En las combinaciones con codo, mantén la mano opuesta pegada a tu sien y el mentón bajo; en corta distancia ambos peleadores están en rango de impacto.',
      },
      {
        chapterNumber: 'CAPÍTULO 04',
        title: 'Metodología de Práctica en 5 Rounds',
        subtitle: 'Estructura Oficial para Integrar las 20 Combinaciones',
        paragraphs: [
          'No intentes memorizar las 20 combinaciones en un solo día. Selecciona 4 combinaciones por sesión (2 de larga distancia y 2 de corta distancia) y trabájalas bajo este esquema de 5 rounds de 3 minutos por 1 minuto de descanso:',
        ],
        bulletPoints: [
          'Round 1 (Sombra Técnica): Ejecuta las 4 combinaciones del día a 50% de velocidad cuidando postura, equilibrio y retorno de guardia.',
          'Round 2 (Velocidad y Fluidez): Aumenta al 80% de velocidad añadiendo fintas y desplazamientos laterales entre cada secuencia.',
          'Round 3 (Costal Pesado - Precisión): Conecta cada golpe con rotación completa de cadera y talón elevado.',
          'Round 4 (Costal Pesado - Potencia en el Último Golpe): Acentúa el golpe final de cada combinación al 100% de potencia.',
          'Round 5 (Round de Combate Libre): Mezcla libremente las 4 combinaciones del día con bloqueos de tibia cada 10 segundos.',
        ],
        proTip:
          'REGISTRO DE PROGRESO: Marca como concluida tu sesión en la plataforma Thai Elite México al finalizar tus 5 rounds.',
      },
    ],
    finalChecklist: [
      'Mantener el mentón bajo y los hombros ligeramente elevados durante toda la combinación.',
      'Girar sobre el metatarso del pie de apoyo en cada patada circular y low kick.',
      'No cruzar los pies al avanzar ni al retroceder después de golpear.',
      'Volver siempre a la guardia tailandesa equilibrada tras el último impacto.',
    ],
  },

  'bono-02': {
    id: 'bono-02',
    code: 'BONO 02',
    title: '50 ENTRENAMIENTOS FÍSICOS PARA MUAY THAI',
    subtitle: 'Acondicionamiento Metabólico, Potencia Explosiva y Resistencia para 5 Rounds',
    edition: 'Edición Oficial en Español · Thai Elite México',
    author: 'Preparación Física Thai Elite México',
    estimatedReadTime: '30 min de lectura práctica',
    pageCount: 5,
    introduction:
      'La técnica sin condición física se desmorona después del segundo round. Este manual reúne las 50 rutinas de acondicionamiento físico utilizadas en los campamentos de Muay Thai adaptadas para que puedas ejecutarlas en gimnasio o en casa con peso corporal, cuerda y costal.',
    chapters: [
      {
        chapterNumber: 'CAPÍTULO 01',
        title: 'Bloque 1: 15 Rutinas de Cardio Tailandés y Cuerda',
        subtitle: 'Base Aeróbica y Ritmo de Pies inagotable',
        paragraphs: [
          'En Tailandia todo entrenamiento inicia con carrera y cuerda pesada. Estas 15 rutinas desarrollan la resistencia cardiovascular específica para mantener el ritmo de rebote durante 5 rounds.',
        ],
        bulletPoints: [
          'Entrenamiento 01-03 (Cuerda Tailandesa 3x3 min): 3 rounds de cuerda alternando paso básico, rodillas altas cada 30 segundos y sprints finales.',
          'Entrenamiento 04-06 (Intervalos de Sombra Explosiva): 5 rounds de 3 minutos (40 seg ritmo medio + 20 seg máxima velocidad de puños y rodillas).',
          'Entrenamiento 07-09 (Sprints de Ring 30/15): 10 series de 30 segundos de sprint o burpees técnicos por 15 segundos de guardia activa.',
          'Entrenamiento 10-12 (Piramidal de Rodillas al Aire): De 10 a 50 rodillas alternas en el sitio manteniendo las manos en guardia alta.',
          'Entrenamiento 13-15 (Resistencia de Campeón 5x5): 5 rounds de 5 minutos combinando 2 min de cuerda + 2 min de sombra + 1 min de desplazamientos.',
        ],
        proTip:
          'CONSEJO FÍSICO: Salta la cuerda apoyando únicamente los metatarsos y girando la cuerda desde las muñecas, nunca desde los hombros.',
      },
      {
        chapterNumber: 'CAPÍTULO 02',
        title: 'Bloque 2: 15 Circuitos de Potencia Explosiva en Piernas y Cadera',
        subtitle: 'Velocidad de Disparo y Fuerza de Impacto en Patadas',
        paragraphs: [
          'La potencia de un Low Kick o una patada media nace en los glúteos, isquiotibiales y rotación explosiva de cadera. Estos 15 circuitos multiplican tu pegada.',
        ],
        bulletPoints: [
          'Entrenamiento 16-18 (Pirámide de Patadas 1 a 10): En costal o al aire, lanza 1 patada derecha, 1 izquierda, 2 derechas, 2 izquierdas hasta llegar a 10 y baja a 1.',
          'Entrenamiento 19-21 (Sentadillas Explosivas + Teep): 4 series de 15 sentadillas con salto seguidas inmediatamente de 10 Teeps frontales por pierna.',
          'Entrenamiento 22-24 (100 Patadas por Pierna Cronometradas): Completa 50 patadas seguidas con pierna derecha y 50 con izquierda en el menor tiempo posible sin perder técnica.',
          'Entrenamiento 25-27 (Desplantes Pliométricos + Switch Kick): 4 series de 12 cambios de guardia explosivos rematando con patada izquierda.',
          'Entrenamiento 28-30 (Bloqueo y Disparo): 3 rounds de 3 minutos realizando Check de tibia con cada pierna y disparando patada inmediata sin apoyar el pie atrás.',
        ],
        proTip:
          'CONSEJO DE POTENCIA: No empujes el costal con la pierna; imagina que tu tibia atraviesa el objetivo como un bate de béisbol.',
      },
      {
        chapterNumber: 'CAPÍTULO 03',
        title: 'Bloque 3: 10 Rutinas de Tren Superior, Hombros y Guardia',
        subtitle: 'Resistencia Muscular para No Bajar las Manos Jamás',
        paragraphs: [
          'Los hombros fatigados son la causa número uno de nocauts por patada alta o codo. Estas 10 rutinas blindan tus deltoides, tríceps y espalda alta.',
        ],
        bulletPoints: [
          'Entrenamiento 31-33 (Lagartijas Tailandesas en Serie): 5 series de 20 lagartijas explosivas + 30 segundos de golpes rectos continuos al aire.',
          'Entrenamiento 34-36 (Isometría de Guardia Alta + Sombra): Mantén dos botellas de agua o mancuernas ligeras a la altura de los pómulos durante 3 rounds de 2 minutos.',
          'Entrenamiento 37-38 (Burnout de 200 Puños por Round): En costal o sombra, lanza series continuas de 50 Jabs/Cross a velocidad máxima por 10 seg de guardia.',
          'Entrenamiento 39-40 (Fortalecimiento de Clinch y Tracción): Dominadas o remos isométricos combinados con 40 rodillas rectas al finalizar cada serie.',
        ],
        proTip:
          'CONSEJO DE GUARDIA: Cuando sientas ardor en los hombros en el último minuto del round, pega los codos a las costillas y sube los nudillos a las cejas.',
      },
      {
        chapterNumber: 'CAPÍTULO 04',
        title: 'Bloque 4: 10 Rutinas de Core Rotacional, Cuello y Abdomen de Acero',
        subtitle: 'Absorción de Impactos al Cuerpo y Estabilidad en Clinch',
        paragraphs: [
          'Un abdomen fuerte protege el hígado y el plexo solar ante rodillas y patadas medias, además de transmitir toda la fuerza rotacional en tus golpes.',
        ],
        bulletPoints: [
          'Entrenamiento 41-43 (Abdominales Muay Thai Sit-Ups): 4 series de 25 abdominales completos lanzando Jab-Cross en la parte alta del movimiento.',
          'Entrenamiento 44-46 (Giros Rusos de Potencia y Plancha Dinámica): 4 rondas de 45 segundos de giros rotacionales + 45 segundos de plancha con rodillas al codo.',
          'Entrenamiento 47-48 (Fortalecimiento Cervical de 4 Direcciones): 3 series de 20 repeticiones controladas (flexión frontal, extensión y laterales sin peso brusco).',
          'Entrenamiento 49-50 (Circuito Final de Campamento Tailandés): 200 rodillas en clinch + 100 abdominales + 50 lagartijas + 3 minutos de sombra técnica.',
        ],
        proTip:
          'CONSEJO DE SEGURIDAD: Realiza el trabajo de cuello siempre con movimientos lentos y controlados, sin rebotes bruscos.',
      },
    ],
    finalChecklist: [
      'Realizar 8 a 10 minutos de calentamiento articular antes de cualquier circuito explosivo.',
      'Hidratarse con pequeños sorbos de agua o electrolitos entre cada round de descanso.',
      'Priorizar la postura técnica sobre la velocidad cuando aparezca la fatiga.',
      'Alternar días de acondicionamiento intenso con días de técnica y movilidad.',
    ],
  },

  'bono-03': {
    id: 'bono-03',
    code: 'BONO 03',
    title: '50 TÉCNICAS DE DEFENSA Y CONTRAATAQUE',
    subtitle: 'Guía Táctica de Bloqueos de Tibia, Barridos, Capturas y Respuestas Inmediatas',
    edition: 'Edición Oficial en Español · Thai Elite México',
    author: 'Cuerpo Técnico Thai Elite México',
    estimatedReadTime: '28 min de lectura práctica',
    pageCount: 5,
    introduction:
      'En el Muay Thai tradicional, una defensa exitosa que no va seguida de un contraataque inmediato es solo la mitad del trabajo. Cuando bloqueas una patada o desvías un golpe, tu rival queda momentáneamente en un solo pie o fuera de balance: esa fracción de segundo es tu ventana de oro para puntuar con contundencia.',
    chapters: [
      {
        chapterNumber: 'CAPÍTULO 01',
        title: 'Sección A: Defensa contra Boxeadores y Guardia Larga (Long Guard)',
        subtitle: 'Paradas de Mano, Escudos de Codo y Control de Distancia',
        paragraphs: [
          'Frente a un oponente que presiona con combinaciones rápidas de boxeo, la defensa de Muay Thai utiliza escudos óseos (frente, antebrazos y codos) y control de distancia con el brazo adelantado.',
        ],
        bulletPoints: [
          'Técnicas 01-05 (Parada de Jab y Devolución Instantánea): Desvía el Jab rival con la palma derecha hacia abajo (Parry) y dispara tu propio Jab o Cross en el mismo tiempo.',
          'Técnicas 06-10 (Guardia Larga / Dracula Guard): Extiende el brazo izquierdo hacia el hombro/rostro del rival ocultando tu mentón detrás del hombro y conecta rodilla derecha al abdomen.',
          'Técnicas 11-14 (Escudo de Casco y Codo Corto): Cierra el guante en la nuca absorbiendo el Hook con el antebrazo y responde con codo horizontal al soltar el impacto.',
        ],
        proTip:
          'CONSEJO DEFENSIVO: Nunca cierres los ojos al bloquear; mira siempre el centro del pecho y los hombros de tu oponente para anticipar cualquier golpe.',
      },
      {
        chapterNumber: 'CAPÍTULO 02',
        title: 'Sección B: El Arte del Bloqueo de Tibia (Check) y Contraataque',
        subtitle: 'Neutralización de Low Kicks y Patadas Medias',
        paragraphs: [
          'El bloqueo de tibia (Check) es el pilar defensivo del Muay Thai. Un Check bien angulado a 45 grados con la parte superior de tu tibia no solo anula el ataque, sino que lastima el empeine o tibia baja del agresor.',
        ],
        bulletPoints: [
          'Técnicas 15-20 (Check Clásico a 45 Grados): Eleva la rodilla por fuera hacia tu codo manteniendo el pie en dorsiflexión o firme, sin girar la espalda.',
          'Técnicas 21-25 (Check y Devolución sin Pisar): Bloquea con tibia izquierda y, antes de que tu pie toque la lona, conviértelo en Switch Kick o Teep frontal.',
          'Técnicas 26-30 (Check + Cross + Low Kick Cruzado): Bloquea con pierna adelantada, apoya el pie pisando fuerte hacia adelante con Cross derecho y remata con Low Kick.',
        ],
        proTip:
          'DETALLE CLAVE: Al elevar la pierna para hacer Check, tu rodilla debe unirse al interior o exterior de tu codo del mismo lado para no dejar hueco hacia las costillas.',
      },
      {
        chapterNumber: 'CAPÍTULO 03',
        title: 'Sección C: Capturas de Patada, Desvíos de Teep y Barridos',
        subtitle: 'Cómo Desequilibrar al Oponente y Dominar el Ring',
        paragraphs: [
          'Capturar una patada media o desviar un Teep rompe el ritmo mental y físico del adversario. La clave es dar un pequeño paso lateral para amortiguar el impacto mientras aseguras el talón.',
        ],
        bulletPoints: [
          'Técnicas 31-35 (Captura de Patada Media con Paso Lateral): Desplázate medio paso en la dirección de la patada, atrapa el talón contra tu costilla con el antebrazo y lanza Cross al mentón.',
          'Técnicas 36-40 (Captura y Barrido al Pie de Apoyo): Una vez asegurada la pierna del rival, da un paso profundo hacia él y barre su tobillo de apoyo con el interior de tu tibia.',
          'Técnicas 41-45 (Desvío de Teep hacia Afuera): Usa un movimiento semicircular de antebrazo hacia afuera para girar la espalda del rival y castiga su pierna o costillas expuestas.',
        ],
        proTip:
          'ADVERTENCIA TÉCNICA: Nunca bajes la mano para intentar atrapar una patada si no estás seguro de que va al torso; muchos peleadores fintan abajo para patear a la cabeza.',
      },
      {
        chapterNumber: 'CAPÍTULO 04',
        title: 'Sección D: Salidas en las Cuerdas y Defensa en Clinch',
        subtitle: 'Escapes de Ángulo y Contras de Rodilla',
        paragraphs: [
          'Estar contra las cuerdas o dentro del Clinch no significa ser un blanco estático. Estas 5 técnicas finales te permiten girar la posición a tu favor.',
        ],
        bulletPoints: [
          'Técnicas 46-48 (Pivote sobre Pie Adelantado en Cuerdas): Bloquea el primer golpe, clava el metatarso izquierdo y gira 90 grados dejando al rival contra las cuerdas.',
          'Técnicas 49-50 (Marco de Antebrazo en Clinch / Cross-Face): Coloca tu antebrazo horizontal frente a la clavícula/cuello del rival para crear espacio, rompe su agarre y conecta rodilla o codo.',
        ],
        proTip:
          'REGLA DE ORO EN LAS CUERDAS: Nunca te quedes parado más de 2 segundos frente a tu rival; sal en ángulo de 45 grados hacia el lado de su mano atrasada.',
      },
    ],
    finalChecklist: [
      'Mantener el peso distribuido 45% adelante y 55% atrás para levantar la pierna delantera al instante.',
      'Unir siempre codo y rodilla al ejecutar el bloqueo de tibia (Check).',
      'Responder con al menos un golpe o patada dentro del primer segundo posterior a cada defensa.',
      'Salir en ángulo lateral después de defender una serie de 3 o más golpes.',
    ],
  },

  'bono-04': {
    id: 'bono-04',
    code: 'BONO 04',
    title: 'GUÍA DE FUNDAMENTOS DEL MUAY THAI',
    subtitle: 'Compendio Esencial: Vendaje Profesional, Nomenclatura Tailandesa, Guardia y Ritmo',
    edition: 'Edición Oficial en Español · Thai Elite México (Incluido en Todos los Planes)',
    author: 'Academia Oficial Thai Elite México',
    estimatedReadTime: '22 min de lectura práctica',
    pageCount: 5,
    introduction:
      'El Muay Thai, conocido como "El Arte de las Ocho Extremidades", tiene siglos de evolución técnica. Dominar desde el primer día cómo vendar tus manos correctamente, cómo pararte en equilibrio perfecto y cómo respirar en cada impacto acelerará tu progreso y protegerá tus articulaciones durante toda tu vida deportiva.',
    chapters: [
      {
        chapterNumber: 'CAPÍTULO 01',
        title: 'Vendaje Tailandés Profesional Paso a Paso',
        subtitle: 'Protección de Nudillos, Metacarpos, Pulgar y Muñeca (Vendas de 4.5m o 5m)',
        paragraphs: [
          'A diferencia del vendaje de boxeo occidental, el vendaje estilo tailandés crea una almohadilla firme sobre los nudillos mientras mantiene la palma semi-abierta para facilitar el agarre en el Clinch y las capturas de patada.',
        ],
        bulletPoints: [
          'Paso 1 (Almohadilla de Nudillos): Abre los dedos y da 4 a 5 vueltas doblando la venda sobre los nudillos para crear un cojín protector.',
          'Paso 2 (Fijación y Muñeca): Sujeta la almohadilla sobre tus nudillos, da 2 vueltas para fijarla y baja en diagonal hacia la muñeca dando 3 vueltas firmes.',
          'Paso 3 (Asegurado del Pulgar): Rodea el pulgar una vez de afuera hacia adentro y regresa a la muñeca para estabilizar la articulación.',
          'Paso 4 (Refuerzo Interdigital en X): Pasa la venda entre los dedos meñique-anular, anular-medio y medio-índice formando cruces sobre el dorso de la mano sin cubrir la palma.',
          'Paso 5 (Cierre en X en Muñeca): Termina con cruces diagonales entre dorso y muñeca y asegura el velcro con tensión firme pero sin cortar la circulación.',
        ],
        proTip:
          'PRUEBA DEL VENDAJE: Al abrir la mano tus dedos deben sentirse cómodos; al cerrar el puño la venda debe compactarse como un bloque sólido.',
      },
      {
        chapterNumber: 'CAPÍTULO 02',
        title: 'Postura de Combate, Guardia Tradicional y Equilibrio',
        subtitle: 'La Base Inquebrantable del Nak Muay',
        paragraphs: [
          'La postura de Muay Thai es más frontal que la del boxeo clásico porque debes estar listo para bloquear patadas con ambas piernas y defender Teeps al abdomen en cualquier instante.',
        ],
        bulletPoints: [
          'Separación de Pies: Al ancho de los hombros, con el pie adelantado apuntando hacia el rival y el pie atrasado a 45 grados con el talón ligeramente elevado.',
          'Posición de Manos: Nudillos a la altura de las cejas/sienes, palmas orientadas ligeramente hacia el frente o a 45 grados listas para desviar o atrapar.',
          'Codos y Costillas: Codos apuntando hacia abajo protegiendo el hígado y las costillas flotantes, nunca abiertos hacia los lados.',
          'Ritmo Tailandés (Marcha): Transfiere suavemente el peso entre el pie delantero y trasero manteniendo la pierna adelantada ligera para hacer Check o Teep.',
        ],
        proTip:
          'AUTOEVALUACIÓN: En cualquier momento de tu sombra, detente en seco; si no puedes levantar cualquiera de tus dos piernas sin tambalearte, tus pies están demasiado juntos o cruzados.',
      },
      {
        chapterNumber: 'CAPÍTULO 03',
        title: 'Las 8 Armas y Nomenclatura Tradicional Tailandesa',
        subtitle: 'Vocabulario Esencial para tus Entrenamientos en Thai Elite México',
        paragraphs: [
          'Conocer los nombres tradicionales te permitirá seguir las indicaciones técnicas de cada módulo con total claridad:',
        ],
        bulletPoints: [
          'Chok (Puños): Mat Wiang San (Hook), Mat Trong (Directo/Cross), Matเสย / Mat Soi (Uppercut).',
          'Tei (Patadas): Teep (Patada frontal de empuje), Tei Tat (Low Kick circular), Tei Klang (Patada media al torso), Tei Kan Kro (Patada alta al cuello/cabeza).',
          'Khao (Rodillas): Khao Trong (Rodilla recta), Khao Tii (Rodilla diagonal en clinch), Khao Loi (Rodilla voladora en salto).',
          'Sok (Codos): Sok Ti (Codo diagonal descendente), Sok Tat (Codo horizontal), Sok Ngad (Codo ascendente), Sok Klap (Codo giratorio).',
          'Plum (Clinch Tailandés): Lucha cuerpo a cuerpo de pie controlando cuello, bíceps y postura para conectar rodillas y codos.',
        ],
        proTip:
          'RECUERDA: En Muay Thai se patea con el tercio inferior y medio de la tibia, nunca con el empeine del pie.',
      },
      {
        chapterNumber: 'CAPÍTULO 04',
        title: 'Control de la Respiración y Estructura de Entrenamiento',
        subtitle: 'Cómo Sacar el Máximo Provecho a los 500+ Videos de la Plataforma',
        paragraphs: [
          'La respiración marca la diferencia entre agotarte en 2 minutos o entrenar 60 minutos con energía constante. Inhala siempre por la nariz mientras te desplazas y exhala de golpe por la boca en cada impacto o bloqueo.',
        ],
        bulletPoints: [
          'Fase 1 (Calentamiento - 10 min): Movilidad articular, cuerda o trote ligero y 2 rounds de sombra suave.',
          'Fase 2 (Estudio Técnico - 20 min): Abre el módulo correspondiente en Thai Elite México, observa la clase y practica la técnica frente al espejo.',
          'Fase 3 (Aplicación Práctica - 20 min): Ejecuta de 3 a 5 rounds aplicando la lección del día en sombra intensa o costal.',
          'Fase 4 (Enfriamiento y Registro - 5 min): Estiramientos de cadera y marca tu clase como "Concluida" en la plataforma.',
        ],
        proTip:
          'CONSTANCIA ÉLITE: Es mucho más efectivo entrenar 35 minutos bien enfocado 4 veces por semana que hacer una sola sesión agotadora al mes.',
      },
    ],
    finalChecklist: [
      'Vendar siempre las manos antes de golpear el costal o hacer sparring.',
      'Mantener los pies al ancho de los hombros sin cruzar la línea central.',
      'Golpear con la tibia en patadas circulares y con el metatarso/talón en el Teep.',
      'Exhalar activamente en cada golpe para oxigenar los músculos y tensar el core.',
    ],
  },

  'bono-05': {
    id: 'bono-05',
    code: 'BONO 05',
    title: 'GUÍA DE RECUPERACIÓN MUSCULAR Y MOVILIDAD',
    subtitle: 'Protocolos de Movilidad de Cadera, Cuidado de Tibias, Hidratación y Descarga',
    edition: 'Edición Oficial en Español · Thai Elite México',
    author: 'Área de Ciencias del Deporte · Thai Elite México',
    estimatedReadTime: '24 min de lectura práctica',
    pageCount: 5,
    introduction:
      'El verdadero crecimiento técnico y físico ocurre cuando tu cuerpo se recupera entre entrenamientos. Este manual te entrega los protocolos exactos para ganar elasticidad en patadas altas, acondicionar y recuperar tus tibias de forma segura, hidratarte correctamente y eliminar la sobrecarga muscular.',
    chapters: [
      {
        chapterNumber: 'CAPÍTULO 01',
        title: 'Protocolo 1: Movilidad de Cadera y Tobillos para Patadas Altas',
        subtitle: 'Rutina Diaria de 10 Minutos Post-Entrenamiento',
        paragraphs: [
          'Para patear a la altura de las costillas o la cabeza sin esfuerzo no necesitas haber nacido flexible; necesitas desbloquear la rotación interna y externa de tus caderas cuando los músculos están calientes al terminar de entrenar.',
        ],
        bulletPoints: [
          'Ejercicio 1 (90/90 de Cadera Dinámico - 2 min): Sentado en el piso con ambas rodillas a 90 grados, rota suavemente de lado a lado manteniendo la espalda erguida.',
          'Ejercicio 2 (Apertura de Rana Controlada - 2 min): Apoya rodillas y antebrazos permitiendo que las caderas cedan con respiraciones profundas de 5 segundos.',
          'Ejercicio 3 (Estiramiento de Psoas y Flexores - 2 min por lado): En desplante profundo, empuja ligeramente la pelvis hacia adelante para liberar la cadera del pie de apoyo.',
          'Ejercicio 4 (Elevaciones Laterales Activas - 2 series de 12): Sujétate de la pared y eleva la pierna en posición de patada circular sosteniendo 2 segundos arriba para ganar fuerza en el rango máximo.',
        ],
        proTip:
          'REGLA DE FLEXIBILIDAD: Nunca hagas estiramientos estáticos largos en frío antes de entrenar; antes de entrenar usa balanceos dinámicos y deja los estiramientos profundos para el final.',
      },
      {
        chapterNumber: 'CAPÍTULO 02',
        title: 'Protocolo 2: Cuidado y Acondicionamiento Seguro de Tibias',
        subtitle: 'Cómo Fortalecer el Hueso y Tratar Hematomas post-impacto',
        paragraphs: [
          'El acondicionamiento de las tibias ocurre de manera progresiva gracias a la ley de Wolff: la repetición constante en el costal pesado y los pads estimula la densidad ósea. Nunca golpees tus tibias con objetos duros como metal o vidrio.',
        ],
        bulletPoints: [
          'Primeras 24 Horas tras Impacto Fuerte: Aplica frío local envuelto en tela durante 12 minutos para controlar la inflamación aguda.',
          'Después de 24-48 Horas (Fase de Reabsorción): Aplica compresas tibias y masaje suave en dirección ascendente con linimento tailandés (Namman Muay) o árnica para disolver pequeños bultos.',
          'Progresión en Costal: Inicia en la parte media-alta del costal (más blanda) y baja gradualmente a la base del costal conforme tus tibias se adapten.',
        ],
        proTip:
          'SEÑAL DE ALERTA: Si sientes un dolor punzante localizado en un punto exacto del hueso al caminar, descansa de patear el costal por 5 a 7 días y enfócate en boxeo, rodillas y sombra.',
      },
      {
        chapterNumber: 'CAPÍTULO 03',
        title: 'Protocolo 3: Hidratación Electrolítica y Nutrición del Peleador',
        subtitle: 'Combustible Antes, Durante y Después de Entrenar',
        paragraphs: [
          'En una sesión intensa de Muay Thai puedes perder entre 1 y 2 litros de sudor ricos en sodio, potasio y magnesio. Reponer solo agua simple sin minerales provoca calambres en pantorrillas y fatiga prematura.',
        ],
        bulletPoints: [
          '90 Minutos Antes de Entrenar: Carbohidratos de absorción media (avena, arroz blanco, plátano o fruta) con una porción ligera de proteína y 500 ml de agua.',
          'Durante la Sesión: Agua con una pizca de sal de mar/electrolitos y medio limón en sorbos pequeños entre rounds.',
          'Ventana Post-Entrenamiento (Primeros 60 min): Proteína de alta calidad (huevo, pollo, pescado o suero de leche) + carbohidratos complejos para recargar el glucógeno muscular.',
          'Suplementación Natural de Apoyo: Magnesio por la noche para relajar la musculatura y Omega-3 para proteger las articulaciones.',
        ],
        proTip:
          'FÓRMULA CASERA DE ELECTROLITOS: 750 ml de agua + jugo de 1 limón + 1/4 de cucharadita de sal marina + 1 cucharadita de miel natural.',
      },
      {
        chapterNumber: 'CAPÍTULO 04',
        title: 'Protocolo 4: Descarga Miofascial y Recuperación Nocturna',
        subtitle: 'Cómo Amanecer Listo para Volver a Entrenar',
        paragraphs: [
          'Dedicar 8 minutos antes de dormir a liberar la tensión acumulada en pantorrillas, glúteos y espalda alta previene contracturas y mejora la calidad del sueño.',
        ],
        bulletPoints: [
          'Liberación Plantar y Pantorrillas (2 min): Rueda una pelota firme bajo la planta del pie y masajea los gemelos sobrecargados por saltar en metatarso.',
          'Descarga de Glúteo Medio y Piriforme (2 min): Libera la zona lateral de la cadera que estabiliza todas tus patadas.',
          'Respiración Diafragmática 4-7-8 (3 min): Inhala en 4 segundos, sostén 7 segundos y exhala en 8 segundos para activar el sistema nervioso parasimpático.',
        ],
        proTip:
          'SUEÑO DE CAMPEÓN: Dormir entre 7.5 y 8.5 horas es el mejor regenerador hormonal y neuromuscular que existe para cualquier artista marcial.',
      },
    ],
    finalChecklist: [
      'Realizar 10 minutos de movilidad de cadera y tobillos al terminar cada entrenamiento.',
      'Reponer agua + electrolitos durante y después de las sesiones intensas.',
      'Respetar la adaptación progresiva de las tibias en el costal sin usar métodos peligrosos.',
      'Priorizar el descanso nocturno para consolidar la memoria muscular de las técnicas aprendidas.',
    ],
  },
};

/**
 * Returns the complete structured Spanish manual for a given bonus.
 * If the admin created a custom bonus, builds a rich Spanish manual dynamically from its fields.
 */
export function getSpanishBonusManual(bonus: BonusItem | {
  id: string;
  code: string;
  title: string;
  description: string;
  contentSections?: string[];
}): SpanishBonusManual {
  const preset = MANUALS_BY_ID[bonus.id];
  if (preset) {
    return {
      ...preset,
      code: bonus.code || preset.code,
      title: bonus.title ? bonus.title.toUpperCase() : preset.title,
    };
  }

  const sections = bonus.contentSections && bonus.contentSections.length > 0
    ? bonus.contentSections
    : [
        '1. Fundamentos Técnicos y Posición de Guardia',
        '2. Aplicación Práctica por Rounds de 3 Minutos',
        '3. Errores Comunes y Corrección Postural',
      ];

  return {
    id: bonus.id,
    code: bonus.code || 'BONO ESPECIAL',
    title: (bonus.title || 'MANUAL TÉCNICO DE MUAY THAI').toUpperCase(),
    subtitle: bonus.description || 'Guía Oficial de Entrenamiento en Español · Thai Elite México',
    edition: 'Edición Oficial en Español · Thai Elite México',
    author: 'Cuerpo Técnico Thai Elite México',
    estimatedReadTime: '20 min de lectura práctica',
    pageCount: 3,
    introduction:
      bonus.description ||
      'Manual oficial desarrollado en español para los miembros de Thai Elite México con instrucciones prácticas paso a paso.',
    chapters: sections.map((sec, idx) => ({
      chapterNumber: `CAPÍTULO 0${idx + 1}`,
      title: sec,
      subtitle: 'Desarrollo Técnico y Aplicación en Entrenamiento',
      paragraphs: [
        'Ejecuta cada movimiento cuidando el equilibrio entre ambos pies, manteniendo el mentón protegido y exhalando en cada impacto.',
        'Integra este bloque dentro de tus sesiones de sombra técnica y trabajo en costal pesado durante 3 rounds de 3 minutos.',
      ],
      bulletPoints: [
        'Paso 1:Revisa tu postura inicial con manos arriba y codos cerrados protegiendo las costillas.',
        'Paso 2:Realiza la técnica al 50% de velocidad enfocándote en la rotación de cadera y talón.',
        'Paso 3:Aumenta progresivamente la potencia manteniendo el retorno inmediato a la guardia.',
      ],
      proTip:
        'CONSEJO THAI ELITE: La precisión y el equilibrio siempre preceden a la fuerza bruta.',
    })),
    finalChecklist: [
      'Calentar articulaciones durante 10 minutos antes de iniciar.',
      'Mantener la guardia alta antes, durante y después de cada combinación.',
      'Hidratarse adecuadamente y registrar el avance en la plataforma.',
    ],
  };
}

/**
 * Converts a UTF-8 JavaScript string (including Spanish characters á, é, í, ó, ú, ñ, ü, ¡, ¿)
 * into a safe PDF literal string using WinAnsiEncoding octal escapes so standard PDF readers
 * display all Spanish accents and punctuation cleanly.
 */
function toPdfWinAnsiString(input: string): string {
  const normalized = input
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/·/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  let out = '';
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const ch = normalized[i];
    if (ch === '\\' || ch === '(' || ch === ')') {
      out += '\\' + ch;
    } else if (code >= 32 && code <= 126) {
      out += ch;
    } else if (code >= 160 && code <= 255) {
      // ISO-8859-1 / WinAnsi range (includes ¡ ¿ á é í ó ú ñ Á É Í Ó Ú Ñ ü Ü)
      out += '\\' + code.toString(8).padStart(3, '0');
    } else {
      out += ' ';
    }
  }
  return out;
}

/**
 * Word-wraps a paragraph into lines of at most `maxChars` characters.
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Generates a complete, multi-page, valid PDF binary (`Uint8Array`) in 100% Spanish
 * with crimson/dark header bars, structured chapters, bullet points, pro-tip callout boxes,
 * and a final checklist. Works identically in both browser and Node.js.
 */
export function generateSpanishBonusPdfBytes(
  bonus: BonusItem | {
    id: string;
    code: string;
    title: string;
    description: string;
    contentSections?: string[];
  }
): Uint8Array {
  const manual = getSpanishBonusManual(bonus);

  // Build pages as arrays of PDF drawing commands
  const pageStreams: string[] = [];

  // Helper to create a standard page header & footer frame
  const startNewPage = (pageSubtitle: string): string[] => {
    const ops: string[] = [];
    // Top dark banner (0, 772, 612, 70)
    ops.push('0.05 0.05 0.05 rg 0 772 612 70 re f');
    // Crimson accent stripe (0, 768, 612, 4)
    ops.push('0.898 0.035 0.078 rg 0 768 612 4 re f');
    // Brand title in top banner
    ops.push(
      `BT /F2 13 Tf 1 1 1 rg 45 812 Td (${toPdfWinAnsiString(
        'THAI ELITE MÉXICO · BIBLIOTECA OFICIAL EN ESPAÑOL'
      )}) Tj ET`
    );
    ops.push(
      `BT /F1 9 Tf 0.85 0.85 0.85 rg 45 790 Td (${toPdfWinAnsiString(
        `${manual.code} — ${pageSubtitle}`
      )}) Tj ET`
    );
    return ops;
  };

  // =========================================================
  // PAGE 1: COVER + INTRODUCTION + SUMMARY OF CHAPTERS
  // =========================================================
  {
    const ops = startNewPage('PORTADA E INTRODUCCIÓN OFICIAL');

    // Hero cover box
    ops.push('0.09 0.09 0.09 rg 45 585 522 155 re f');
    ops.push('0.898 0.035 0.078 rg 45 585 6 155 re f');

    ops.push(
      `BT /F2 11 Tf 0.898 0.035 0.078 rg 65 712 Td (${toPdfWinAnsiString(
        `${manual.code} · MANUAL DESCARGABLE EN ESPAÑOL`
      )}) Tj ET`
    );

    const titleLines = wrapText(manual.title, 44);
    let ty = 688;
    for (const tLine of titleLines) {
      ops.push(
        `BT /F2 18 Tf 1 1 1 rg 65 ${ty} Td (${toPdfWinAnsiString(tLine)}) Tj ET`
      );
      ty -= 22;
    }

    const subLines = wrapText(manual.subtitle, 68);
    for (const sLine of subLines) {
      ops.push(
        `BT /F1 10 Tf 0.82 0.82 0.82 rg 65 ${ty - 2} Td (${toPdfWinAnsiString(
          sLine
        )}) Tj ET`
      );
      ty -= 14;
    }

    ops.push(
      `BT /F1 9 Tf 0.65 0.65 0.65 rg 65 600 Td (${toPdfWinAnsiString(
        `${manual.edition}  |  Tiempo estimado: ${manual.estimatedReadTime}`
      )}) Tj ET`
    );

    // Introduction section
    let y = 552;
    ops.push(
      `BT /F2 13 Tf 0.898 0.035 0.078 rg 45 ${y} Td (${toPdfWinAnsiString(
        'INTRODUCCIÓN AL MANUAL'
      )}) Tj ET`
    );
    y -= 20;

    const introLines = wrapText(manual.introduction, 84);
    for (const line of introLines) {
      ops.push(
        `BT /F1 10.5 Tf 0.12 0.12 0.12 rg 45 ${y} Td (${toPdfWinAnsiString(
          line
        )}) Tj ET`
      );
      y -= 15;
    }

    y -= 16;
    ops.push('0.88 0.88 0.88 rg 45 ' + y + ' 522 1 re f');
    y -= 22;

    ops.push(
      `BT /F2 13 Tf 0.08 0.08 0.08 rg 45 ${y} Td (${toPdfWinAnsiString(
        'ÍNDICE ESTRUCTURADO DE CONTENIDOS'
      )}) Tj ET`
    );
    y -= 22;

    for (const ch of manual.chapters) {
      ops.push('0.96 0.96 0.96 rg 45 ' + (y - 26) + ' 522 38 re f');
      ops.push('0.898 0.035 0.078 rg 45 ' + (y - 26) + ' 4 38 re f');
      ops.push(
        `BT /F2 10.5 Tf 0.08 0.08 0.08 rg 58 ${y - 4} Td (${toPdfWinAnsiString(
          `${ch.chapterNumber}: ${ch.title}`
        )}) Tj ET`
      );
      ops.push(
        `BT /F1 9.5 Tf 0.35 0.35 0.35 rg 58 ${y - 18} Td (${toPdfWinAnsiString(
          ch.subtitle
        )}) Tj ET`
      );
      y -= 48;
    }

    // Checklist preview on page 1 bottom
    y -= 6;
    ops.push(
      `BT /F2 11.5 Tf 0.898 0.035 0.078 rg 45 ${y} Td (${toPdfWinAnsiString(
        'CHECKLIST DE DISCIPLINA Y EJECUCIÓN DIARIA'
      )}) Tj ET`
    );
    y -= 18;
    for (const item of manual.finalChecklist) {
      const wrapped = wrapText(`[X] ${item}`, 84);
      for (const wLine of wrapped) {
        if (y > 65) {
          ops.push(
            `BT /F1 9.5 Tf 0.15 0.15 0.15 rg 50 ${y} Td (${toPdfWinAnsiString(
              wLine
            )}) Tj ET`
          );
          y -= 14;
        }
      }
    }

    pageStreams.push(ops.join('\n'));
  }

  // =========================================================
  // CHAPTER PAGES: 1 DEDICATED PAGE PER CHAPTER
  // =========================================================
  for (const chapter of manual.chapters) {
    const ops = startNewPage(`${chapter.chapterNumber} · ${chapter.title}`);
    let y = 735;

    // Chapter Header Banner
    ops.push('0.95 0.95 0.95 rg 45 ' + (y - 42) + ' 522 52 re f');
    ops.push('0.898 0.035 0.078 rg 45 ' + (y - 42) + ' 5 52 re f');

    ops.push(
      `BT /F2 10 Tf 0.898 0.035 0.078 rg 58 ${y - 6} Td (${toPdfWinAnsiString(
        chapter.chapterNumber
      )}) Tj ET`
    );
    ops.push(
      `BT /F2 14 Tf 0.06 0.06 0.06 rg 58 ${y - 23} Td (${toPdfWinAnsiString(
        chapter.title
      )}) Tj ET`
    );
    ops.push(
      `BT /F1 9.5 Tf 0.35 0.35 0.35 rg 58 ${y - 36} Td (${toPdfWinAnsiString(
        chapter.subtitle
      )}) Tj ET`
    );

    y -= 64;

    // Paragraphs
    for (const para of chapter.paragraphs) {
      const lines = wrapText(para, 84);
      for (const line of lines) {
        ops.push(
          `BT /F1 10.5 Tf 0.12 0.12 0.12 rg 45 ${y} Td (${toPdfWinAnsiString(
            line
          )}) Tj ET`
        );
        y -= 15;
      }
      y -= 8;
    }

    // Bullet Points Section Header
    y -= 4;
    ops.push(
      `BT /F2 11.5 Tf 0.08 0.08 0.08 rg 45 ${y} Td (${toPdfWinAnsiString(
        'GUÍA PRÁCTICA PASO A PASO:'
      )}) Tj ET`
    );
    y -= 18;

    for (const bullet of chapter.bulletPoints) {
      const bLines = wrapText(`• ${bullet}`, 82);
      for (let i = 0; i < bLines.length; i++) {
        if (y < 120) break;
        const xOffset = i === 0 ? 50 : 60;
        const font = i === 0 ? '/F2' : '/F1';
        ops.push(
          `BT ${font} 10 Tf 0.12 0.12 0.12 rg ${xOffset} ${y} Td (${toPdfWinAnsiString(
            bLines[i]
          )}) Tj ET`
        );
        y -= 14.5;
      }
      y -= 5;
    }

    // Pro Tip Callout Box at the bottom of the chapter
    const tipLines = wrapText(chapter.proTip, 78);
    const boxHeight = Math.max(44, tipLines.length * 14 + 20);
    const boxY = Math.max(65, y - boxHeight - 6);

    ops.push(`0.09 0.09 0.09 rg 45 ${boxY} 522 ${boxHeight} re f`);
    ops.push(`0.898 0.035 0.078 rg 45 ${boxY} 5 ${boxHeight} re f`);

    let tipY = boxY + boxHeight - 16;
    for (const tLine of tipLines) {
      ops.push(
        `BT /F2 9.5 Tf 1 1 1 rg 58 ${tipY} Td (${toPdfWinAnsiString(tLine)}) Tj ET`
      );
      tipY -= 14;
    }

    pageStreams.push(ops.join('\n'));
  }

  // Add footer with page numbers to all pages
  const totalPages = pageStreams.length;
  const finalizedStreams = pageStreams.map((stream, idx) => {
    const footerOps = [
      '0.85 0.85 0.85 rg 45 46 522 0.8 re f',
      `BT /F1 8.5 Tf 0.4 0.4 0.4 rg 45 32 Td (${toPdfWinAnsiString(
        `THAI ELITE MÉXICO · Área de Miembros Oficial · Material Exclusivo en Español`
      )}) Tj ET`,
      `BT /F2 8.5 Tf 0.898 0.035 0.078 rg 495 32 Td (${toPdfWinAnsiString(
        `Página ${idx + 1} de ${totalPages}`
      )}) Tj ET`,
    ].join('\n');
    return `${stream}\n${footerOps}\n`;
  });

  // Assemble valid multi-page PDF 1.4 document
  // Objects:
  // 1: Catalog
  // 2: Pages
  // 3: Font F1 (Helvetica / WinAnsiEncoding)
  // 4: Font F2 (Helvetica-Bold / WinAnsiEncoding)
  // For each page i (0..N-1):
  //   pageObjId = 5 + i * 2
  //   contentObjId = 6 + i * 2
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    pageObjectIds.push(5 + i * 2);
  }

  objects[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(' ')}] /Count ${totalPages} >>\nendobj\n`;
  objects[3] =
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n';
  objects[4] =
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n';

  const encoder = new TextEncoder();

  for (let i = 0; i < totalPages; i++) {
    const pageObjId = 5 + i * 2;
    const contentObjId = 6 + i * 2;
    const streamStr = finalizedStreams[i];
    const streamByteLen = encoder.encode(streamStr).byteLength;

    objects[pageObjId] = `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /MediaBox [0 0 612 842] /Contents ${contentObjId} 0 R >>\nendobj\n`;
    objects[contentObjId] = `${contentObjId} 0 obj\n<< /Length ${streamByteLen} >>\nstream\n${streamStr}endstream\nendobj\n`;
  }

  const totalObjCount = 4 + totalPages * 2;
  const header = '%PDF-1.4\n';
  const chunks: Uint8Array[] = [encoder.encode(header)];
  const offsets: number[] = [0];
  let currentOffset = chunks[0].byteLength;

  for (let objNum = 1; objNum <= totalObjCount; objNum++) {
    offsets[objNum] = currentOffset;
    const encodedObj = encoder.encode(objects[objNum]);
    chunks.push(encodedObj);
    currentOffset += encodedObj.byteLength;
  }

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${totalObjCount + 1}\n0000000000 65535 f \n`;
  for (let objNum = 1; objNum <= totalObjCount; objNum++) {
    xref += `${String(offsets[objNum]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${totalObjCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(encoder.encode(xref));

  const totalBytes = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const result = new Uint8Array(totalBytes);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.byteLength;
  }

  return result;
}

/**
 * Triggers a direct client-side download of the Spanish Bonus PDF in the browser.
 * Works both locally and on Vercel static deployments without requiring a backend server.
 */
export function triggerSpanishBonusPdfDownload(bonus: BonusItem): void {
  const pdfBytes = generateSpanishBonusPdfBytes(bonus);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    bonus.pdfFileName || `${bonus.code.replace(/\s+/g, '_')}_Thai_Elite_Espanol.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}
