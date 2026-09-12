#!/usr/bin/env python3
"""
Script de Síntese Estratégica Completa para Renekton Matchups.
Substitui resumos truncados/incompletos (com '...') por resumos coesos, táticos e profundos
baseados nas 7-13 notas detalhadas de cada campeão, dicas de fúria, condição de vitória e cuidados.
"""

import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MATCHUPS_FILE = os.path.join(BASE_DIR, 'src', 'data', 'matchups.json')
SUMMARIES_FILE = os.path.join(BASE_DIR, 'src', 'data', 'matchup-summaries.json')
CACHE_FILE = os.path.join(BASE_DIR, 'scripts', 'translation_cache.json')
SEED_SQL_FILE = os.path.join(BASE_DIR, 'src-tauri', 'src', 'db', 'seed.sql')

# Dicionário de resumos estratégicos artesanais de altíssima qualidade (PT-BR e EN) para as matchups afetadas
CHALLENGER_SUMMARIES = {
    "Neeko": {
        "pt": (
            "O confronto contra Neeko exige paciência e respeito absoluto ao seu alcance e poke inicial. "
            "No início do jogo (níveis 1 e 2), o harass com Q e E de Neeko pode minar rapidamente o HP do Renekton, "
            "portanto comece com Doran's Shield e Ventos Revigorantes, evitando tomar dano gratuito para coletar minions. "
            "A partir do nível 3 e especialmente no 6, a dinâmica muda totalmente: utilize o E (Fatiar) nos minions para encurtar "
            "a distância, force o uso do clone (W) ou do aprisionamento dela e aplique o W Fortalecido para estourá-la. "
            "Guarde seu Flash para responder ao desengaje ou à ult de Neeko, garantindo all-ins letais com W Fortalecido e Ignite."
        ),
        "en": (
            "The matchup against Neeko demands high patience and respect for her early poke and range advantage. "
            "During levels 1 and 2, her Q and E harass can quickly deplete Renekton's health bar, so starting with Doran's Shield "
            "and Second Wind is essential while avoiding unnecessary damage for CS. From level 3 onwards and particularly at level 6, "
            "the dynamic shifts in Renekton's favor: use E (Slice) through minions to gap-close, bait her clone or root, and execute "
            "with an Empowered W burst combo. Hold your Flash to counter her ultimate or disengage tools, securing lethal all-ins with Ignite."
        )
    },
    "Nidalee": {
        "pt": (
            "Nidalee na rota solo busca abusar de seu alcance à distância, velocidade nos arbustos e do poke com Aperto dos Mortos-Vivos "
            "para desgastar o Renekton antes do nível 3. Para neutralizá-la, jogue pelo sustento no início, use os arbustos com cautela "
            "e mantenha o controle de onda perto da sua torre. Ao atingir o nível 3, o Renekton possui vantagem esmagadora em trocas curtas: "
            "avance com E nos minions, aplique W Fortalecido + Q e desengaje com E2 antes que ela consiga responder na forma de puma. "
            "No nível 6 com o pico de poder do Dominus (R), qualquer avanço precipitado de Nidalee resulta em abate com all-in completo."
        ),
        "en": (
            "Solo lane Nidalee relies on her ranged poke, bush movement speed advantage, and Grasp procs to chip Renekton down early. "
            "To counter this, play for sustain during levels 1-2, respect bushes, and hold wave control close to your turret. "
            "Once you hit level 3, Renekton has overwhelming short trade dominance: gap close with E through minions, deliver Empowered W + Q, "
            "and disengage with E2 before she can counter-attack in Cougar form. At level 6 with Dominus (R), any overextension by Nidalee turns into an instant kill."
        )
    },
    "Nilah": {
        "pt": (
            "Nilah é uma campeã corpo a corpo frágil no início de jogo, o que concede a Renekton grande vantagem de agressão nos primeiros níveis. "
            "No nível 1, comece com E para aplicar a estratégia de troca rápida (E1 > 3 auto-ataques para ativar PTA/Conquistador > recuar com E2). "
            "O ponto crítico da rota é respeitar o Véu Jubiloso (W) de Nilah, que bloqueia auto-ataques e anula o dano do W do Renekton se usado antecipadamente. "
            "Iscas as defesas dela com trocas curtas de Q, aguarde o término do W dela e execute-a com W Fortalecido quando ela estiver vulnerável. "
            "No mid game, evite agrupar em espaços fechados para não ser pego pelo controle de grupo do R de Nilah em teamfights."
        ),
        "en": (
            "Nilah is a fragile melee skirmisher early on, giving Renekton a distinct aggression edge in the early levels. "
            "At level 1, start E to execute rapid trades (E1 > 3 autos to trigger PTA/Conqueror > disengage with E2). "
            "The key mechanical check is playing around Nilah's Jubilant Veil (W), which dodges basic attacks and negates Renekton's W if mistimed. "
            "Bait her defensive shroud with quick Q trades, then punish with Empowered W the moment her dodge ends. In teamfights, spread out to prevent her ultimate from pulling your team."
        )
    },
    "Nocturne": {
        "pt": (
            "Nocturne possui um nível 1 e 2 extremamente perigosos devido ao alto AD bônus concedido pelo seu Rastro do Crepúsculo (Q) "
            "e à velocidade de ataque do Conquistador/Ritmo Fatal. Evite lutar em cima da trilha sombria dele no nível 1. "
            "A chave para vencer o confronto é quebrar o Escudo Espiritual (W) dele com o Q ou com auto-ataque antes de desferir o W Fortalecido, "
            "além de usar o duplo dash do E para quebrar a corrente de medo (E) do Nocturne. "
            "Com o Dominus (R) e itens como Eclipse ou Cutelo Negro, Renekton vence qualquer duelo direto contra Nocturne na rota lateral."
        ),
        "en": (
            "Nocturne's levels 1 and 2 pack tremendous raw AD and attack speed from his Duskbringer (Q) trail and runes. "
            "Never take extended slugfests directly inside his shadow trail at level 1. The core mechanic is breaking his spell shield (W) "
            "with Q or an auto attack before committing your Empowered W stun, while using double dash on E to tether out of his Unspeakable Horror (E) fear. "
            "With Dominus (R) and core items like Eclipse or Black Cleaver, Renekton easily wins isolated 1v1 duels in the side lane."
        )
    },
    "Nunu & Willump": {
        "pt": (
            "Nunu na rota superior depende de empurrar a onda com a Bola de Neve (W) e sustentar a vida infinitamente com a Mordida (Q). "
            "No nível 1, tome cuidado com emboscadas na névoa de guerra com a bola de neve carregada. "
            "O Renekton anula completamente o plano de jogo de Nunu guardando o W (Abater os Indefesos) para cancelar instantaneamente a canalização "
            "da Bola de Neve ou do Zero Absoluto (R). "
            "Compre Corta-Cura precoce (Golpe do Carrasco) ou Eclipse para mitigar a cura absurda de Nunu e castigue-o com W Fortalecido sempre que ele tentar se aproximar da onda."
        ),
        "en": (
            "Solo lane Nunu revolves around shoving waves with snowball roams (W) and out-sustaining trades with Consume (Q). "
            "Watch out for level 1 fog-of-war cheese where he rolls a fully charged snowball into lane. "
            "Renekton hard counters Nunu by saving his W stun to instantly disrupt Nunu's Biggest Snowball Ever! (W) charge or Absolute Zero (R) channel. "
            "Rush early anti-heal (Executioner's Calling) or Eclipse to pierce his sustain, punishing every minion bite with devastating Empowered W combos."
        )
    },
    "Olaf": {
        "pt": (
            "O confronto contra Olaf é brutal e centrado em respeito aos machados (Q) no início. Um erro comum é tomar um machado no nível 1 e ser atropelado na rota. "
            "Evite trocas prolongadas no nível 1-2 onde a passiva de velocidade de ataque e roubo de vida de Olaf superam qualquer campeão. "
            "Jogue com controle de onda perto de sua torre e aplique trocas curtas e limpas: E para entrar > W com stun > Q > E para sair antes que ele possa responder. "
            "No nível 6, nunca gaste o W Fortalecido diretamente no Ragnarok (R) de Olaf, pois ele é imune a controles de grupo; em vez disso, use o Dominus (R), "
            "kite com o E e aguarde a ult de Olaf expirar para virar o combate com dano total."
        ),
        "en": (
            "The Olaf matchup requires utmost discipline around Undertow (Q) axes. Tanking a single level 1 axe will result in getting run down by his Ghost and passive attack speed. "
            "Avoid extended slugfests where Olaf's low-health life steal thrives; instead, freeze near your tower and execute hit-and-run short trades: "
            "E in > stun with W > Q > E out before he can retaliate. At level 6, never waste your Empowered W on his Ragnarok (R) since he is CC-immune; "
            "activate Dominus (R), kite back with E, and re-engage with maximum burst the second his ultimate fades."
        )
    },
    "Orianna": {
        "pt": (
            "Orianna na rota solo tenta manter Renekton distante com o controle de zona de sua Esfera (Q/W) e ataques básicos passivos reforçados. "
            "No nível 1, comece com E para punir o posicionamento dela através de trocas com PTA/Conquistador (E1 > auto-ataques > E2 para recuar). "
            "Construa Doran's Shield e Passos de Mercúrio para amortecer o poke e desacelerações de Orianna. "
            "No nível 3 e 6, utilize o avanço duplo do E nos minions para fechar a distância num piscar de olhos, "
            "guardando o W Fortalecido para estilhaçar o escudo protetor da esfera dela e deletá-la com um all-in rápido."
        ),
        "en": (
            "Orianna attempts to zone Renekton away using Ball placement (Q/W) and Clockwork Windup passive basic attacks. "
            "Start E at level 1 to punish her low base durability with sudden gap-close trades (E1 > auto attacks > E2 disengage). "
            "Build Doran's Shield and Mercury's Treads to shrug off her poke and slow zones. At levels 3 and 6, utilize double dashes through the wave "
            "to instantly reach her, reserving your Empowered W to shred her Command: Protect (E) shield and eliminate her before she can reposition."
        )
    },
    "Ornn": {
        "pt": (
            "Ornn é um dos tanques mais resistentes da rota do topo, capaz de criar itens na rota e aplicar dano percentual com Quebradiço (W). "
            "No nível 1, use o Q para empurrar a onda e buscar a vantagem de nível 2, desviando do Fogo Fátuo (W) para não sofrer o auto-ataque com Quebradiço. "
            "Em trocas, desvie da ruptura (Q) e do pilar de Ornn com o seu E. "
            "O grande diferencial do Renekton no meio do jogo é utilizar o E2 Fortalecido (Cortar) para triturar até 35% da armadura colossal de Ornn, "
            "combinado com Cutelo Negro ou Espada do Rei Destruído para derreter a vida massiva dele em duelos na rota lateral."
        ),
        "en": (
            "Ornn is a premier tank with high innate durability and heavy percentage damage from Bellows Breath (W) Brittle procs. "
            "At level 1, push with Q for the level 2 advantage while side-stepping his breath to avoid Brittle auto attacks. "
            "Use your E mobility to evade his Q pillar and Searing Charge (E) knockup. Renekton's ultimate counter to Ornn's armor stacking "
            "is utilizing Empowered E2 (Dice) to shred 35% of Ornn's total armor, pairing with Black Cleaver or Blade of the Ruined King to melt him in side lanes."
        )
    },
    "Pantheon": {
        "pt": (
            "Pantheon é um oponente extremamente agressivo no início, graças ao baixo tempo de recarga da Lança Meteórica (Q) e ao all-in de nível 2-3. "
            "No nível 1, respeite o alcance do Q dele e evite trocas desfavoráveis. "
            "O segredo para vencer o confronto é gerenciar a Égide Impenetrável (E) de Pantheon: nunca solte seu W Fortalecido ou Q na frente do escudo invulnerável dele. "
            "Aguarde o término do E de Pantheon ou use o dash do E do Renekton para passar para trás dele e desferir o combo completo. "
            "Após o nível 6 com o Dominus (R) e Botas Galvanizadas, Renekton supera amplamente Pantheon em estatísticas de combate direto."
        ),
        "en": (
            "Pantheon possesses relentless early aggression through low-cooldown Comet Spears (Q) and an explosive level 2-3 empowered stun combo. "
            "Respect his early spear range during level 1 and conserve your health pool. The pivotal mechanic is playing around Aegis Assault (E): "
            "never discharge your Empowered W or Q directly into his frontal invulnerability shield. Either dash behind him with E or wait out the shield "
            "before unloading your full burst. Post-6 with Dominus (R) and Plated Steelcaps, Renekton heavily outscales and stat-checks Pantheon in duels."
        )
    },
    "Poppy": {
        "pt": (
            "Poppy busca punir Renekton contra paredes com o Encontrão (E) e anular seus avanços com o Presença Inabalável (W). "
            "No nível 1, comece com Q para contestar a pressão de onda e empurrar para o nível 2, mantendo-se sempre afastado de paredes. "
            "Ao realizar trocas no nível 3+, tenha cautela extrema ao usar o E: se o W de Poppy estiver ativo, seu dash será interrompido com atordoamento. "
            "Faça trocas a pé (andando até ela, aplicando auto + W Fortalecido para estourar o escudo da passiva dela e finalizando com Q), "
            "guardando os dashes do E para desengajar ou perseguir apenas após o W de Poppy expirar."
        ),
        "en": (
            "Poppy aims to pin Renekton against terrain with Heroic Charge (E) and neutralize dashes using Steadfast Presence (W). "
            "Start Q at level 1 to push for priority while staying strictly clear of lane walls. In levels 3+, exercise extreme caution with your E: "
            "dashing into her active W grounding ring will interrupt your mobility and leave you grounded. Instead, initiate trades on foot "
            "(walk up, AA + Empowered W to break her passive buckler shield, then Q), saving your E dashes to disengage once her grounding field expires."
        )
    },
    "Pyke": {
        "pt": (
            "Pyke na rota solo é um campeão volátil que aposta em puxões com Espeto de Peixe (Q) e atordoamentos com Ressaca Espectral (E). "
            "No entanto, sua fragilidade e incapacidade de converter vida bônus tornam o confronto muito favorável para Renekton. "
            "No nível 1, use o Q para obter vantagem de onda. Quando Pyke tentar carregar o Q ou avançar com o E, desvie lateralmente com seu E e trave-o com W. "
            "O W Fortalecido do Renekton combinado com Pressione o Ataque (PTA) é capaz de explodir 70%+ do HP de Pyke em uma única rotação. "
            "Não estenda perseguições longas se ele ativar o W na névoa e domine as trocas com all-ins letais."
        ),
        "en": (
            "Solo lane Pyke relies on fishing for Bone Skewer (Q) pulls and Phantom Undertow (E) stuns, but his extreme squishiness and inability to gain bonus HP "
            "make him exceptionally vulnerable to Renekton. Start Q at level 1 for wave control. When Pyke winds up his hook or dashes with E, "
            "sidestep with your E and lock him down with W. Renekton's Empowered W with Press the Attack can delete over 70% of Pyke's health bar in one rotation. "
            "Avoid chasing blindly into stealth and force decisive lethal all-ins in lane."
        )
    },
    "Qiyana": {
        "pt": (
            "Qiyana possui altíssimo potencial de burst e invisibilidade com o elemento grama, mas é frágil contra a robustez de Renekton. "
            "No nível 1, comece com Q para controlar a onda e punir aproximações no corpo a corpo. "
            "Quando Qiyana usar o avanço (E) em você ou pegar o elemento rio/grama, absorva a troca inicial e contra-ataque instantaneamente com W Fortalecido + Q + auto-ataques. "
            "Compre Botas Galvanizadas ou Eclipse para mitigar a letalidade dela. No nível 6, fique atento ao posicionamento perto de paredes e arbustos para "
            "não tomar o atordoamento do R (Suprema Demonstração de Talento) de Qiyana, respondendo com Dominus (R) e all-in mortal."
        ),
        "en": (
            "Qiyana brings high burst mobility and stealth from grass elements, but she lacks the sustained durability to survive Renekton's counter-burst. "
            "Start Q at level 1 for priority. When she dashes in with E or elements, absorb the opening hit and retaliate immediately with Empowered W + Q + autos. "
            "Rush Plated Steelcaps or Eclipse to nullify her lethality spikes. At level 6, maintain safe spacing from lane walls to prevent getting stunned by Supreme Display of Talent (R), "
            "activating Dominus (R) to out-stat and overwhelm her."
        )
    },
    "Rammus": {
        "pt": (
            "Rammus na rota superior foca em empilhar armadura, refletir dano com a Carapaça Pontuda (W) e forçar duelos com a Provocação (E). "
            "No início da partida, abuse da fraqueza dele: comece com Q para pokear e empurrar a onda sem sofrer dano refletido. "
            "A regra de ouro contra Rammus é nunca usar auto-ataques rápidos ou o W Fortalecido enquanto o W defensivo dele estiver ativado. "
            "Aguarde o escudo de espinhos dele desativar, use o E2 Fortalecido para rasgar 35% da armadura dele e finalize com Cutelo Negro e Espada do Rei Destruído."
        ),
        "en": (
            "Top lane Rammus stacks heavy armor, taunts with Frenzying Taunt (E), and reflects auto-attack damage through Defensive Ball Curl (W). "
            "Abuse his early weakness by starting Q to harass and waveclear without triggering return damage. The golden rule against Rammus: "
            "never dump auto attacks or Empowered W while his Defensive Ball Curl is active. Wait out his defensive stance, then apply Empowered E2 (Dice) "
            "to shred 35% of his armor, melting him down with Black Cleaver and Blade of the Ruined King."
        )
    },
    "Rek'Sai": {
        "pt": (
            "Rek'Sai na rota superior possui forte sustento com sua passiva de fúria e arremessos ao sair da escavação (W). "
            "No nível 1, comece com Q para obter vantagem de onda e manter a pressão de fúria alta. "
            "Ao lutar contra Rek'Sai, fique atento ao momento em que ela está escavada: utilize o E para desviar do arremesso dela ou absorva com Dominus (R) "
            "e responda imediatamente com W Fortalecido. "
            "Acelere a compra de Corta-Cura (Golpe do Carrasco) e Botas Galvanizadas para anular o sustento da escavação dela e vença todas as trocas curtas com E > W > Q > E."
        ),
        "en": (
            "Solo lane Rek'Sai relies on passive burrow healing and knockups from Unburrow (W). Start Q at level 1 to maintain wave control and build early fury. "
            "When trading, watch her burrowed state: dodge the direct knockup with E or absorb it with Dominus (R), instantly locking her down with Empowered W. "
            "Build early anti-heal and Plated Steelcaps to suppress her regeneration, consistently winning trades with clean E > W > Q > E rotations."
        )
    },
    "Rell": {
        "pt": (
            "Rell possui lentidão extrema ao desmontar com o W (Queda Estilhaçante) e depende de escudos temporários para sobreviver. "
            "No nível 1, Renekton pode puni-la livremente com Q e controle de onda. "
            "Quando Rell desmontar e ganhar o escudo massivo, ative o W Fortalecido do Renekton para quebrar 100% do escudo instantaneamente, "
            "causando dano devastador à vida desprotegida dela. "
            "Aproveite a baixa velocidade de movimento de Rell desmontada para aplicar auto-ataques contínuos e garantir abates tranquilos na rota."
        ),
        "en": (
            "Rell suffers extreme self-slow in dismounted form and relies heavily on crash-down shields. Start Q at level 1 for complete lane dominance. "
            "The defining counter-mechanic in this matchup: whenever Rell crashes down and gains her massive shield, Renekton's Empowered W instantly breaks 100% "
            "of the shield before dealing full damage, obliterating her unarmored HP. Exploit her sluggish dismounted movement speed to run her down in lane."
        )
    },
    "Renata Glasc": {
        "pt": (
            "Renata Glasc é uma suporte de controle e desengaje frágil em rota solo. "
            "No nível 1, inicie com E para fechar a distância nos minions e aplicar a troca com PTA/Conquistador (E1 > auto-ataques > E2). "
            "Desvie do projétil do Aperto de Mão (Q) de Renata com seu segundo dash e force all-ins no nível 3+. "
            "Se Renata usar o Empréstimo (W) para salvar a si mesma da morte, apenas recue com o E ou use o stun do W para que o tempo da habilidade expire e ela morra sozinha."
        ),
        "en": (
            "Renata Glasc is a frail utility enchanter who struggles severely against aggressive gap-closers in a solo lane. "
            "Start E at level 1 to jump on her immediately (E1 > 3 autos for PTA > E2 back). Dodge her Handshake (Q) hook using your second dash, then force relentless level 3+ all-ins. "
            "If she casts Bailout (W) on herself to delay death, simply kite back with E and let the burn timer eliminate her."
        )
    },
    "Rengar": {
        "pt": (
            "Rengar no topo abusa dos saltos contínuos dos arbustos e da fúria para buscar abates no nível 1 com o Q Fortalecido. "
            "Não lute perto dos arbustos no nível 1; mantenha a onda de minions no centro da rota e comece de W ou Q. "
            "Quando Rengar pular em você, trave-o imediatamente com o W Fortalecido, absorva a investida e aplique o Q para curar. "
            "Compre Botas Galvanizadas o mais rápido possível e congele a onda perto da sua torre; sem o elemento surpresa dos arbustos, Rengar perde todos os duelos diretos contra Renekton."
        ),
        "en": (
            "Top lane Rengar relies on bush leap ferocity stacks and level 1 Savagery (Q) cheese. Never fight inside bush proximity at level 1; "
            "pull the minion wave toward the center and start W or Q. The moment Rengar leaps onto you, immediately stun him with Empowered W, absorb the trade, "
            "and heal with Q. Rush Plated Steelcaps early and freeze near your turret; stripped of bush resets, Rengar cannot withstand Renekton's superior brawling power."
        )
    },
    "Riven": {
        "pt": (
            "O confronto contra Riven é um dos duelos mais clássicos e favoráveis para Renekton, desde que jogado com disciplina no nível 1. "
            "Comece com W no nível 1 para quebrar a agressão do combo de Qs de Riven: quando ela avançar com Q1/Q2, use AA + W para aplicar atordoamento e PTA, "
            "desengajando antes do Q3. "
            "A grande arma de Renekton é o W Fortalecido, que quebra instantaneamente 100% do escudo de Valor (E) de Riven antes de aplicar o dano total. "
            "No nível 6, ative o Dominus (R) cedo para ganhar vida e fúria, não gaste o E2 para frente se ela tiver o atordoamento do W pronto, "
            "e execute-a respeitando o dano de execução do Golpe de Vento."
        ),
        "en": (
            "The Riven matchup is a legendary skill duel heavily favored for Renekton when executed with level 1 discipline. "
            "Start W at level 1 to counter her early Q combo: when she approaches with Q1/Q2, trade AA + W stun to trigger PTA and disengage before her Q3 knockup lands. "
            "Renekton's premier trump card is Empowered W, which instantly shatters 100% of Riven's Valor (E) shield before dealing massive burst damage. "
            "At level 6, pop Dominus (R) early for immediate HP and fury generation, never dash recklessly into her W stun, and burst her down while respecting her Wind Slash execute."
        )
    },
    "Rumble": {
        "pt": (
            "Rumble possui dano massivo e contínuo com o Cospe-Fogo (Q) na Zona de Perigo (50+ de Aquecimento). "
            "No nível 1, comece com E para esquivar do fogo e puni-lo em trocas rápidas, ou jogue pelo recuo até atingir o nível 3. "
            "O momento ideal de all-in no Rumble é quando ele superaquece (100% de calor) sem habilidades ou logo após ele gastar o Escudo de Sucata (W). "
            "Acelere Passos de Mercúrio ou Hexdrinker para neutralizar o dano mágico dele e use W Fortalecido para estourar o escudo de sucata e finalizá-lo."
        ),
        "en": (
            "Rumble delivers intense sustained magic damage with Flamespitter (Q) in the Danger Zone (50+ Heat). "
            "Start E at level 1 to evade frontal flames and execute quick trades, or play defensively until hitting level 3. "
            "The prime window to all-in Rumble is right after he overheats without spells or immediately following his Scrap Shield (W) cooldown. "
            "Rush Mercury's Treads or Hexdrinker to dampen his magic damage, then destroy his shield with Empowered W for easy solo kills."
        )
    },
    "Ryze": {
        "pt": (
            "Ryze tenta controlar a rota com combos de Sobrecarga (Q) e Prisão de Runa (W) enquanto mantém distância. "
            "No nível 1, comece com E para surpreendê-lo com trocas agressivas usando PTA (E1 > auto-ataques > E2). "
            "A partir do nível 3, use o E nos minions para fechar a distância num piscar de olhos e aplique o W Fortalecido antes que Ryze consiga enraizá-lo. "
            "Construa Passos de Mercúrio para reduzir a duração do enraizamento e Eclipse/Hexdrinker para explodir a barra de vida frágil de Ryze antes que ele complete a Lágrima da Deusa."
        ),
        "en": (
            "Ryze relies on Overload (Q) poke and Rune Prison (W) root combos while maintaining maximum distance. "
            "Start E at level 1 to catch him off-guard with immediate PTA trades (E1 > autos > E2). "
            "From level 3 onwards, utilize double E dashes through the minion wave to instantly reach him, locking him with Empowered W before he can react with his root. "
            "Build Mercury's Treads to minimize CC duration along with Eclipse or Hexdrinker to burst down his squishy health pool."
        )
    },
    "Samira": {
        "pt": (
            "Samira na rota solo depende de combos rápidos de espada/pistola para empilhar sua nota de estilo até o R (Gatilho Infernal). "
            "No nível 1, comece com E para trocas agressivas com PTA. "
            "A chave deste confronto é que o W (Turbilhão de Lâminas) de Samira bloqueia apenas projéteis — ou seja, ele NÃO bloqueia o W nem o Q do Renekton. "
            "Sempre guarde o W do Renekton para interromper instantaneamente a canalização do R de Samira quando ela atingir nota S, "
            "anulando completamente o dano de execução dela e garantindo o abate."
        ),
        "en": (
            "Solo lane Samira attempts to weave sword/gun combos to stack style rank into her Inferno Trigger (R). "
            "Start E at level 1 for strong PTA trading priority. The crucial matchup interaction: Samira's Blade Whirl (W) only blocks projectiles — it DOES NOT block Renekton's W or Q. "
            "Always save Renekton's W stun to instantly cancel Samira's ultimate channel the moment she triggers rank S, completely shutting down her teamfight threat."
        )
    },
    "Sejuani": {
        "pt": (
            "Sejuani na rota superior possui altíssima resistência com a Armadura Congelada da passiva e forte controle com o E (Congelamento Permanente). "
            "No nível 1, comece com E ou Q e remova a armadura passiva dela com um auto-ataque ou Q antes de iniciar trocas pesadas. "
            "Use o duplo dash do E para desviar do Investida do Ártico (Q) de Sejuani e puni-la quando ela errar. "
            "No mid game, o E2 Fortalecido do Renekton rasga a armadura acumulada de Sejuani, permitindo que você a derreta com Cutelo Negro e Espada do Rei Destruído."
        ),
        "en": (
            "Top lane Sejuani relies on Frost Armor passive for massive early resistance and Permafrost (E) stuns. "
            "Start E or Q at level 1, stripping her passive shield with an auto or Q before committing to heavy trades. "
            "Use double E dashes to dodge Arctic Assault (Q) and punish her long cooldowns. "
            "In the mid game, Empowered E2 (Dice) shreds Sejuani's armor, letting Renekton dismantle her with Black Cleaver and Blade of the Ruined King."
        )
    },
    "Senna": {
        "pt": (
            "Senna possui alcance longo e coleta de almas com a passiva, mas é uma das campeãs mais frágeis de todo o jogo. "
            "No nível 1, inicie com E para realizar a estratégia de gap-close imediato (E1 nos minions > auto-ataques com PTA > recuo com E2). "
            "Desvie do Abraço da Escuridão (W) de Senna com a agilidade dos seus dashes e, no nível 3+, use o Flash + W Fortalecido para deletá-la instantaneamente. "
            "Compre Botas Galvanizadas e itens de Letalidade/Eclipse para eliminá-la em uma única rotação."
        ),
        "en": (
            "Senna boasts immense attack range and soul scaling, but possesses one of the lowest base HP pools in League of Legends. "
            "Start E at level 1 to jump on her directly (E1 > PTA autos > E2 back). Sidestep her Last Embrace (W) root with your dash, and at level 3+, "
            "commit Flash + Empowered W to delete her in a single burst window. Rush Plated Steelcaps and Lethality/Eclipse to crush her in lane."
        )
    },
    "Seraphine": {
        "pt": (
            "Seraphine tenta limpar a onda de longe com notas musicais e o E (Surto de Som). "
            "No nível 1, comece com E para aplicar trocas rápidas com PTA e punir o baixo movimento base dela. "
            "Ao atingir o nível 3, feche a distância com E nos minions, use o W Fortalecido para quebrar instantaneamente o escudo do Som Envolvente (W) dela "
            "e descarregue o combo com Q + Ignite. "
            "O confronto é extremamente favorável para Renekton, que pode transformar a rota em um snowball imparável."
        ),
        "en": (
            "Seraphine attempts to waveclear from extreme range using passive notes and Beat Drop (E). "
            "Start E at level 1 to exploit her sluggish base movement speed with immediate PTA trades. "
            "At level 3+, gap close through the wave with E, use Empowered W to immediately destroy her Surround Sound (W) shield, and burst her with Q + Ignite. "
            "Renekton easily dominates this lane and snowballs with ease."
        )
    },
    "Sett": {
        "pt": (
            "Sett é um valentão de rota com forte dano físico, atordoamento no Quebra-Crânio (E) e escudo colossal com Casca Grossa (W). "
            "No nível 1, evite trocas longas contra os socos duplos dele; comece de Q para pokear na distância máxima ou de W para responder all-in. "
            "A grande chave tática deste confronto: NUNCA tome o dano verdadeiro no centro do W de Sett (esquive lateralmente com o E). "
            "Além disso, quando Sett ativar o W e ganhar a barra inteira de escudo cinza, use o W Fortalecido do Renekton para quebrar 100% do escudo dele "
            "instantaneamente, virando a luta a seu favor de forma esmagadora."
        ),
        "en": (
            "Sett is a ferocious lane bully with heavy right-hook damage, Facebreaker (E) stuns, and a massive Haymaker (W) grit shield. "
            "At level 1, avoid extended slugfests and poke at max range with Q. The critical counter-play: NEVER take true damage from the center of Sett's Haymaker (dash laterally with E). "
            "Furthermore, when Sett pops his full grit shield, Renekton's Empowered W completely breaks 100% of the shield instantaneously, turning the fight into a decisive Renekton victory."
        )
    },
    "Shaco": {
        "pt": (
            "Shaco na rota do topo tenta atrair Renekton para caixas surpresa (W) e enganar com a invisibilidade do Enganar (Q). "
            "No nível 1, comece com E ou Q e não persiga Shaco para dentro dos arbustos sem visão. "
            "Compre a Lente do Oráculo (Trinket Vermelho) cedo para revelar as caixas e a silhueta de Shaco invisível. "
            "Quando Shaco utilizar o Alucinação (R) no nível 6, identifique o verdadeiro (que recebe dano normal e usa habilidades) "
            "e destrua-o com o W Fortalecido, evitando matar o clone colado a você para não tomar o dano de explosão e medo."
        ),
        "en": (
            "Top lane Shaco relies on baiting Renekton into Jack in the Box (W) nests and Deceive (Q) stealth ambushes. "
            "Start E or Q at level 1 and never chase him blindly into unwarded bushes. Buy an early Oracle Lens (Sweeper) to reveal boxes and his invisible silhouette. "
            "At level 6 when he casts Hallucinate (R), identify the real Shaco and burst him down with Empowered W, keeping distance from the clone explosion."
        )
    },
    "Shen": {
        "pt": (
            "Shen busca dominar trocas curtas com o Ataque do Crepúsculo (Q puxando a espada através de você) e bloquear auto-ataques com o Refúgio Espiritual (W). "
            "No nível 1, preste atenção na posição da espada espiritual: não deixe Shen puxar o Q através de você. "
            "A mecânica fundamental deste confronto: NUNCA gaste o W do Renekton enquanto a zona do W de Shen estiver ativa, pois seu atordoamento será bloqueado. "
            "Aguarde o círculo de defesa dele sumir, aplique o W Fortalecido para estourar o escudo da passiva dele e dê trocas com Q. "
            "No nível 6, use o W para cancelar a canalização da ult global de Shen (Manter a União) e impedi-lo de salvar aliados pelo mapa."
        ),
        "en": (
            "Shen aims to win trades by dragging Twilight Assault (Q) through you for enhanced damage and blocking autos with Spirit's Refuge (W). "
            "At level 1, watch his sword placement to prevent spirit blade drag-throughs. The essential rule: NEVER cast Renekton's W while Shen's W zone is active, "
            "as your stun will be completely blocked. Wait out his defensive zone, then strike with Empowered W to crush his passive shield. At level 6, use your W stun to interrupt Shen's global R channel."
        )
    },
    "Shyvana": {
        "pt": (
            "Shyvana na rota superior depende do Hálito Flamejante (E) para aplicar marcas percentuais e queimar em trocas corpo a corpo. "
            "No início da partida, Renekton possui vantagem absoluta de pressão: comece com Q para empurrar a onda e buscar o nível 2 rápido. "
            "Desvie do projétil do E de Shyvana com o seu E e castigue-a com trocas curtas de W Fortalecido + Q. "
            "No nível 6, use o Dominus (R) para igualar o aumento de vida do R de Shyvana e use o E2 Fortalecido para triturar a armadura passiva dela."
        ),
        "en": (
            "Top lane Shyvana relies on landing Flame Breath (E) marks to shred max HP in melee trades. "
            "Renekton holds overwhelming early game priority: start Q to control the wave and secure level 2. "
            "Dodge her E skillshot with your dash and punish her with Empowered W + Q rotations. At level 6, match her dragon form with Dominus (R) and shred her passive armor with Empowered E2."
        )
    },
    "Singed": {
        "pt": (
            "Singed busca criar caos correndo na frente com o Rastro de Veneno (Q) e arremessar Renekton com o Lançar (E). "
            "A regra universal contra Singed: NUNCA persiga Singed em linha reta dentro do veneno. "
            "No nível 1, comece com Q ou W para controlar a onda e impedir que ele faça proxy livre atrás das torres. "
            "Em trocas, use o E para alcançar o lado de Singed, aplique AA + W Fortalecido + Q e use o E2 para recuar em direção aos seus minions. "
            "Compre Passos de Mercúrio e Cutelo Negro para mitigar a lentidão do Mega-Adesivo (W) e vencê-lo facilmente no split push."
        ),
        "en": (
            "Singed aims to proxy farm waves and bait Renekton into chasing his Poison Trail (Q). "
            "The timeless rule: NEVER chase Singed directly in his poison cloud. Start Q or W at level 1 to defend the wave and punish early proxy attempts. "
            "Trade smartly: E onto his flank, AA + Empowered W + Q, then E2 backward toward your minions. Build Mercury's Treads and Black Cleaver to neutralize his Mega Adhesive (W) slow."
        )
    },
    "Sion": {
        "pt": (
            "Sion é um tanque de alta vida que busca empurrar a rota com o Golpe Demolidor (Q) e escalar com a passiva do W. "
            "Renekton é um dos maiores counters de Sion: comece com Q no nível 1 para empurrar para o nível 2. "
            "A mecânica que anula completamente Sion: sempre que ele começar a canalizar o Q com o machado no chão, use o W do Renekton para atordoá-lo e CANCELAR a canalização na hora! "
            "Além disso, o W Fortalecido quebra 100% do escudo do W de Sion antes que ele possa detoná-lo. "
            "Com Cutelo Negro e Espada do Rei Destruído, Renekton domina Sion do início ao fim da partida."
        ),
        "en": (
            "Sion stacks immense bonus health while looking to charge Decimating Smash (Q) channels. "
            "Renekton is a premier hard counter to Sion: start Q at level 1 for wave priority. The defining counter-play: whenever Sion channels his Q axe swing, "
            "instantly stun him with Renekton's W to CANCEL his channel on the spot! Furthermore, Empowered W instantly breaks Sion's Soul Furnace (W) shield before detonation. "
            "With Black Cleaver and BoTRK, Renekton dominates Sion throughout the entire game."
        )
    },
    "Sivir": {
        "pt": (
            "Sivir na rota solo possui bom alcance com a Lâmina Bumerangue (Q) e defesa com o Escudo de Feitiço (E). "
            "No nível 1, comece com E para trocas agressivas imediatas (E1 > auto-ataques > E2). "
            "O detalhe crucial do confronto: quebre o Escudo de Feitiço (E) de Sivir com o dano em área do Q ou com o primeiro dash do E antes de soltar o W Fortalecido. "
            "Sem o escudo, Sivir não tem como escapar do atordoamento e sucumbe instantaneamente ao dano letal de Renekton com Dominus (R) e Ignite."
        ),
        "en": (
            "Solo lane Sivir offers waveclear with Boomerang Blade (Q) and defense through Spell Shield (E). "
            "Start E at level 1 for instant PTA gap-close trades. The crucial interaction: bait or pop her Spell Shield using Q AoE or E1 dash before landing your Empowered W stun. "
            "Stripped of her spell shield, Sivir has zero defense against Renekton's Dominus (R) all-in burst."
        )
    },
    "Skarner": {
        "pt": (
            "Skarner no topo traz controle de grupo com pedras arremessadas (Q) e avanço através do terreno (E). "
            "No nível 1, comece com Q para pokear e empurrar a onda para pegar o nível 2 primeiro. "
            "Desvie da trajetória de Skarner quando ele carregar com o E nas paredes usando o dash do seu E. "
            "Use o W Fortalecido para punir os escudos que Skarner gerar com o W e utilize o E2 Fortalecido para reduzir a armadura pesada dele. "
            "Mantenha-se afastado de torres inimigas no nível 6 para não ser arrastado pelo Impalar (R) de Skarner."
        ),
        "en": (
            "Top lane Skarner relies on boulder throws (Q) and terrain burrow charges (E). Start Q at level 1 to secure early wave dominance and level 2 priority. "
            "Use your E dash to sidestep his charging path when he charges through walls. Break his W shield with Empowered W and shred his bonus armor with Empowered E2 (Dice). "
            "Stay clear of enemy turret range at level 6 to avoid getting dragged under tower by Impale (R)."
        )
    },
    "Smolder": {
        "pt": (
            "Smolder é um atirador de escalonamento infinito que precisa coletar acúmulos com o Q (Super-Hálito Flamejante) no início. "
            "Renekton deve ser implacável nos níveis 1 a 6 para negar os acúmulos dele: comece com E no nível 1 e faça trocas com PTA. "
            "Quando Smolder tentar fugir voando com o E (Voa, Voa, Voa!), feche a distância com o duplo dash do seu E e trave-o com o W Fortalecido. "
            "Feche itens de Letalidade/Eclipse e encerre a partida com pressão no mid game antes que Smolder atinja os 225 acúmulos de execução no late game."
        ),
        "en": (
            "Smolder is an infinite-scaling marksman reliant on stacking Super Scorcher Breath (Q). "
            "Renekton must play relentlessly aggressive from levels 1 to 6 to deny his stacks: start E at level 1 for heavy PTA trades. "
            "When Smolder takes flight with Flap, Flap, Flap (E), chase him down with double E dashes and lock him with Empowered W. "
            "Rush Lethality/Eclipse to snowball the game before Smolder reaches his 225-stack execute threshold."
        )
    },
    "Sona": {
        "pt": (
            "Sona é uma campeã frágil que não tem ferramentas para resistir à investida física de Renekton. "
            "No nível 1, inicie com E para realizar a troca clássica de PTA (E1 > 3 auto-ataques > E2). "
            "A partir do nível 3, qualquer avanço de E1 + E2 com W Fortalecido e Q resulta em abate imediato ou força o Flash dela. "
            "Aproveite a facilidade da rota para criar um freeze, negar 100% do farm dela e snowballar a partida com invasões na selva inimiga."
        ),
        "en": (
            "Sona lacks the base defensive stats to endure Renekton's physical burst. Start E at level 1 for instantaneous PTA trades. "
            "At level 3+, any double dash E combo with Empowered W and Q will result in an instant solo kill or force her Flash. "
            "Freeze the wave, deny her entirely, and translate your massive lane advantage into jungle invades."
        )
    },
    "Soraka": {
        "pt": (
            "Soraka tenta jogar recuada acertando o Q (Chamado Estelar) para se curar e usando o Silêncio (E) para interromper combos. "
            "No nível 1, comece com E para trocas agressivas com PTA. "
            "Ao realizar trocas no nível 3+, saia rapidamente da poça de silêncio (E) de Soraka usando seus dashes antes de ficar enraizado. "
            "Compre Corta-Cura precoce (Golpe do Carrasco) e feche itens de letalidade para explodi-la com W Fortalecido + Ignite sem dar chance de cura."
        ),
        "en": (
            "Soraka aims to poke from afar with Starcall (Q) heals and place Equinox (E) silence zones. "
            "Start E at level 1 for aggressive PTA trades. When diving in at level 3+, step out of her silence pool before the root triggers. "
            "Rush early anti-heal (Executioner's Calling) and burst her with Empowered W + Ignite before her regeneration kicks in."
        )
    },
    "Swain": {
        "pt": (
            "Swain busca puxar com o E (Nunca Mais) e acumular vida com almas passivas. "
            "No nível 1, comece com E para esquivar do retorno do E de Swain e puni-lo no corpo a corpo com PTA. "
            "Nas trocas de nível 3+, desvie do Nevermove de Swain usando seus dashes e trave-o com W Fortalecido. "
            "No nível 6, quando Swain ativar a Ascensão Demoníaca (R), não faça trocas estendidas dentro do círculo dele sem necessidade: "
            "use o E para recuar, aguarde o R dele expirar e retorne com Dominus (R) e all-in mortal com Corta-Cura."
        ),
        "en": (
            "Swain relies on landing Nevermove (E) roots and stacking soul fragments. Start E at level 1 to dodge his root return and punish him with PTA autos. "
            "In level 3+ trades, dodge his E with your dashes and lock him with Empowered W. At level 6 when Swain triggers Demonic Ascension (R), "
            "kite out of his drain zone with E, wait out his ultimate, and re-engage with Dominus (R) and anti-heal for an easy kill."
        )
    },
    "Sylas": {
        "pt": (
            "Sylas é um duelista mágico que depende de acertar o E2 (Abdução) e curar com o W (Regicida). "
            "No nível 1, comece com Q para obter vantagem de onda ou com W para punir avanços precoces dele. "
            "O ponto crítico contra Sylas: use o seu E para desviar das correntes do E2 dele. Se Sylas errar o E2, ele perde a maior parte do dano e mobilidade da troca. "
            "Guarde seu W Fortalecido para punir a aproximação dele e compre Golpe do Carrasco ou Passos de Mercúrio para cortar a cura massiva do Regicida (W)."
        ),
        "en": (
            "Sylas is a volatile skirmisher who relies on hitting Abduct (E2) chains and healing with Kingslayer (W). "
            "Start Q at level 1 for wave priority or W to punish early aggression. The pivotal counter-play: use your E dash to dodge his E2 chains. "
            "If Sylas misses E2, he loses the trade entirely. Punish his engage with Empowered W and build early anti-heal (Executioner's) or Merc Treads to counter Kingslayer healing."
        )
    },
    "Syndra": {
        "pt": (
            "Syndra na rota solo mantém distância com esferas sombrias e o empurrão do Dispersar os Fracos (E). "
            "No nível 1, inicie com E para realizar a troca com PTA (E1 > auto-ataques > E2). "
            "Nas trocas do nível 3+, use o primeiro dash do E para forçar o empurrão (E) de Syndra; em seguida, use o segundo dash (E2) ou Flash para alcançá-la "
            "e execute-a com W Fortalecido + Q. "
            "Construa Passos de Mercúrio e Hexdrinker para anular o burst de poder de Syndra no nível 6."
        ),
        "en": (
            "Solo lane Syndra zones with Dark Spheres and Scatter the Weak (E) knockbacks. Start E at level 1 for instant PTA trades. "
            "At level 3+, use your first E dash to bait her E knockback, then follow up with E2 or Flash to close the gap and execute with Empowered W + Q. "
            "Build Mercury's Treads and Hexdrinker to survive her level 6 burst and dominate the lane."
        )
    },
    "Tahm Kench": {
        "pt": (
            "Tahm Kench é um dos tanques mais duráveis e opressivos no 1v1 devido à sua Vida Cinza (E) e lentidão da Língua-Chicote (Q). "
            "No nível 1, empurre a onda com Q para buscar o nível 2 e fique sempre atrás dos seus minions para bloquear o Q dele. "
            "Evite trocas prolongadas onde Tahm Kench possa acumular 3 marcas da passiva e devorar você. "
            "A grande arma do Renekton contra Tahm Kench é o W Fortalecido: quando Tahm Kench ativar o escudo cinza gigante com o E, "
            "use o W Fortalecido para estilhaçar 100% do escudo instantaneamente, virando o duelo a seu favor com Cutelo Negro."
        ),
        "en": (
            "Tahm Kench is an oppressive tank duelist with Thick Skin (E) grey health shields and Tongue Lash (Q) slows. "
            "Start Q at level 1 to push for level 2, standing behind your minion wave to block his Q tongue lashes. "
            "Avoid extended slugfests that allow him to stack 3 passive stacks. Renekton's ultimate counter-play: when Tahm Kench activates his massive E grey health shield, "
            "Renekton's Empowered W instantly breaks 100% of the shield, securing winning duels with Black Cleaver."
        )
    },
    "Taliyah": {
        "pt": (
            "Taliyah tenta controlar Renekton com o lançamento de pedras (Q) e o campo minado da Terra Desfiada (E). "
            "No nível 1, comece com E para realizar trocas agressivas rápidas e tome Doran's Shield para sustentar o poke. "
            "Cuidado essencial: NUNCA use o dash do E do Renekton através do campo minado (E) de Taliyah, pois você tomará dano massivo de explosão e atordoamento. "
            "Aguarde o término das pedras no chão ou contorne o campo minado para aplicar o W Fortalecido e eliminá-la instantaneamente."
        ),
        "en": (
            "Taliyah seeks to kite with Threaded Volley (Q) and Unraveled Earth (E) minefields. Start E at level 1 with Doran's Shield for early sustain. "
            "Vital rule: NEVER dash with Renekton's E through Taliyah's active E boulder field, as doing so detonates the mines and stuns you. "
            "Wait out the minefield or flank around it to lock her down with Empowered W."
        )
    },
    "Talon": {
        "pt": (
            "Talon possui um nível 1 e 2 perigosos devido ao dano da passiva (Ferida Sangrenta) ao acertar os dois lados do Rastelar (W). "
            "No nível 1, comece com Q ou W e desvie do retorno do W de Talon para não tomar 3 marcas. "
            "O confronto é amplamente favorável para Renekton: quando Talon saltar em você com o Q (Diplomacia Noxiana), trave-o instantaneamente com o W Fortalecido + Q. "
            "Renekton vence com folga todas as trocas diretas; compre Botas Galvanizadas e empurre a onda para prendê-lo na rota e impedir seus roams pelo mapa."
        ),
        "en": (
            "Talon possesses lethal early bleed damage if he lands both parts of Rake (W). Dodge the return arc of his W at level 1 to deny his 3-stack bleed. "
            "The matchup heavily favors Renekton: whenever Talon uses Noxian Diplomacy (Q) into melee range, instantly stun him with Empowered W + Q. "
            "Rush Plated Steelcaps and maintain lane priority to prevent him from roaming across the map."
        )
    },
    "Taric": {
        "pt": (
            "Taric no topo aposta em queijo no nível 1 com a passiva de velocidade de ataque contínua entre feitiços (Bravata) e atordoamento no E (Deslumbrar). "
            "No nível 1, NÃO tente trocar auto-ataques parados com Taric; comece com Q para pokear à distância. "
            "Em trocas, use o seu E para desviar lateralmente do feixe do E de Taric. "
            "O W Fortalecido do Renekton quebra o escudo do W de Taric com facilidade, e no nível 6 com Dominus (R), Renekton atropela Taric assim que o tempo de invulnerabilidade do R dele expirar."
        ),
        "en": (
            "Top lane Taric attempts level 1 cheese with Bravado passive attack speed and Dazzle (E) stuns. "
            "Never stand still trading auto attacks with Taric at level 1; start Q to poke from safety. "
            "Sidestep his E stun beam using your dash. Renekton's Empowered W destroys Taric's W shield, and at level 6 with Dominus (R), "
            "Renekton overpowers Taric the moment his Cosmic Radiance (R) invulnerability fades."
        )
    },
    "Teemo": {
        "pt": (
            "Teemo tenta transformar a rota em um pesadelo com veneno passivo (E), velocidade de movimento (W) e o Tiro Cegante (Q). "
            "No nível 1, use Doran's Shield e Ventos Revigorantes, evitando tomar dano de graça. "
            "A chave tática contra Teemo: NUNCA use o W do Renekton enquanto estiver sob o efeito de Cegueira (Q) de Teemo, pois o atordoamento será desperdiçado. "
            "Faça a aproximação com E1 no minion > E2 no Teemo > absorva o dardo cegante > use o Q para dano e cura > e, assim que a cegueira terminar, "
            "desfira o W Fortalecido para deletá-lo. Compre Passos de Mercúrio e Hexdrinker/Eclipse para dominar o confronto."
        ),
        "en": (
            "Teemo aims to make the lane miserable through Toxic Shot (E) harass, Move Quick (W) kiting, and Blinding Dart (Q). "
            "Start Doran's Shield with Second Wind to absorb early poke. The crucial rule against Teemo: NEVER cast Renekton's W while blinded by Teemo's Q, "
            "as your stun will completely miss. Instead, dash in with E1 > E2 onto Teemo > absorb the blind while using Q for sustain > then land your Empowered W "
            "the exact millisecond the blind expires. Build Mercury's Treads and Hexdrinker/Eclipse to dominate the lane."
        )
    },
    "Thresh": {
        "pt": (
            "Thresh na rota solo tenta puxar para a torre com a Sentença (Q) e controlar com o Esfolar (E). "
            "No nível 1, fique atento a invasões na selva e comece com Q para obter vantagem de onda. "
            "Use seus dashes de E para desviar do gancho de Thresh e caia sobre ele com W Fortalecido. "
            "O W Fortalecido quebra o escudo da Lanterna (W) de Thresh, garantindo all-ins com 100% de letalidade no nível 3 e 6."
        ),
        "en": (
            "Solo lane Thresh looks for Death Sentence (Q) hook setups under tower and Flay (E) disengages. "
            "Watch for early invade setups at level 1 and start Q for wave control. Use your E dashes to dodge his hook and collapse on him with Empowered W. "
            "Empowered W shatters his Dark Passage (W) lantern shield, ensuring easy kills at levels 3 and 6."
        )
    },
    "Tristana": {
        "pt": (
            "Tristana na rota solo possui grande dano com a Carga Explosiva (E) e reset de mobilidade no Salto-Foguete (W). "
            "No início, jogue pelo sustento com Doran's Shield e evite trocas longas que permitam a ela carregar as 4 bombas do E. "
            "Ao atingir o nível 3, espere Tristana gastar o Salto (W) ou feche a distância com E1 nos minions + E2 nela, "
            "aplicando o W Fortalecido instantaneamente para impedi-la de pular para longe. "
            "Compre Botas Galvanizadas e Eclipse para assassiná-la antes que ela consiga responder."
        ),
        "en": (
            "Solo lane Tristana packs high burst with Explosive Charge (E) and Rocket Jump (W) resets. "
            "Play for sustain early with Doran's Shield, avoiding trades that allow her to stack 4 bomb charges. "
            "At level 3, wait for her to use Rocket Jump or close the gap with double E dashes, locking her with Empowered W before she can leap away. "
            "Rush Plated Steelcaps and Eclipse to eliminate her before she can respond."
        )
    },
    "Trundle": {
        "pt": (
            "Trundle é o rei dos duelos corpo a corpo prolongados graças ao roubo de AD da Mordida (Q) e ao Domínio Congelado (W). "
            "A regra de ouro: NUNCA tente trocar auto-ataques no nível 1 com Trundle, pois ele roubará seu AD e vencerá com facilidade. "
            "O método correto de jogar contra Trundle é fazer APENAS trocas curtas com hit-and-run: "
            "E para entrar > W Fortalecido para atordoar > Q para causar dano e curar > E2 para sair imediatamente antes que ele possa morder você de volta. "
            "No nível 6, quando Trundle usar o Subjugar (R) para roubar suas resistências, kite para longe com o E e reengaje após o término da ult dele."
        ),
        "en": (
            "Trundle dominates extended melee slugfests through Chomp (Q) AD steal and Frozen Domain (W). "
            "Golden rule: NEVER duel Trundle in level 1 auto-attack fights, as his Q will steal your attack damage and overwhelm you. "
            "The proper playstyle is strict hit-and-run short trading: E in > Empowered W stun > Q burst and heal > E2 out before he can retaliate with Chomp. "
            "At level 6 when Trundle casts Subjugate (R) to steal your stats, kite back with E and re-engage once his ultimate expires."
        )
    },
    "Tryndamere": {
        "pt": (
            "O confronto contra Tryndamere gira em torno de respeitar os acertos críticos da passiva de fúria dele e gerenciar o all-in no nível 1-2. "
            "No nível 1, se Tryndamere começar a bater na onda para empilhar fúria, comece com W: use AA + W para puni-lo e recue para não trocar auto-ataques longos. "
            "A partir do nível 3, Renekton domina o duelo com trocas curtas (E > W > Q > E out). "
            "Max W após 3 pontos no Q para maximizar o dano de atordoamento. "
            "No nível 6, quando Tryndamere ativar a Fúria Sem Fim (R), NÃO gaste seu W no início da ult dele; kite com o E, ative Dominus (R) e guarde o atordoamento "
            "para os últimos 1,5 segundos da ult de Tryndamere para abatê-lo no momento exato em que a imortalidade dele acabar."
        ),
        "en": (
            "The Tryndamere matchup revolves around respecting Battle Fury critical strike RNG and controlling early wave trades. "
            "Start W at level 1 to punish his early aggression: hit AA + W stun and disengage before he stacks full fury. "
            "From level 3 onwards, Renekton dictates the lane with quick short trades (E in > W > Q > E out). Put 3 points in Q then max W for massive burst. "
            "At level 6 when Tryndamere triggers Undying Rage (R), DO NOT waste your W stun immediately; kite back with E, pop Dominus (R), "
            "and land your W stun during the final 1.5 seconds of his ultimate to execute him the moment invulnerability fades."
        )
    },
    "Twisted Fate": {
        "pt": (
            "Twisted Fate na rota solo aposta em controle de grupo à distância com a Carta Dourada (W) e cartas curinga (Q). "
            "No nível 1, comece com E para aplicar trocas rápidas com PTA (E1 > auto-ataques > E2). "
            "Quando Twisted Fate travar uma carta azul ou vermelha, avance com o E duplo e descarregue o W Fortalecido. "
            "Se ele travar a Carta Dourada, absorva com o primeiro dash ou espere a carta expirar para all-in. "
            "Construa Passos de Mercúrio e Letalidade/Eclipse para destruí-lo com facilidade."
        ),
        "en": (
            "Solo lane Twisted Fate relies on Pick a Card (W) gold card stuns and Wild Cards (Q) poke. "
            "Start E at level 1 for instant PTA trade pressure. Whenever TF locks a blue or red card, dash in with double E and deliver Empowered W. "
            "If he locks a Gold Card, bait it out or dash in immediately to trade. Rush Mercury's Treads and Eclipse to snowball the matchup."
        )
    },
    "Twitch": {
        "pt": (
            "Twitch na rota solo busca criar emboscadas invisíveis com o Emboscada (Q) e acumular veneno com o Contaminar (E). "
            "No nível 1, comece com E para trocas agressivas ou Q para contestar a onda. "
            "Compre a Lente do Oráculo cedo e mantenha a onda sob controle. "
            "Quando Twitch se revelar da invisibilidade, feche a distância instantaneamente com o duplo dash do seu E e execute-o com W Fortalecido + Q + Ignite; "
            "a barra de vida de Twitch é extremamente frágil e ele não tem nenhuma ferramenta de escape contra o atordoamento do Renekton."
        ),
        "en": (
            "Solo lane Twitch looks for Ambush (Q) stealth cheese and Contaminate (E) poison stacks. "
            "Start E or Q at level 1, buy an early Sweeper, and maintain wave control. "
            "The moment Twitch reveals himself from stealth, instantly close the gap with double E dashes and delete him with Empowered W + Q + Ignite; "
            "his fragile health pool offers zero resistance against Renekton's burst."
        )
    },
    "Udyr": {
        "pt": (
            "Udyr possui forte dano isolado na Postura da Garra (Q) ou sustento e desacelerações na Postura da Tempestade (R). "
            "No nível 1, evite trocas isoladas contra a postura da garra desperta de Udyr; comece com Q para farmar e pokear na onda. "
            "A grande vantagem de Renekton neste confronto é a mobilidade superior: faça trocas curtas com E > W Fortalecido > Q > E para recuar. "
            "Quando Udyr usar a Postura do Manto (W) para ganhar escudos, use o W Fortalecido para estourar o escudo instantaneamente e vença o duelo com Cutelo Negro."
        ),
        "en": (
            "Udyr brings heavy single-target burst in Wilding Claw (Q) or waveclear and slows in Wingborne Storm (R). "
            "At level 1, avoid isolated duels against his awakened Q; start Q to farm and poke safely. "
            "Renekton's mobility gives him full control of trades: execute short hit-and-run combos with E > Empowered W > Q > E out. "
            "When Udyr activates Iron Boar (W) shield, shatter it with Empowered W and win duels with Black Cleaver."
        )
    },
    "Urgot": {
        "pt": (
            "Urgot possui alto dano percentual com os tiros da passiva das pernas (Chamas do Eco) e perigo de all-in com o arremesso do Desdém (E). "
            "No nível 1, utilize a estratégia do Alcove com início de E para entrar no arbusto lateral e evitar tomar poke das pernas dele na primeira onda. "
            "O segredo para vencer Urgot: NUNCA seja atingido pelo E (arremesso) de Urgot; desvie do dash dele usando o seu E. "
            "Além disso, quando Urgot ativar o escudo do E ou do W, use o W Fortalecido do Renekton para quebrar 100% do escudo dele instantaneamente. "
            "Compre Botas Galvanizadas e Cutelo Negro, e use o Dominus (R) no nível 6 para ganhar vida e se manter fora do limiar de execução de 25% do R de Urgot."
        ),
        "en": (
            "Urgot outputs heavy percentage damage with passive shotgun knees (Echoing Flames) and lethal all-ins via Disdain (E) flip. "
            "Start E at level 1 and use the top Alcove strategy to avoid getting zoned by his passive knees on wave 1. "
            "The critical counter-play: NEVER get hit by Urgot's E flip; sidestep his charge using your E dash. "
            "When Urgot gains his shield, Renekton's Empowered W instantly destroys 100% of the shield. "
            "Rush Plated Steelcaps and Black Cleaver, activating Dominus (R) to stay safely above his 25% execute threshold."
        )
    },
    "Varus": {
        "pt": (
            "Varus na rota solo aposta em longo alcance com Flecha Perfurante (Q) e dano percentual da aljava (W). "
            "No nível 1, comece com E e utilize a estratégia do Alcove para não ser afastado da onda de minions. "
            "Mantenha seu HP alto usando Doran's Shield e Ventos Revigorantes. "
            "A partir do nível 3, use os minions para avançar com o E duplo, alcance Varus e execute-o com W Fortalecido + Q + Ignite. "
            "Feche Botas Galvanizadas ou Passos de Mercúrio e finalize itens de Letalidade/Eclipse para explodi-lo antes que ele consiga responder."
        ),
        "en": (
            "Solo lane Varus relies on long-range Piercing Arrow (Q) poke and Blighted Quiver (W) percent damage. "
            "Start E at level 1 using the Alcove strategy to prevent getting zoned off wave 1 XP. "
            "Conserve your health pool with Doran's Shield and Second Wind. At level 3+, dash through the wave with double E, "
            "bursting him with Empowered W + Q + Ignite. Build Plated Steelcaps/Merc Treads and Lethality/Eclipse to crush him in lane."
        )
    },
    "Vayne": {
        "pt": (
            "Vayne no topo é um confronto opressivo à distância que exige paciência extrema nos níveis 1 e 2. "
            "No nível 1, use o E para entrar no Alcove e evitar tomar auto-ataques gratuitos; deixe a onda empurrar para perto da sua torre. "
            "Nunca fique perto de paredes para não ser atordoada pelo Condenar (E) de Vayne. "
            "Ao atingir o nível 3 e especialmente no nível 6, feche a distância com E1 nos minions; quando Vayne usar o Condenar (E) para empurrar você, "
            "utilize o Flash + W Fortalecido + Dominus (R) para deletá-la instantaneamente. "
            "Compre Botas Galvanizadas com urgência e feche Limiar da Noite ou Eclipse para anular o desengaje dela."
        ),
        "en": (
            "Top lane Vayne is an oppressive ranged matchup requiring immense discipline during levels 1-2. "
            "Start E at level 1 and use the Alcove to avoid free harass, letting the wave bounce toward your turret. "
            "Never position near lane walls to avoid Condemn (E) stuns. At level 3 and 6, gap-close with E1 through minions; "
            "the moment Vayne uses Condemn to push you away, follow up with Flash + Empowered W + Dominus (R) to obliterate her health bar. "
            "Rush Plated Steelcaps early and build Edge of Night or Eclipse to negate her disengage."
        )
    },
    "Veigar": {
        "pt": (
            "Veigar tenta farmar acúmulos com o Golpe Maligno (Q) e se proteger com o Horizonte de Eventos (E). "
            "No nível 1, comece com E para trocas agressivas com PTA (E1 > auto-ataques > E2). "
            "Ao realizar trocas no nível 3+, use o dash para se posicionar antes que a gaiola de Veigar se forme ou aguarde dentro do círculo sem tocar nas bordas "
            "para descarregar o W Fortalecido no momento em que ele se aproximar. "
            "Construa Passos de Mercúrio e Hexdrinker para anular completamente o dano de execução do R de Veigar."
        ),
        "en": (
            "Veigar seeks to stack AP via Baleful Strike (Q) while relying on Event Horizon (E) cage for safety. "
            "Start E at level 1 for heavy PTA trades. At level 3+, dash inside his range before his cage activates or wait safely inside the perimeter "
            "without touching the stun walls to land your Empowered W. Build Mercury's Treads and Hexdrinker to neutralize his Primordial Burst (R) execute."
        )
    },
    "Vel'Koz": {
        "pt": (
            "Vel'Koz busca jogar no alcance máximo com Fissão Plasmática (Q) e Ruptura Tectônica (E). "
            "No nível 1, inicie com E ou Q e utilize Doran's Shield com Ventos Revigorantes para absorver o poke. "
            "Use o duplo dash do E nos minions para fechar a distância num piscar de olhos, desviando do arremesso (E) de Vel'Koz. "
            "Assim que alcançá-lo, o W Fortalecido com PTA é suficiente para eliminá-lo em uma única rotação. "
            "No nível 6, guarde o stun do W ou o segundo dash para interromper a canalização do Raio Desintegrador de Formas Vivas (R) dele."
        ),
        "en": (
            "Vel'Koz relies on maximum range Plasma Fission (Q) poke and Tectonic Disruption (E) knockups. "
            "Start E or Q at level 1 with Doran's Shield and Second Wind for sustain. Use double E dashes through the wave to gap-close, dodging his E knockup. "
            "Once in melee range, Empowered W with PTA deletes him in a single rotation. At level 6, save your W stun to immediately cancel his Life Form Disintegration Ray (R) channel."
        )
    },
    "Vex": {
        "pt": (
            "Vex pune campeões com avanços através de sua passiva de Perdição (que marca dashes com dano e temor). "
            "No início da partida, jogue com cautela: comece com Q para farmar e curar sem ativar a passiva dela desnecessariamente. "
            "Aguarde a barra vermelha de temor de Vex ser gasta em habilidades na onda de minions; no exato momento em que ela não tiver temor disponível, "
            "avance com E nos minions, aplique W Fortalecido + Q e desengaje com E2. "
            "Compre Passos de Mercúrio e Hexdrinker para mitigar o burst e domine a rota após o nível 6 com o Dominus (R)."
        ),
        "en": (
            "Vex counters dash champions with her Doom 'n Gloom passive, applying fear and bonus damage upon enemy dashes. "
            "Play cautiously early: start Q to farm and heal without unnecessarily triggering her passive mark. "
            "Wait until her red fear bar is spent on waveclear; the exact second her fear is on cooldown, dash in with E, unload Empowered W + Q, "
            "and disengage with E2. Build Mercury's Treads and Hexdrinker to survive her burst and dominate post-6 with Dominus (R)."
        )
    },
    "Vi": {
        "pt": (
            "Vi na rota solo aposta em queijo com Chuva de Golpes no nível 1 e no avanço perfurante do Quebra-Cofres (Q). "
            "No nível 1, evite trocas prolongadas contra os 3 socos rápidos dela; comece com Q para controlar a onda. "
            "Em trocas no nível 3+, use o seu E para desviar lateralmente do Q carregado de Vi. "
            "Quando Vi ativar o escudo da Blindagem (Passiva), o W Fortalecido do Renekton destrói 100% do escudo instantaneamente, "
            "permitindo que você vença todas as trocas e domine o 1v1 com Botas Galvanizadas e Cutelo Negro."
        ),
        "en": (
            "Solo lane Vi relies on Hail of Blades level 1 cheese and Vault Breaker (Q) charge engages. "
            "Avoid extended level 1 trades against her rapid 3-hit combo; start Q for wave management. "
            "In level 3+ trades, sidestep her charging Q with your E dash. When Vi gains her Blast Shield passive, Renekton's Empowered W breaks 100% of the shield instantly, "
            "ensuring dominating trades and dueling superiority with Plated Steelcaps and Black Cleaver."
        )
    },
    "Viego": {
        "pt": (
            "Viego possui bom sustento com a Espada do Rei Destruído (Q) e controle de grupo na Mandíbula Espectral (W). "
            "No nível 1, comece com Q para empurrar a onda ou de W para responder all-in; use o seu E para desviar da investida com atordoamento (W) dele. "
            "Renekton possui muito mais dano de burst e robustez no early/mid game: execute trocas curtas de W Fortalecido + Q + auto-ataques. "
            "Compre Golpe do Carrasco precoce e Botas Galvanizadas para anular o roubo de vida de Viego e ative Dominus (R) no nível 6 para atropelá-lo em qualquer duelo."
        ),
        "en": (
            "Viego brings sustained healing via Blade of the Ruined King (Q) and stun control with Spectral Maw (W). "
            "Start Q at level 1 for wave control or W to trade; use E mobility to dodge his charging W stun. "
            "Renekton boasts vastly superior burst damage and raw durability: execute short Empowered W + Q trades. "
            "Build early Executioner's Calling and Plated Steelcaps to shut down his sustain, activating Dominus (R) at level 6 to overpower him in all 1v1s."
        )
    },
    "Viktor": {
        "pt": (
            "Viktor tenta pokear com o Raio da Morte (E) e controlar espaço com o Campo Gravítico (W). "
            "No nível 1, inicie com E para aplicar trocas agressivas com PTA (E1 > auto-ataques > E2). "
            "Ao avançar no nível 3+, use o duplo dash do E para atravessar a zona do Campo Gravítico antes de acumular as 3 marcas de atordoamento. "
            "O W Fortalecido do Renekton quebra o escudo gerado pelo Poder do Sifão (Q) de Viktor instantaneamente, garantindo abates solo fáceis. "
            "Feche Passos de Mercúrio e Eclipse para atropelá-lo antes que ele evolua suas habilidades no mid game."
        ),
        "en": (
            "Solo lane Viktor looks to poke with Death Ray (E) and control space with Gravity Field (W). "
            "Start E at level 1 for immediate PTA trade dominance. When jumping in at level 3+, use double E dashes to quickly cross his Gravity Field before the 3-stack stun activates. "
            "Renekton's Empowered W shatters Viktor's Siphon Power (Q) shield instantly, guaranteeing easy solo kills. "
            "Rush Mercury's Treads and Eclipse to snowball before his abilities evolve in the mid game."
        )
    },
    "Vladimir": {
        "pt": (
            "Vladimir é um campeão de escalonamento que possui um início de jogo extremamente frágil e com altos tempos de recarga no Q (Transfusão) e W (Poça de Sangue). "
            "No nível 1, inicie com E para punir o posicionamento dele com trocas agressivas usando PTA (E1 > 3 auto-ataques > E2 para recuar). "
            "Preste atenção na barra de fúria carmesim de Vladimir: recue quando o Q dele estiver fortalecido (vermelho) e avance com tudo no momento em que ele gastar o Q normal. "
            "Force o uso da Poça de Sangue (W) com a ameaça do seu E, aguarde o término da poça e execute-o com W Fortalecido + Ignite. "
            "Compre Golpe do Carrasco ou Passos de Mercúrio e encerre a partida com pressão no mid game antes do late game dele."
        ),
        "en": (
            "Vladimir is a scaling hyper-carry with an exceptionally weak early game plagued by high Transfusion (Q) and Sanguine Pool (W) cooldowns. "
            "Start E at level 1 to punish his low base stats with immediate PTA trades (E1 > 3 autos > E2 back). "
            "Track his crimson resource bar: step back when his Empowered Q (red) is ready, and jump in the instant he wastes a normal Q. "
            "Bait out his Sanguine Pool (W) with the threat of your E dash, then finish him with Empowered W + Ignite the second he emerges. "
            "Build Executioner's Calling or Merc Treads to snowball before his late-game scaling kicks in."
        )
    },
    "Cho'Gath": {
        "pt": (
            "O early game de Cho'Gath é facilmente explorável evitando suas trocas estendidas de Q e E, usando sua movimentação para atrair suas habilidades "
            "e forçando trocas rápidas com seu próprio combo. Renekton pode punir Cho'Gath com facilidade se mantiver o controle de onda perto de sua torre, "
            "forçando-o a gastar mana com o Q e criando espaço para perseguição com o duplo dash do E. "
            "No mid e late game, o acúmulo de vida da passiva e do Banquete (R) de Cho'Gath se tornará expressivo; "
            "no entanto, com itens como Espada do Rei Destruído, Cutelo Negro e Eclipse, Renekton possui o dano percentual perfeito para derreter a barra de vida dele. "
            "Em lutas de equipe, evite focar Cho'Gath em linha reta se ele estiver muito resistente: use o W Fortalecido para desarmar ameaças prioritárias e elimine os carregadores inimigos."
        ),
        "en": (
            "Cho'Gath's early game is easily exploitable by sidestepping Rupture (Q) and Vorpal Spikes (E) trades with clean movement while forcing quick burst trades. "
            "Renekton can bully Cho'Gath by holding wave control on his side of the map, draining Cho's mana bar and opening long chase lanes with double E dashes. "
            "In the mid to late game, Cho'Gath's Feast (R) HP stacking becomes prominent, but item rushes like Blade of the Ruined King, Black Cleaver, and Eclipse "
            "provide Renekton with massive percent HP damage to shred him completely. In teamfights, bypass Cho'Gath to lock down squishy backline carries with Empowered W."
        )
    },
    "Quinn": {
        "pt": (
            "Quinn na rota do topo busca abusar de seu alcance, marca da passiva (Rapina) e desengaje com Investida (E) para punir campeões corpo a corpo. "
            "Para vencer o confronto, comece com Doran's Shield e Ventos Revigorantes, evitando tomar auto-ataques de graça no nível 1 e 2. "
            "A chave deste confronto é a gestão do salto de Quinn: NUNCA gaste o duplo dash do Renekton antecipadamente. "
            "Use o primeiro dash do E nos minions para se aproximar; quando Quinn usar o Investida (E) para chutar Renekton para trás, "
            "utilize imediatamente o segundo dash (E2) ou Flash para fechar a distância restante e trave-a com o W Fortalecido. "
            "Compre Botas Galvanizadas com urgência e finalize com Eclipse/Letalidade para eliminá-la em uma única rotação."
        ),
        "en": (
            "Top lane Quinn relies on ranged Harrier passive marks and Vault (E) disengages to kite melee champions. "
            "Start Doran's Shield with Second Wind to mitigate early harass during levels 1-2. The golden rule: never waste both E dashes prematurely. "
            "Use E1 through the minion wave to close distance; the moment Quinn casts Vault (E) to kick off Renekton, immediately use your second dash (E2) or Flash "
            "to reconnect and lock her down with Empowered W. Rush Plated Steelcaps and Eclipse to eliminate her in a single burst window."
        )
    },
    "Warwick": {
        "pt": (
            "Warwick é um confronto volátil para Renekton devido à cura absurda da passiva e do W quando ele está com pouca vida, além do medo no Primal Howl (E). "
            "Apressar o Golpe do Carrasco (Corta-Cura) e Botas Galvanizadas é essencial para neutralizar o sustento dele. "
            "Renekton perde trocas estendidas de auto-ataques corpo a corpo contra Warwick; portanto, execute estritamente trocas curtas com E > W Fortalecido > Q > E para recuar. "
            "No nível 6, use o Dominus (R) e evite descarregar todo o seu dano enquanto o escudo do E de Warwick estiver ativo. "
            "No mid game e teamfights, Warwick é completamente superado em escalonamento e utilidade pelas rotações de dano em área e controle de grupo do Renekton."
        ),
        "en": (
            "Warwick is a volatile matchup due to his low-health passive life steal and Primal Howl (E) damage reduction/fear. "
            "Rushing an early Executioner's Calling and Plated Steelcaps is essential to neutralizing his sustain. "
            "Renekton loses extended basic-attack slugfests against Warwick, so stick strictly to hit-and-run short trades: E in > Empowered W > Q > E out. "
            "At level 6, pop Dominus (R) and delay your heavy burst until his E damage reduction fades. "
            "In the mid game and teamfights, Warwick is heavily outscaled by Renekton's superior AoE damage, armor shred, and teamfight utility."
        )
    }
}

