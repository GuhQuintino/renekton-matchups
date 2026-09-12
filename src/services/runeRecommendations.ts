/**
 * Tactical Rune & Summoner Spells Recommendations for Renekton
 */

export interface RuneSetup {
  keystone: string;
  keystoneTree: 'Precisão' | 'Determinação' | 'Feitiçaria' | 'Dominação' | 'Inspiração';
  primaryRunes: string[];
  secondaryTree: 'Precisão' | 'Determinação' | 'Feitiçaria' | 'Inspiração' | 'Dominação';
  secondaryRunes: string[];
  statShards: string[];
  summonerSpells: string[];
  startingItems: string;
  tacticalReasoningPt: string;
  tacticalReasoningEn: string;
  earlyGamePlanPt: string;
  earlyGamePlanEn: string;
}

export function getRuneRecommendationForMatchup(
  championName: string,
  rawRunesText?: string,
  rawSpellsText?: string,
  rawItemsText?: string
): RuneSetup {
  const name = (championName || '').trim().toLowerCase();

  // 1. Check for specific archetype setups
  if (['nasus', 'olaf', 'tryndamere'].includes(name)) {
    return {
      keystone: 'Pressione o Ataque (PTA)',
      keystoneTree: 'Precisão',
      primaryRunes: ['Triunfo', 'Lenda: Espontaneidade', 'Até a Morte'],
      secondaryTree: 'Feitiçaria',
      secondaryRunes: ['Manto de Nimbus', 'Transcendência'],
      statShards: ['+9 Dano Adaptativo', '+9 Dano Adaptativo', '+65 Vida Escalonável'],
      summonerSpells: ['Flash', 'Fantasma (Ghost)'],
      startingItems: 'Lâmina de Doran + Poção',
      tacticalReasoningPt: 'Fantasma e Manto de Nimbus evitam ser perseguido ou desacelerado durante a rota, garantindo controle de distância e all-ins letais.',
      tacticalReasoningEn: 'Ghost and Nimbus Cloak prevent being run down or slowed during laning, granting spacing mastery and lethal all-in stickiness.',
      earlyGamePlanPt: 'Nível 1 de Q ou W para punir farm inicial; congele a wave na entrada da sua torre e puna a cada tentativa de aproximação.',
      earlyGamePlanEn: 'Level 1 Q or W to punish early CS; freeze the wave at your tower entrance and punish every attempt to step forward.',
    };
  }

  if (['teemo', 'quinn', 'vayne', 'kennen', 'akshan', 'jayce', 'gnar'].includes(name)) {
    return {
      keystone: 'Pressione o Ataque (PTA)',
      keystoneTree: 'Precisão',
      primaryRunes: ['Triunfo', 'Lenda: Espontaneidade', 'Até a Morte'],
      secondaryTree: 'Determinação',
      secondaryRunes: ['Ventos Revigorantes', 'Inabalável'],
      statShards: ['+9 Dano Adaptativo', '+9 Dano Adaptativo', '+65 Vida Escalonável'],
      summonerSpells: ['Flash', 'Incendiar (Ignite) ou Teleporte'],
      startingItems: 'Escudo de Doran + Poção',
      tacticalReasoningPt: 'Escudo de Doran + Ventos Revigorantes anulam o poke à distância. PTA garante que, quando você acertar o combo E > W > Q > E, o alvo seja destruído instantaneamente.',
      tacticalReasoningEn: "Doran's Shield + Second Wind neutralize ranged poke. PTA ensures that whenever you land E > W > Q > E out, the target is instantly chunked for >50% HP.",
      earlyGamePlanPt: 'Nível 1 de E ou Q. Não perca vida à toa por minions; espere o Nível 3 com Fúria 50+ para dar double dash e forçar Flash ou abate.',
      earlyGamePlanEn: 'Level 1 E or Q. Do not give free HP for minions; wait for Level 3 with 50+ Fury to double-dash and force Flash or execute a solo kill.',
    };
  }

  if (['malphite', 'ornn', 'sion', 'chogath', "cho'gath", 'dr. mundo', 'drmundo', 'shen', 'poppy', 'ksante', "k'sante"].includes(name)) {
    return {
      keystone: 'Conquistador',
      keystoneTree: 'Precisão',
      primaryRunes: ['Triunfo', 'Lenda: Aceleração', 'Até a Morte'],
      secondaryTree: 'Determinação',
      secondaryRunes: ['Demolir', 'Crescimento Excessivo'],
      statShards: ['+9 Dano Adaptativo', '+9 Dano Adaptativo', '+65 Vida Escalonável'],
      summonerSpells: ['Flash', 'Teleporte (ou Incendiar)'],
      startingItems: 'Lâmina de Doran (ou Espada Longa + 3 Poções)',
      tacticalReasoningPt: 'Conquistador dá AD acumulável e sustentação nas trocas longas contra tanks, combinando perfeitamente com cutelo negro e eclipse.',
      tacticalReasoningEn: 'Conqueror stacks bonus AD and healing in extended trades vs tanks, synergizing seamlessly with Black Cleaver and Eclipse.',
      earlyGamePlanPt: 'Nível 1 de Q. Pressione a wave rápido para pegar Nível 2 e Nível 3 primeiro; puna quando usarem habilidades na wave e pegue placas com Demolir.',
      earlyGamePlanEn: 'Level 1 Q. Push wave quickly to secure Level 2 and Level 3 first; punish when they blow abilities on minions and harvest turret plates with Demolish.',
    };
  }

  if (['darius', 'sett', 'mordekaiser', 'illaoi', 'volibear', 'gwen', 'warwick', 'trundle', 'urgot'].includes(name)) {
    return {
      keystone: 'Conquistador (ou PTA)',
      keystoneTree: 'Precisão',
      primaryRunes: ['Triunfo', 'Lenda: Espontaneidade', 'Até a Morte'],
      secondaryTree: 'Determinação',
      secondaryRunes: ['Osso Revestido', 'Inabalável'],
      statShards: ['+9 Dano Adaptativo', '+9 Dano Adaptativo', '+6 Armadura'],
      summonerSpells: ['Flash', 'Incendiar (Ignite)'],
      startingItems: "Lâmina de Doran + Poção",
      tacticalReasoningPt: 'Osso Revestido mitiga o dano inicial em trocas curtas. Incendiar é obrigatório para cortar a cura absurda de all-in desses duelistas.',
      tacticalReasoningEn: 'Bone Plating mitigates upfront damage in short trades. Ignite is mandatory to cut high innate healing during all-ins.',
      earlyGamePlanPt: 'Nível 1 de Q. Faça trocas curtas (E > Q > W > E out) para baixar a vida para 50%; nunca lute estendido sem fúria e sem a Ult ativa.',
      earlyGamePlanEn: 'Level 1 Q. Trade short (E > Q > W > E out) to bring enemy under 50% HP; never take extended brawls without 50+ Fury and active Dominus.',
    };
  }

  // Default Universal Setup (PTA Fast Burst)
  const isConqRecommended = rawRunesText?.toLowerCase().includes('conq');
  return {
    keystone: isConqRecommended ? 'Conquistador' : 'Pressione o Ataque (PTA)',
    keystoneTree: 'Precisão',
    primaryRunes: ['Triunfo', 'Lenda: Espontaneidade', 'Até a Morte'],
    secondaryTree: 'Determinação',
    secondaryRunes: ['Osso Revestido', 'Inabalável'],
    statShards: ['+9 Dano Adaptativo', '+9 Dano Adaptativo', '+65 Vida Escalonável'],
    summonerSpells: rawSpellsText?.includes('Ghost') ? ['Flash', 'Fantasma'] : ['Flash', 'Incendiar (Ignite)'],
    startingItems: rawItemsText || "Lâmina de Doran + Poção",
    tacticalReasoningPt: 'Página padrão de alta dominância de rota com PTA para dano explosivo e Determinação para absorção de trocas.',
    tacticalReasoningEn: 'Standard high-dominance lane page with PTA for burst trade execution and Resolve for defensive trade absorption.',
    earlyGamePlanPt: 'Nível 1 de Q para carregar fúria e dominar o empurrão da wave. Busque troca com Fúria 50+ no Nível 2 ou 3.',
    earlyGamePlanEn: 'Level 1 Q to build early fury and secure wave push. Look for empowered 50+ Fury trade spikes at Level 2 or 3.',
  };
}
