// ── Bloque 1 – Preguntas Personales ──────────────────────────────────────────
export const B1 = [
  {
    id: 'b1_1',
    text: '¿Estás interesado(a) en saber si tienes Depresión, Ansiedad y/o Estrés?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b1_3',
    text: 'Indica tu género',
    type: 'single',
    opts: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'],
  },
  {
    id: 'b1_4',
    text: '¿Cuántos años tienes?',
    type: 'text',
    ph: 'Ej. 20',
    inputMode: 'numeric',
  },
  {
    id: 'b1_7',
    text: 'Indica tu nivel de estudios actualmente',
    type: 'single',
    opts: ['Secundaria', 'Bachillerato', 'Licenciatura', 'Postgrado', 'No estoy estudiando'],
  },
  {
    id: 'b1_8',
    text: '¿En qué escuela estás inscrito(a)?',
    type: 'text',
    ph: 'Nombre de la institución',
  },
  {
    id: 'b1_10',
    text: '¿En qué turno asistes a clases?',
    type: 'single',
    opts: ['Matutino', 'Vespertino', 'Sabatino', 'Turno Único', 'Clases en línea'],
  },
  {
    id: 'b1_11',
    text: 'En los últimos 6 meses, ¿te han detectado algún trastorno mental?',
    type: 'multi',
    opts: ['Ninguno', 'Depresión', 'Ansiedad', 'Estrés', 'Esquizofrenia', 'TDAH', 'Bipolaridad', 'Otro'],
  },
  {
    id: 'b1_12',
    text: '¿Estás dispuesto(a) a participar en todas las fases de la experimentación?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b1_13',
    text: '¿Estás dispuesto(a) a responder con la verdad a las siguientes preguntas?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
];

// ── Bloque 2 – DASS-21 ───────────────────────────────────────────────────────
export const OPTS_DASS = [
  'No me ha ocurrido',
  'Me ha ocurrido un poco, o durante parte del tiempo',
  'Me ha ocurrido bastante, o durante una buena parte del tiempo',
  'Me ha ocurrido mucho, o la mayor parte del tiempo',
];

const DASS_TEXTS = [
  'Me ha costado mucho descargar la tensión',
  'Me di cuenta de que tenía la boca seca',
  'No podía sentir ningún sentimiento positivo',
  'Se me hizo difícil respirar',
  'Se me hizo difícil tomar la iniciativa para hacer cosas',
  'Reaccioné exageradamente en ciertas situaciones',
  'Sentí que mis manos temblaban',
  'He sentido que estaba gastando una gran cantidad de energía',
  'Estaba preocupado(a) por situaciones en las que podía tener pánico o hacer el ridículo',
  'He sentido que no había nada que me ilusionara',
  'Me he sentido inquieto(a)',
  'Se me hizo difícil relajarme',
  'Me sentí triste y deprimido(a)',
  'No toleré nada que me impidiera continuar con lo que estaba haciendo',
  'Sentí que estaba al punto del pánico',
  'No me pude entusiasmar por nada',
  'Sentí que valía muy poco como persona',
  'He tendido a sentirme enfadado(a) con facilidad',
  'Sentí los latidos de mi corazón a pesar de no haber hecho ningún esfuerzo físico',
  'Tuve miedo sin razón aparente',
  'Sentí que la vida no tenía ningún sentido',
];

export const DASS = DASS_TEXTS.map((text, i) => ({
  id: `dass_${i + 1}`,
  text: `${i + 1}. ${text}`,
  type: 'single',
  opts: OPTS_DASS,
}));

// ── Bloque 3 – Preguntas Demográficas ────────────────────────────────────────
export const B3 = [
  {
    id: 'b3_1',
    text: '1. ¿Con quién vives actualmente? (puedes seleccionar varias)',
    type: 'multi',
    opts: [
      'Padre biológico', 'Madre biológica', 'Pareja de madre / padre biológico',
      'Hermano(a) / Hermanos', 'Abuelo(a) / Abuelos', 'Familiares indirectos',
      'Esposo(a) / Pareja sentimental / Concubino(a)', 'Solo / Sola',
      'Con amigos o compañeros de cuarto', 'Otro', 'Prefiero no decirlo',
    ],
  },
  {
    id: 'b3_2',
    text: '2. ¿Te sientes cómodo(a) en tu entorno familiar?',
    type: 'single',
    opts: ['Totalmente de acuerdo', 'De acuerdo', 'En desacuerdo', 'Totalmente en desacuerdo'],
  },
  {
    id: 'b3_3',
    text: '3. ¿Tienes problemas para dormir frecuentemente (conciliar el sueño)?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_4',
    text: '4. ¿Cuántas horas duermes actualmente?',
    type: 'single',
    opts: ['Menos de 5 horas', 'De 5 a 6 horas', 'De 7 a 8 horas', 'Más de 8 horas'],
  },
  {
    id: 'b3_5',
    text: '5. ¿Sientes que regularmente descansas de forma adecuada cuando duermes?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_6',
    text: '6. ¿Sueles usar tu celular, tablet o computadora en los 30 minutos antes de dormir?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_7',
    text: '7. ¿Cuántas comidas completas haces al día?',
    type: 'single',
    opts: ['Ninguna', '1 comida completa', '2 comidas completas', '3 comidas completas', 'Más de 3 comidas completas'],
  },
  {
    id: 'b3_8',
    text: '8. ¿Consumes regularmente frutas y verduras?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_9',
    text: '9. ¿Tomas suficiente agua durante el día (al menos 2 litros)?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_10',
    text: '10. ¿Realizas algún tipo de actividad física al menos 3 veces por semana?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_11',
    text: '11. ¿Cuántas horas pasas sentado(a) al día (escuela, dispositivos, ocio)?',
    type: 'single',
    opts: ['Menos de 3 horas', 'De 4 a 6 horas', 'De 7 a 9 horas', 'Más de 10 horas'],
  },
  {
    id: 'b3_12',
    text: '12. ¿Cuántas horas al día pasas en redes sociales o dispositivos electrónicos?',
    type: 'single',
    opts: ['Menos de 2 horas', 'De 2 a 4 horas', 'De 5 a 7 horas', 'Más de 8 horas'],
  },
  {
    id: 'b3_13',
    text: '13. ¿Sientes que el uso de redes sociales afecta tu estado de ánimo?',
    type: 'single',
    opts: ['Sí', 'No', 'A veces'],
  },
  {
    id: 'b3_14',
    text: '14. ¿Tienes a alguien con quien hablar cuando te sientes triste o preocupado(a)?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_15',
    text: '15. ¿Te sientes cómodo(a) en tu entorno escolar y con tus compañeros?',
    type: 'single',
    opts: ['Sí', 'No', 'A veces'],
  },
  {
    id: 'b3_16',
    text: '16. En los últimos 6 meses, ¿con qué frecuencia realizas actividades recreativas fuera de la escuela?',
    type: 'single',
    opts: ['Nunca', 'Pocas veces', 'Regularmente', 'Siempre'],
  },
  {
    id: 'b3_17',
    text: '17. En los últimos 6 meses, ¿has ingerido algún medicamento antidepresivo?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_18',
    text: '18. En los últimos 6 meses, ¿has recibido algún tratamiento relacionado con tu salud mental?',
    type: 'single',
    opts: ['Sí', 'No', 'Nunca he acudido con un especialista en salud mental'],
  },
  {
    id: 'b3_19',
    text: '19. En los últimos 3 meses, ¿qué tan frecuente es tu consumo de bebidas alcohólicas?',
    type: 'single',
    opts: [
      'Ninguna vez', 'De 1 a 2 veces al mes', 'De 3 a 4 veces al mes',
      'De 1 a 2 veces por semana', 'De 3 o más veces por semana',
    ],
  },
  {
    id: 'b3_20',
    text: '20. ¿Sientes que el consumo de alcohol te ayuda a sentirte mejor emocionalmente?',
    type: 'single',
    opts: ['Sí', 'No', 'A veces', 'Yo no consumo alcohol'],
  },
  {
    id: 'b3_21',
    text: '21. En los últimos 6 meses, ¿has consumido alguna sustancia no prescrita (tabaco, marihuana, medicamentos, u otras)?',
    type: 'single',
    opts: ['Sí', 'No'],
  },
  {
    id: 'b3_22',
    text: '22. Si has consumido alguna sustancia, ¿con qué propósito lo hiciste?',
    type: 'single',
    opts: [
      'Para relajarme', 'Por presión social', 'Por curiosidad',
      'Porque me ayuda a sentirme mejor emocionalmente', 'Otro',
      'No he consumido ninguna sustancia',
    ],
  },
  {
    id: 'b3_23',
    text: '23. ¿Crees que el consumo de alcohol o drogas ha afectado tu estado de ánimo, relaciones familiares o rendimiento escolar?',
    type: 'single',
    opts: ['Sí', 'No', 'Tal vez', 'Yo no consumo alcohol'],
  },
  {
    id: 'b3_24',
    text: '24. Si te sintieras preocupado(a) por tu consumo de drogas o alcohol, ¿sabrías a dónde acudir para pedir ayuda?',
    type: 'single',
    opts: [
      'Sí', 'No', 'Sí sé dónde, pero no quiero ayuda',
      'No sé dónde, pero sí quiero ayuda', 'No consumo drogas ni alcohol',
    ],
  },
  {
    id: 'b3_25',
    text: '25. ¿Qué tan satisfecho(a) estás con tu estilo de vida actual? (1 = Nada satisfecho, 5 = Totalmente satisfecho)',
    type: 'slider',
    min: 1,
    max: 5,
  },
  {
    id: 'b3_26',
    text: '26. ¿Qué dispositivo estás dispuesto(a) a probar? (puedes elegir varios)',
    type: 'multi',
    opts: ['Electroencefalograma (EEG)', 'Seguidor Ocular', 'Psicóloga Virtual / Holograma', 'Ninguno'],
  },
];

// ── DASS-21 Scoring ───────────────────────────────────────────────────────────
// Depression items: 3,5,10,13,16,17,21
// Anxiety items:    2,4,7,9,15,19,20
// Stress items:     1,6,8,11,12,14,18
export const DASS_KEYS = {
  depression: [3,5,10,13,16,17,21].map(n => `dass_${n}`),
  anxiety:    [2,4,7,9,15,19,20].map(n => `dass_${n}`),
  stress:     [1,6,8,11,12,14,18].map(n => `dass_${n}`),
};

export function scoreDASS(answers) {
  const val = (id) => {
    const idx = OPTS_DASS.indexOf(answers[id]);
    return idx !== -1 ? idx : 0;
  };
  const d = DASS_KEYS.depression.reduce((s, id) => s + val(id), 0);
  const a = DASS_KEYS.anxiety.reduce((s, id) => s + val(id), 0);
  const s = DASS_KEYS.stress.reduce((s, id) => s + val(id), 0);

  const classify = (score, thresholds) => {
    if (score <= thresholds[0]) return 'Normal';
    if (score <= thresholds[1]) return 'Leve';
    if (score <= thresholds[2]) return 'Moderado';
    if (score <= thresholds[3]) return 'Severo';
    return 'Extremadamente severo';
  };

  return {
    d, sevD: classify(d, [4, 6, 10, 13]),
    a, sevA: classify(a, [3, 4, 7,  9]),
    s, sevS: classify(s, [7, 9, 12, 16]),
  };
}
