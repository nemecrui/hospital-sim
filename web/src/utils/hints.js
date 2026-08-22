// Dicas educativas suaves (nunca bloqueiam — só ajudam).

// Triagem: compara a temperatura com a pulseira escolhida
export function triageTip(temp, color) {
  const t = parseFloat(temp);
  if (Number.isNaN(t) || !color) return null;
  if (t >= 39 && (color === 'verde' || color === 'amarela')) {
    return '💡 Febre alta! Costuma pedir pulseira laranja ou vermelha.';
  }
  if (t <= 37.5 && color === 'vermelha') {
    return '💡 Os sinais parecem calmos — talvez uma pulseira mais suave?';
  }
  return null;
}

// Diagnóstico: pista a partir da queixa (sem dar a resposta feita)
const DIAG_HINT = {
  Febre: 'A febre costuma andar com a Gripe.',
  Tosse: 'Tosse e ranho? Pode ser uma Constipação.',
  Constipação: 'Espirros e ranho parecem uma Constipação.',
  'Dor de garganta': 'Dor de garganta? Pode ser uma Amigdalite.',
  'Dor no ouvido': 'Dor no ouvido pode ser uma Otite.',
  'Dor de barriga': 'Dor de barriga pode ser uma Gastroenterite.',
  Enjoo: 'Enjoo e barriga? Talvez uma Gastroenterite.',
  Alergia: 'Comichão e borbulhas? Pode ser uma Alergia.',
  'Picada de inseto': 'Uma picada pode dar Alergia.',
  'Caiu e magoou-se': 'Depois de uma queda, vale a pena um Raio-X!',
  'Tornozelo torcido': 'Um pé torcido pode ser Entorse — ou um Raio-X para ver o osso.',
  Ferimento: 'Um ferimento precisa de ser limpo e de um penso.',
  'Joelho esfolado': 'Um joelho esfolado limpa-se e leva penso.'
};

export function diagnosisHint(symptom) {
  return DIAG_HINT[symptom] || null;
}
