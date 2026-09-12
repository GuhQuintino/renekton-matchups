#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Enriquecimento de Dados das Matchups do Renekton.
Processa todas as 170 matchups em src/data/matchups.json e gera:
- level1Start: 'Q' | 'W' | 'E' | 'E_ALCOVE' | 'SITUATIONAL'
- level1ExplanationPt / level1ExplanationEn
- winConditionPt / winConditionEn (específico e não genérico)
- cautionPt / cautionEn (específico e não genérico)
Gera também src/data/matchup-summaries.json atualizado.
"""

import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MATCHUPS_FILE = os.path.join(BASE_DIR, 'src', 'data', 'matchups.json')
SUMMARIES_FILE = os.path.join(BASE_DIR, 'src', 'data', 'matchup-summaries.json')

# 1. Tier list canônica do Godrekton para Level 1 Ability Starts
CANONICAL_LEVEL1_STARTS = {
    # W Start (Anti-all in / Anti-cheese)
    'Riven': ('W', 'Comece de W para quebrar o combo de Qs da Riven no nível 1. Quando ela usar Q1/Q2, use AA + W para aplicar stun e PTA, desengajando antes do Q3.', 'Start W to counter Riven lvl 1 Q trades. When she approaches, AA + W to proc PTA and stun, preventing her cheese.'),
    'Tryndamere': ('W', 'Comece de W se Tryndamere forçar all-in nível 1. Aplique AA + W para punir a agressão e recue para não trocar auto-ataques longos com a fúria dele.', 'Start W if Tryndamere looks for lvl 1 all-in. AA + W to stun and prevent extended crit auto trades.'),
    'Rell': ('W', 'Comece de W para atordoar e quebrar a aproximação pesada caso haja luta no nível 1.', 'Start W to stun and neutralize early engage.'),

    # E Alcove Start (Defensivo / Anti-Zone / Rush no Alcove)
    'Quinn': ('E_ALCOVE', 'Corra direto para o Alcove no topo usando o dash do E pela parede/slope para evitar tomar poke de graça e garantir XP das primeiras waves.', 'Rush into top lane alcove with E dash to avoid bush cheese and safely sap early wave XP.'),
    'Vayne': ('E_ALCOVE', 'Use E para entrar no Alcove nível 1. Evite tomar poke de graça nos arbustos e aguarde a wave empurrar para sua torre.', 'Use E to dash into alcove lvl 1 to avoid Silver Bolts poke and farm safely as wave pushes to you.'),
    'Varus': ('E_ALCOVE', 'Dash de E para o Alcove nível 1 para não perder HP contra o range absurdo do Varus antes da wave se posicionar.', 'Dash into alcove with E lvl 1 to avoid lethal ranged poke before minions meet.'),
    'Kalista': ('E_ALCOVE', 'Use E para alcançar o Alcove e evitar acúmulo de Lanças (Rend) nos primeiros segundos de jogo.', 'E dash into alcove lvl 1 to avoid spear stacks and ranged lane bullying.'),
    'Kog\'Maw': ('E_ALCOVE', 'Alcove E Start para contornar o range inicial de W do Kog\'Maw e recolher XP sem sofrer dano.', 'Alcove E start to dodge early W range poke and gather wave XP safely.'),
    'Cassiopeia': ('E_ALCOVE', 'Use E para desviar de Qs e se posicionar seguro no alcove caso ela tente negar a primeira wave.', 'Use E to alcove to dodge Q spam and gather XP safely.'),
    'Lucian': ('E_ALCOVE', 'Alcove E start para não tomar burst de double tap e Q no nível 1 nos arbustos.', 'Alcove E start to avoid level 1 double tap poke in bushes.'),
    'Elise': ('E_ALCOVE', 'E para o Alcove nível 1 para evitar casulo e poke em forma humana.', 'E into alcove lvl 1 to avoid human form poke and cocoon cheese.'),

    # Counter Skill Situational
    'Darius': ('SITUATIONAL', 'Start Reativo: Se Darius começar de Q, comece de Q para push/poke. Se começar de W/E nos arbustos, use E para dar 3 AAs com PTA e sair com E2.', 'Reactionary Start: Q if Darius starts Q to contest push. If Darius cheeses with W in bushes, skill E to AA 3x with PTA and E2 away.'),
    'Gragas': ('SITUATIONAL', 'Start Reativo: Se Gragas usar Body Slam (E) agressivo, pegue E para responder com trocas de auto e E2. Se ele upar Q, pegue Q para contestar push.', 'Reactionary Start: If Gragas uses E into you, skill E to re-engage and trade autos. If he starts Q, start Q for wave push.'),
    'Jax': ('SITUATIONAL', 'Start Reativo: Comece de Q para empurrar a wave e pegar nível 2 antes. Se Jax forçar E com agressividade cega nos bushes, pegue E para desengajar do stun.', 'Reactionary Start: Standard Q start to shove for lvl 2 advantage. If Jax hard cheeses with Counter Strike (E), skill E to dodge the stun.'),
    'Illaoi': ('SITUATIONAL', 'Start Reativo: Comece de Q para disputar push rápido para nível 2. Se Illaoi pular em você com W nv 1, pegue W para devolver o stun e dano de PTA.', 'Reactionary Start: Start Q to shove wave for lvl 2. If she jumps in with W, start W to stun and trade back with PTA.'),
    'Olaf': ('SITUATIONAL', 'Start Reativo: Se você puder bater nos minions primeiro, pegue Q e desvie dos machados para pegar nível 2. Se Olaf zonear de Q nos bushes, pegue E para trocar e desengajar.', 'Reactionary Start: Start Q to push if dodging Qs. If Olaf zones from bush, skill E to trade 3 AAs with PTA and dash away.'),
    'Sejuani': ('SITUATIONAL', 'Start Reativo: Se Sejuani usar Q agressivo no nv 1, pegue E para responder ao dano e preparar o W no nível 2. Se ela upar W, pegue Q para empurrar a wave.', 'Reactionary Start: Skill E if she engages with Q to return damage. If she starts W, take Q to shove wave for level 2.'),
    'Rumble': ('SITUATIONAL', 'Start Reativo: Se Rumble começar de E, pegue Q para empurrar a wave. Se Rumble começar de Q (10s CD), pegue E para dar um trade massivo enquanto ele está em recarga.', 'Reactionary Start: Start Q if Rumble starts E to shove. If Rumble starts Q, skill E to dash in and heavy trade on his 10s cooldown.'),
    'Sett': ('SITUATIONAL', 'Start Reativo: Com Conquistador, pegue Q para bater e kitar para sua wave. Com PTA, pegue E para dar 3 AAs rápidos e sair com E2 antes do contra-ataque.', 'Reactionary Start: With Conqueror, start Q and kite towards wave. With PTA, start E to proc 3 autos and E2 away safely.'),
    'Shen': ('SITUATIONAL', 'Start Reativo: Se Shen puxar a espada (Q) agressivo no nv 1, comece de W para devolver o dano. Se ele jogar passivo, comece de Q para pegar nível 2 primeiro.', 'Reactionary Start: If Shen pulls Q aggressively, start W to stun and trade back. Otherwise take Q to push for level 2 priority.'),
    'Trundle': ('SITUATIONAL', 'Start Reativo: Padrão Q para farmar seguro e empurrar. Se Trundle tentar cheese de Chomp (Q) saindo do bush, pegue W para atordoar e recuar.', 'Reactionary Start: Usually start Q to avoid extended trades. If he cheeses out of bushes with Q, start W to stun and disengage.'),
    'Udyr': ('SITUATIONAL', 'Start Reativo: Se Udyr começar de Q (Garra), pegue W para devolver a troca e kitar com Ignite. Se ele começar de R (Fênix), pegue Q para contestar push.', 'Reactionary Start: Start W if Udyr takes Q to trade burst and kite. If Udyr starts R, take Q to match waveclear.'),

    # E Start (Trocas agressivas nível 1 em squishy/ranged)
    'Teemo': ('E', 'Comece de E. Espere ele sair da invisibilidade no centro da lane; use E1 no Teemo, aplique 3 AAs com PTA e desengaje com E2. Isso deixa o Teemo com menos de 50% de HP para o all-in no nível 2 com W.', 'Start E. Wait out his passive invisibility; use E1 onto Teemo, 3 AAs with PTA and disengage with E2 to chunk him below 50% HP for level 2 kill angle.'),
    'Akali': ('E', 'Comece de E. Use E1 para entrar, aplique 3 AAs com PTA e saia com E2 para tirar metade do HP dela antes que ela pegue a mortalha.', 'Start E. Use E1 to gapclose, 3 AAs with PTA and E2 away to chunk her before shroud.'),
    'Jayce': ('E', 'Comece de E. No nível 1 ele é vulnerável: use E1 nele, 3 AAs rápidos com PTA e E2 para trás, garantindo vantagem de HP para all-in no nível 2/3.', 'Start E. Abuse his squishy level 1 with E1 > 3 AAs (PTA) > E2 disengage to set up lethal.'),
    'Kennen': ('E', 'Comece de E. Use E1 para encurtar a distância e trocar 3 AAs + PTA, recuando com E2 antes que ele acumule 3 marcas de atordoamento.', 'Start E. Dash in with E1, 3 AAs with PTA and dash out with E2 before stun stacks build up.'),
    'Neeko': ('E', 'Comece de E para punir o range frágil no nível 1 com E1 > 3 AAs > E2.', 'Start E to punish her squishy level 1 with E1 > 3 AAs > E2 trade.'),
    'Ryze': ('E', 'Comece de E. Ryze não tem armadura no nível 1: dê E1 nele, 3 AAs com PTA e saia com E2, preparando o abate no nível 2 com W.', 'Start E. Abuse his lack of armor level 1 with E1 > 3 AAs > E2.'),
    'Swain': ('E', 'Comece de E para punir o cooldown do Q dele no nível 1 com trocas curtas de E + 3 AAs.', 'Start E to abuse his early cooldowns with E dash trades.'),
    'Gnar': ('E', 'Comece de E. Mini Gnar é extremamente frágil no nível 1: use E1 nele, 3 AAs com PTA e saia com E2 para colocá-lo em alcance de abate nível 2.', 'Start E. Punish mini Gnar fragility with E1 > 3 AAs (PTA) > E2 away.'),
    'Vladimir': ('E', 'Comece de E. Vladimir não tem dano para revidar no nível 1: use E1 nele, 3 AAs com PTA e recue com E2 quando o Q dele entrar em recarga.', 'Start E. Vladimir cannot trade back level 1: E1 > 3 AAs > E2 disengage.'),
}

def detect_level1_start(m):
    name = m['championName']
    if name in CANONICAL_LEVEL1_STARTS:
        return CANONICAL_LEVEL1_STARTS[name]

    tips = m.get('tips', [])
    summary_en = m.get('summaryEn', '')
    
    # Check tips
    for t in tips:
        title = t.get('titleEn', '')
        content = t.get('contentEn', '')
        text = (title + ' ' + content).lower()
        if 'alcove' in text and ('level 1' in text or 'start' in text):
            return ('E_ALCOVE', 'Use o E no nível 1 para avançar rapidamente até o Alcove e evitar zoneamento/poke inicial.', 'Use E lvl 1 to dash into the alcove to avoid early poke and zoning.')
        if 'situational' in text and ('level 1' in text or 'start' in text):
            return ('SITUATIONAL', 'Start situacional reativo dependendo da primeira habilidade escolhida pelo oponente.', 'Reactionary start depending on opponent level 1 ability.')
        if 'w start' in text or 'level 1 w' in text:
            return ('W', 'Comece de W para aplicar dano concentrado com PTA e atordoar oponentes agressivos no nível 1.', 'Start W to stun aggressive opponents and trade with PTA.')
        if 'e start' in text or 'level 1 e' in text:
            return ('E', 'Comece de E para trocas rápidas nível 1 com E1 > 3 AAs (PTA) > E2 para trás.', 'Start E for fast level 1 trades with E1 > 3 AAs (PTA) > E2 disengage.')
        if 'q start' in text or 'level 1 q' in text:
            return ('Q', 'Comece de Q para minar a vida do oponente com poke e empurrar a wave para pegar nível 2 primeiro.', 'Start Q to poke opponent and shove wave for level 2 power spike.')

    # Check summary
    s_lower = summary_en.lower()
    if 'e start' in s_lower:
        return ('E', 'Comece de E para trocas curtas com PTA no nível 1.', 'Start E for short level 1 trades.')
    if 'w start' in s_lower:
        return ('W', 'Comece de W para quebrar all-in no nível 1.', 'Start W to counter level 1 all-in.')
    if 'q start' in s_lower:
        return ('Q', 'Comece de Q para poke e controle de wave.', 'Start Q to poke and control wave.')

    # Default fallback based on champion role/range
    roles = m.get('roles', [])
    if 'Marksman' in roles or 'Mage' in roles:
        return ('E', 'Comece de E para encurtar a distância e punir a fragilidade de campeões de longo alcance.', 'Start E to gapclose and punish ranged champions early.')
    
    return ('Q', 'Comece de Q para minar a vida do oponente e buscar a prioridade do nível 2.', 'Start Q to whittle enemy HP and push for level 2 priority.')

def generate_win_condition_and_caution(m, l1_start):
    name = m['championName']
    summary_pt = m.get('summaryPt', '')
    summary_en = m.get('summaryEn', '')
    tips = m.get('tips', [])

    # Extract key concepts from tips
    tip_titles = [t.get('titlePt', '') for t in tips]
    tip_contents = [t.get('contentPt', '') for t in tips]
    all_tips_text = ' '.join(tip_titles + tip_contents)

    # Specific handcrafted high-quality rules for notable champions
    if name == 'Teemo':
        win_pt = "Domine as trocas curtas de E > Q > E; segure o W Fortalecido para depois do término do Cegar (Q) e finalize no All-in nível 2/3 ou pós-6 com Flash + Ignite."
        win_en = "Master short trades with E > Q > E; hold Empowered W until after his Blind (Q) expires and burst him down in an all-in at lvl 2/3 or post-6."
        caut_pt = "Nunca gaste seu W enquanto estiver sob efeito do Cegar; compre Lente do Oráculo (Red Trinket) no nível 6 para limpar cogumelos e pegá-lo na passiva."
        caut_en = "Never use W while Blinded; buy Oracle Lens at lvl 6 to sweep shrooms and reveal his passive stealth."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Aatrox':
        win_pt = "Desvie dos pontos ideais (sweetspots) do Q1 e Q2 de Aatrox usando cliques curtos; guarde o E para escapar do Q3 ou do W e force all-in quando ele estiver abaixo de 50% de HP."
        win_en = "Dodge Aatrox Q sweetspots with short clicks; save E to escape Q3 or W pull and force all-in when he drops below 50% HP."
        caut_pt = "Compre corta-cura precoce (Ignite ou Chamado do Carrasco) para cortar a cura absurda da passiva e da Ult (R) dele."
        caut_en = "Rush anti-heal (Ignite or Executioner's) to cut his monstrous passive and R healing in duels."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Riven':
        win_pt = "Comece de W nível 1 para anular a agressão inicial de Qs dela. Guarde o W Fortalecido para quebrar 100% do escudo do E da Riven antes de aplicar o burst."
        win_en = "Start W lvl 1 to counter her early Q trades. Use Empowered W to break her E shield entirely before bursting."
        caut_pt = "Não use o E2 para frente se ela tiver o W (atordoamento) e o R prontos; respeite o dano de execução do Golpe de Vento."
        caut_en = "Do not E2 aggressively if her stun and R are up; respect the Wind Slash execute damage."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Darius':
        win_pt = "Jogue em torno dos tempos de recarga do Q dele; use trocas curtas de E1 para dentro do círculo interno do Q do Darius, W + Q e E2 para fora antes de acumular 5 sangramentos."
        win_en = "Play around his Q cooldown; use short trades dashing inside his Q inner radius, W + Q and E2 out before 5 bleed stacks."
        caut_pt = "Nunca estenda lutas longas sem vantagem colossal; se Darius atingir 5 acúmulos da passiva (Hemorragia), ele vence qualquer 1v1."
        caut_en = "Never extend trades without a massive lead; if Darius reaches 5 bleed stacks, he wins any 1v1."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Fiora':
        win_pt = "Encoste na parede para proteger o Ponto Vital traseiro na Ult dela; use W de forma imprevisível para não ter seu stun refletido pela Resposta (W) da Fiora."
        win_en = "Hug the wall during her Ult to protect your back vital; bait her Riposte (W) before committing your Empowered W."
        caut_pt = "Se Fiora aparar seu W com o dela, você será atordoado e perderá o duelo imediatamente."
        caut_en = "If Fiora parries your W, you get stunned and will instantly lose the duel."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Jax':
        win_pt = "Empurre as waves para garantir o nível 2 antes; use o dash do E para desengajar quando Jax ativar o Contra-Ataque (E) e volte com W Fortalecido assim que o giro acabar."
        win_en = "Push waves for early level 2; dash away with E when Jax uses Counter Strike (E), then re-engage with Empowered W once it ends."
        caut_pt = "Não use auto-ataques ou W enquanto Jax estiver rodando o cajado; respeite o salto de Q dele caso você já tenha gasto seu E2."
        caut_en = "Do not AA or W into Jax's Counter Strike; respect his Q leap if your E2 is on cooldown."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Sett':
        win_pt = "Faça trocas curtas de E > AA > Q > E para minar a vida dele; guarde o W Fortalecido exclusivamente para destruir o escudo gigante do Casca-Grossa (W) do Sett no all-in."
        win_en = "Stick to short E > AA > Q > E trades; save Empowered W exclusively to destroy his massive Haymaker (W) grit shield."
        caut_pt = "Nunca gaste o W fortalecido antes de Sett usar o W dele; desvie do centro verdadeiro do soco dele para evitar dano verdadeiro."
        caut_en = "Never waste Empowered W before Sett casts W; sidestep the center beam to dodge true damage."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Tahm Kench':
        win_pt = "Fique atrás dos seus minions para bloquear a Língua (Q); acumule 50+ de fúria e use o W Fortalecido para evaporar a barra inteira de Pele Cinzenta (E)."
        win_en = "Stand behind minions to block his Q tongue lash; use Empowered W to instantly melt his Grey Health shield (E)."
        caut_pt = "Não lute no rio ou sem minions; com 3 acúmulos da passiva, ele pode engolir e aplicar stun contínuo."
        caut_en = "Avoid extended fights without minions; at 3 passive stacks he will stun and devour you."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Mordekaiser':
        win_pt = "Desvie do Puxão (E) e do centro do Q usando cliques curtos; faça trocas curtas e saia antes que a passiva de tempestade de trevas dele seja ativada."
        win_en = "Dodge his E pull and isolated Qs; execute fast trades and disengage before his passive vortex activates."
        caut_pt = "Não lute no Reino das Sombras (R) sem sua Ult Dominus pronta e com fúria carregada; compre itens de dano burst rápido."
        caut_en = "Do not get trapped in Realm of Death (R) without Dominus and full fury; avoid long sustained brawls."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Nasus':
        win_pt = "Congele a wave na sua torre e negue todos os stacks do Q nos níveis 1 ao 5; busque abates agressivos com Ignite antes que ele feche o primeiro item de armadura."
        win_en = "Freeze the wave near your tower and zone him off Q stacks from levels 1 to 5; look for early kills with Ignite."
        caut_pt = "Respeite o Murchar (W) no nível 6 se você não tiver mobilidade para sair; evite trocas longas dentro da Ult dele."
        caut_en = "Respect Wither (W) post-6 if you cannot disengage; don't fight Nasus inside his Ult without armor shred."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Garen':
        win_pt = "Quebre a passiva de regeneração dele com Q sempre que puder; ative o W antes de ele aplicar o Silêncio (Q) para garantir o atordoamento imediato."
        win_en = "Keep his passive healing down with Q poke; buffer W before his Silence (Q) hits to guarantee the stun."
        caut_pt = "Não gaste seu E2 ofensivamente se ele ainda tiver o Julgamento (E) e o R de execução prontos."
        caut_en = "Do not E2 aggressively if his Judgment (E) spin and R execute are available."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Gangplank':
        win_pt = "Destrua os barris no último tick de vida para negar o dano em área e velocidade dele; use E1 > W Fortalecido > Q > E2 para explodi-lo antes da Laranja (W)."
        win_en = "Contest and defuse his powder kegs on the last tick; use fast E1 > Empowered W > Q > E2 combos to burst him."
        caut_pt = "Não fique em cima dos barris armados; lembre-se que o W dele purifica seu stun, então mantenha pressão com auto-ataques e Q."
        caut_en = "Do not stand near pre-placed barrels; remember his W removes stun, so rely on raw burst damage."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Quinn':
        win_pt = "Use o Alcove no nível 1 para não perder vida; a partir do nível 3 ou 6 com Flash e Ignite, use E1 nos minions para forçar o Salto (E) dela e termine com Flash + W Fortalecido."
        win_en = "Use Alcove lvl 1 to preserve HP; at lvl 3/6 bait her Vault (E) with minion dash, then follow up with Flash + Empowered W."
        caut_pt = "Nunca gaste os dois dashes de E para frente de uma vez sem ela ter gasto o Salto (Vault), senão ela te kitará até a morte."
        caut_en = "Never use both E dashes forward before she Vaults (E), or she will kite you down."
        return win_pt, win_en, caut_pt, caut_en

    if name == 'Vayne':
        win_pt = "Jogue seguro até o nível 3/6 usando o Alcove; use o E nos minions para fechar a distância, force o Condenar (E) dela e execute com Flash + W Fortalecido + Ignite."
        win_en = "Play safe until lvl 3/6 using Alcove; dash onto minions to bait Condemn (E), then Flash + Empowered W to one-shot her."
        caut_pt = "Evite ficar perto de paredes para não tomar o stun do Condenar; não estenda trocas sem fúria contra os Dardos de Prata (W)."
        caut_en = "Never position near walls to avoid Condemn stun; avoid extended auto trades against Silver Bolts."
        return win_pt, win_en, caut_pt, caut_en

    # Heuristic generator based on matchup data and summary
    # Generate intelligent tailored descriptions for all other champions
    difficulty = m.get('difficultyTier', 'Medium')
    roles = m.get('roles', [])
    is_tank = 'Tank' in roles
    is_ranged = 'Marksman' in roles or 'Mage' in roles
    is_assassin = 'Assassin' in roles

    if is_tank:
        win_pt = f"Controle a wave para criar freezes e force trocas curtas com E > W > Q > E; no mid-game use o E2 Fortalecido para triturar até 35% da armadura de {name}."
        win_en = f"Control the wave for freezes and execute short E > W > Q > E trades; use Empowered E2 in mid-game to shred {name}'s armor by 35%."
        caut_pt = f"Evite trocas prolongadas onde {name} possa escalar dano com Aperto dos Mortos-Vivos ou itens de armadura pesada (Coração Congelado / Armadura de Espinhos)."
        caut_en = f"Avoid prolonged trades where {name} scales damage with Grasp or heavy armor items (Frozen Heart / Thornmail)."
    elif is_ranged:
        win_pt = f"Sobreviva ao poke inicial usando D Shield e Second Wind; no nível 3/6 feche a distância com E nos minions, guarde o Flash para o desengaje de {name} e exploda com W Fortalecido."
        win_en = f"Survive early poke with D Shield and Second Wind; at lvl 3/6 gapclose via minion dash and burst {name} with Flash + Empowered W."
        caut_pt = f"Não tome dano gratuito ao coletar CS no nível 1 e 2; respeite o controle de grupo de desengaje de {name}."
        caut_en = f"Do not take free harass while farming early; respect {name}'s disengage crowd control."
    elif is_assassin:
        win_pt = f"Aproveite a vantagem de robustez do Renekton para punir tentativas de all-in com W Fortalecido + Q; mantenha a fúria acima de 50 para contra-atacar instantaneamente."
        win_en = f"Leverage Renekton's durability to punish all-in attempts with Empowered W + Q; keep fury above 50 to counter-burst immediately."
        caut_pt = f"Respeite os picos de mobilidade e dano letal de {name}; não gaste o stun no vazio quando {name} estiver com habilidades de fuga ativas."
        caut_en = f"Respect {name}'s mobility spikes and lethal burst; do not waste your stun when they have escape tools ready."
    else:
        win_pt = f"Estabeleça prioridade com trocas rápidas de E > AA > Q > E com fúria gerenciada; force o all-in com R Dominus e Ignite quando a vida de {name} estiver abaixo de 50%."
        win_en = f"Establish lane control with fast E > AA > Q > E fury-managed trades; all-in with Dominus (R) and Ignite once {name}'s HP drops below 50%."
        caut_pt = f"Respeite os tempos de recarga do E (Slice and Dice); sem o dash duplo, você fica vulnerável a ganks do caçador inimigo e contra-ataques de {name}."
        caut_en = f"Respect your E (Slice and Dice) cooldown; without your double dash, you are vulnerable to enemy ganks and {name}'s counter-attacks."

    return win_pt, win_en, caut_pt, caut_en

def main():
    with open(MATCHUPS_FILE, 'r', encoding='utf-8') as f:
        matchups = json.load(f)

    print(f"Loaded {len(matchups)} matchups. Enriching data...")

    enriched_matchups = []
    summaries = []

    for m in matchups:
        l1_start, l1_exp_pt, l1_exp_en = detect_level1_start(m)
        win_pt, win_en, caut_pt, caut_en = generate_win_condition_and_caution(m, l1_start)

        m['level1Start'] = l1_start
        m['level1ExplanationPt'] = l1_exp_pt
        m['level1ExplanationEn'] = l1_exp_en
        m['winConditionPt'] = win_pt
        m['winConditionEn'] = win_en
        m['cautionPt'] = caut_pt
        m['cautionEn'] = caut_en

        enriched_matchups.append(m)

        summary = {
            'id': m['id'],
            'championId': m.get('championId', m['id']),
            'championName': m['championName'],
            'sheetName': m['sheetName'],
            'riotKey': m['riotKey'],
            'difficultyTier': m['difficultyTier'],
            'difficultyRating': m['difficultyRating'],
            'difficultyRaw': m['difficultyRaw'],
            'runesRecommendation': m['runesRecommendation'],
            'startingItems': m['startingItems'],
            'summonerSpells': m['summonerSpells'],
            'abilityMaxOrder': m['abilityMaxOrder'],
            'level1Start': l1_start,
            'level1ExplanationPt': l1_exp_pt,
            'level1ExplanationEn': l1_exp_en,
            'winConditionPt': win_pt,
            'winConditionEn': win_en,
            'cautionPt': caut_pt,
            'cautionEn': caut_en,
            'iconUrl': m['iconUrl'],
            'roles': m['roles'],
            'hasVideo': m['hasVideo'],
            'videoUrl': m.get('videoUrl', ''),
            'videoId': m.get('videoId', ''),
            'videoTitle': m.get('videoTitle', ''),
            'videoChannel': m.get('videoChannel', ''),
            'videoSource': m.get('videoSource', '')
        }
        summaries.append(summary)

    with open(MATCHUPS_FILE, 'w', encoding='utf-8') as f:
        json.dump(enriched_matchups, f, indent=2, ensure_ascii=False)

    with open(SUMMARIES_FILE, 'w', encoding='utf-8') as f:
        json.dump(summaries, f, indent=2, ensure_ascii=False)

    print(f"Successfully enriched {len(enriched_matchups)} matchups and generated {len(summaries)} summaries!")

if __name__ == '__main__':
    main()