def clean_and_synthesize():
    print("Iniciando sintese estrategica de matchups...")
    
    with open(MATCHUPS_FILE, 'r', encoding='utf-8') as f:
        matchups = json.load(f)

    with open(CACHE_FILE, 'r', encoding='utf-8') as f:
        cache = json.load(f)

    updated_count = 0
    
    for m in matchups:
        name = m.get('championName', '')
        s_pt = m.get('summaryPt', '')
        s_en = m.get('summaryEn', '')
        
        # Se este campeão tem uma síntese artesanal definida
        if name in CHALLENGER_SUMMARIES:
            new_pt = CHALLENGER_SUMMARIES[name]["pt"].strip()
            new_en = CHALLENGER_SUMMARIES[name]["en"].strip()
            
            m['summaryPt'] = new_pt
            m['summaryEn'] = new_en
            
            # Atualiza no cache de traduções
            cache[new_en] = new_pt
            updated_count += 1
            print(f"  [OK] Sintese aplicada para: {name}")
        else:
            # Para qualquer outro campeão que possa ter ficado com '...' ou sem ponto final
            if s_pt.rstrip().endswith('...') or not (s_pt.endswith('.') or s_pt.endswith('!') or s_pt.endswith('?')):
                print(f"  [ALERTA] Campeao sem sintese artesanal mas com texto suspeito: {name}")

    # Salva matchups.json
    with open(MATCHUPS_FILE, 'w', encoding='utf-8') as f:
        json.dump(matchups, f, indent=2, ensure_ascii=False)
    print(f"\nSalvo {MATCHUPS_FILE} com {updated_count} matchups enriquecidas.")

    # Salva cache
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)
    print(f"Salvo {CACHE_FILE}.")

    # Atualiza seed.sql
    print("Atualizando seed.sql...")
    sql_statements = []
    
    def sql_quote(s):
        if s is None:
            return "NULL"
        s_str = str(s).replace("'", "''")
        return f"'{s_str}'"

    for m in matchups:
        stmt = f"""INSERT INTO matchups (id, champion_id, difficulty_tier, difficulty_rating, difficulty_raw,
                    runes_recommendation, starting_items, summoner_spells, ability_max_order, icon_url, roles,
                    has_video, summary_en, summary_pt, detailed_notes_raw_en, detailed_notes_raw_pt, video_url)
VALUES ({m['id']}, {m['championId']}, {sql_quote(m['difficultyTier'])}, {m['difficultyRating']}, {sql_quote(m['difficultyRaw'])},
        {sql_quote(m['runesRecommendation'])}, {sql_quote(m['startingItems'])}, {sql_quote(m['summonerSpells'])}, {sql_quote(m['abilityMaxOrder'])},
        {sql_quote(m['iconUrl'])}, {sql_quote(json.dumps(m['roles']))}, {1 if m['hasVideo'] else 0},
        {sql_quote(m['summaryEn'])}, {sql_quote(m['summaryPt'])}, {sql_quote(m['detailedNotesRawEn'])}, {sql_quote(m['detailedNotesRawPt'])}, {sql_quote(m['videoUrl'])});"""
        sql_statements.append(stmt)

    # Lê as outras partes do seed.sql (champions, tips, fury_tips, general_guides)
    with open(SEED_SQL_FILE, 'r', encoding='utf-8') as f:
        old_sql = f.read()

    # Substitui a seção de matchups no seed.sql
    matchups_marker_start = "-- Matchups Data"
    matchups_marker_end = "-- Tips Data"
    
    if matchups_marker_start in old_sql and matchups_marker_end in old_sql:
        part1 = old_sql.split(matchups_marker_start)[0] + matchups_marker_start + "\n"
        part2 = "\n\n" + matchups_marker_end + old_sql.split(matchups_marker_end)[1]
        new_matchups_block = "\n".join(sql_statements)
        new_sql = part1 + new_matchups_block + part2
        with open(SEED_SQL_FILE, 'w', encoding='utf-8') as f:
            f.write(new_sql)
        print("seed.sql atualizado com sucesso!")
    else:
        print("Aviso: marcadores de matchups no seed.sql nao encontrados; regerando via rebuild_data_engine se necessario.")

    print("Sintese finalizada com sucesso!")

if __name__ == '__main__':
    clean_and_synthesize()
