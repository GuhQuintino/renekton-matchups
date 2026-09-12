import json
import urllib.request
import urllib.parse
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('src/data/deeplol_matchups.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Starting deep translation of DeepLoL tips...")

EXPERT_TRANSLATIONS = {
    # Aatrox
    ("Aatrox", 0): ("Desviando do Q do Aatrox", "O Q de Aatrox causa dano bônus e knockup nas bordas (sweet spots). É crucial usar seu E (Slice and Dice) para dar dash para dentro do alcance do Q ou esquivar lateralmente."),
    ("Aatrox", 1): ("Anulando Aatrox com W Fortalecido", "Aatrox maximiza a cura ajustando sua posição com o E durante a conjuração do Q. O W Fortalecido de Renekton (Predador Implacável) destrói escudos e causa dano massivo, permitindo anular trocas e vencer o duelo."),
    
    # Akali
    ("Akali", 0): ("Aproveitar a Força no Early Game", "Renekton é dominante no início do jogo, enquanto Akali é frágil. Utilize Q e W para trocas agressivas nos níveis 1 a 3 para pressionar a vida da Akali e ditar a prioridade da rota."),
    ("Akali", 1): ("Neutralizar a Akali com Dominus (R)", "Quando Akali usar a Proteção do Crepúsculo (W), ative sua Ultimate Dominus (R) para ganhar vida máxima adicional e causar dano mágico contínuo em área, facilitando persegui-la e finalizar o abate dentro da fumaça."),

    # Ambessa
    ("Ambessa", 0): ("Destruir o Escudo da Ambessa com W Fortalecido", "O W de Ambessa concede um escudo poderoso. Guarde e use o W Fortalecido de Renekton (50+ Fúria) para quebrar o escudo instantaneamente e anular a mitigação de dano dela."),
    ("Ambessa", 1): ("Prioridade e Pressão no Early Game", "Renekton é um counter direto para a Ambessa. Force trocas agressivas desde os primeiros níveis para assumir a prioridade e impedir que ela escale no jogo."),

    # Aurora
    ("Aurora", 0): ("Contornando o Salto (E) da Aurora", "O E da Aurora possui ótimo dash defensivo e causa lentidão, counterando o avanço direto de Renekton. Espere ela usar o E ou inicie a troca rápida assim que a habilidade estiver em cooldown."),
    ("Aurora", 1): ("Quebrando a Passiva e Escudos com W Fortalecido", "A passiva de Aurora concede sustentação espiritual e escudos. Use o W Fortalecido com 50+ de Fúria para quebrar as defesas e punir a fragilidade dela em trocas corpo a corpo."),

    # Camille
    ("Camille", 0): ("Trocar Considerando o Escudo da Passiva da Camille", "O escudo passivo de Camille é o pilar das trocas dela. Acumule 50 de Fúria e utilize o W Fortalecido (Predador Implacável) para destruir o escudo e desferir dano explosivo imediato."),
    ("Camille", 1): ("Pressão Agressiva de Lane no Early Game", "Antes do primeiro item fechado, Renekton possui atributos base e dano inicial muito superiores aos de Camille. Pressione com trocas curtas agressivas do nível 1 ao 3."),

    # Darius
    ("Darius", 0): ("Trocas Curtas e Desvio com E", "Quando Darius conjurar o Dizimar (Q), use o E (Slice and Dice) para dar dash para dentro do círculo interno, evitando o dano da lâmina e a cura. Em seguida, atordoe com W, use Q e saia com o segundo E antes que ele acumule 5 stacks de Hemorragia."),
    ("Darius", 1): ("Gerenciamento de Fúria e Reação ao Puxão", "Se Darius puxar você com o E (Apreender) e você tiver 50+ de Fúria, atordoe-o imediatamente com o W Fortalecido para interromper a sequência de dano dele e devolver o burst."),

    # Dr. Mundo
    ("Dr. Mundo", 0): ("Anulando a Passiva do Mundo com W Fortalecido", "A passiva do Dr. Mundo ignora o primeiro efeito imobilizador, mas o W Fortalecido de Renekton remove o escudo passivo e quebra sua defesa. Force trocas agressivas enquanto o canister dele estiver em recarga."),
    ("Dr. Mundo", 1): ("Pressione a Sustentação com Dominus (R)", "Dr. Mundo regenera muita vida com a Ultimate (R). Ative sua Ultimate Dominus (R) para ganhar vida bônus, dano em área contínuo e geração acelerada de Fúria para sobrecarregar a sustentação dele."),

    # Fiora
    ("Fiora", 0): ("Baitando o Ripostar (W) da Fiora", "O Ripostar (W) de Fiora pode bloquear seu W, mas a vantagem mental é sua. Alterne o timing: use combos falsos como E > Q > Auto-ataque e segure o W para quando ela gastar a habilidade defensiva em falso."),
    ("Fiora", 1): ("Garantir a Vantagem no Nível 6 com Dominus (R)", "Após o nível 6, o aumento de vida e dano em área de Dominus (R) sobrepuja o kit inicial da Fiora. Ative o R em all-ins e busque oportunidades claras de solo kill."),

    # Gangplank
    ("Gangplank", 0): ("Guardar o W para Depois do W do Gangplank", "Gangplank usará o W (Laranja) para se livrar do seu atordoamento. Pressione com E e Q, forçando ele a usar a laranja defensivamente antes de descarregar seu W Fortalecido."),
    ("Gangplank", 1): ("Evitar o Harass de Barris de Pólvora", "Não deixe GP estocar barris livremente. Dê last hit nos barris quando o contador cair para 1 ou use o duplo dash do E para cruzar a área explosiva e engajar diretamente nele."),

    # Garen
    ("Garen", 0): ("Aproveitar o Longo Cooldown do W do Garen", "A Coragem (W) de Garen tem tempo de recarga elevado. Assim que ele gastar o W, busque trocas agressivas com Q ou W fortalecidos para punir sua armadura reduzida."),
    ("Garen", 1): ("Kitar o Garen durante o Giro (E)", "Renekton tem vantagem clara nas trocas do early game. Use o E para kite durante o giro do E do Garen, acertando W e Q fortalecidos antes de desengajar."),

    # Gnar
    ("Gnar", 0): ("Aproveitar a Janela de Transformação do Mini Gnar", "Mini Gnar é extremamente frágil e vulnerável logo após voltar da forma Mega Gnar. Use esse momento de exaustão de fúria para dar all-in com duplo E e W Fortalecido."),
    ("Gnar", 1): ("Baitar e Punir o Salto (E) do Gnar", "O Salto (E) de Mini Gnar tem 22s de cooldown inicial. Force o salto com o primeiro dash de E, e use o segundo dash ou Flash + W para finalizar o abate."),

    # Gragas
    ("Gragas", 0): ("Baitar e Esquivar da Barrigada (E)", "O E (Impacto Corporal) de Gragas interrompe seu avanço. Use o primeiro E para atrair a barrigada e desvie lateralmente, ou aguarde o erro dele para punir com W total."),
    ("Gragas", 1): ("Anular a Redução de Dano com W Fortalecido", "O W de Gragas concede redução de dano, mas não resiste ao dano concentrado do W com 50+ de Fúria combinado com cancelamento de animação."),

    # Gwen
    ("Gwen", 0): ("Contornando a Névoa Sagrada (W)", "A Névoa Sagrada (W) de Gwen impede dano de fora, mas dentro da área ela é vulnerável. Use o dash duplo do E para entrar na névoa e descarregar o combo completo corpo a corpo."),
    ("Gwen", 1): ("Vantagem Massiva de Troca no Início do Jogo", "Antes do nível 6 e antes do primeiro item, Gwen não aguenta o burst de Renekton. Troque agressivamente para acumular vantagem e impedi-la de crescer no jogo."),

    # Heimerdinger
    ("Heimerdinger", 0): ("Engajar Apenas Após Limpar as Torres", "Não lute dentro da zona das 3 torres de Heimerdinger. Elimine as torres com Q fortalecido ou waveclear e só então use E > W para o all-in."),
    ("Heimerdinger", 1): ("Combo de Atordoamento com W Fortalecido", "Heimerdinger é extremamente frágil. Se você fechar a distância com o duplo E e encaixar o W Fortalecido, ele será eliminado antes que possa reagir com a Granada E."),

    # Illaoi
    ("Illaoi", 0): ("Desviando e Punindo o Puxão de Espírito (E)", "O Teste de Espírito (E) da Illaoi é a habilidade central do matchup. Esquive-se ativamente do projétil usando o E ou a wave; sem o E, Illaoi perde a maior parte do seu potencial de troca."),
    ("Illaoi", 1): ("Utilizando o W para Trocas Curtas e Unilaterais", "O W de Renekton permite atordoar a Illaoi para interromper ataques de tentáculos. Use trocas rápidas (E in > W > Q > E out) e nunca permaneça parado após ela ultar no nível 6."),

    # Irelia
    ("Irelia", 0): ("Guardar o W para Depois do W da Irelia", "Irelia usará o W (Dança Desafiadora) para mitigar dano físico. Aguarde o término da canalização para aplicar o W Fortalecido e garantir o dano total."),
    ("Irelia", 1): ("Evitar Trocas Antes do Nível 3", "Respeite o nível 1 e 2 da Irelia se a passiva dela estiver com 4 stacks. A partir do nível 3 com kit completo, Renekton domina totalmente os duelos."),

    # Jarvan IV
    ("Jarvan IV", 0): ("Esquivando do Combo E-Q (Flag & Drag)", "O combo E-Q do Jarvan é previsível. Esquive lateralmente com o E de Renekton e vire o confronto com atordoamento imediato."),
    ("Jarvan IV", 1): ("Destruindo o Escudo do W com W Fortalecido", "O W de Jarvan concede um escudo de área. O W Fortalecido de Renekton destrói esse escudo instantaneamente, maximizando seu dano de duelo."),

    # Jax
    ("Jax", 0): ("Cuidado Crítico com o Contra-Ataque (E) do Jax", "O Contra-Ataque (E) do Jax esquiva ataques básicos e anula seu W. Nunca use o W enquanto o E dele estiver girando. Use E para desengajar e só atordoe após o término da habilidade."),
    ("Jax", 1): ("Trocas Agressivas a Partir do Nível 3", "A partir do nível 3, Renekton possui enorme vantagem de controle de rota. Inicie trocas de fora do alcance do E dele e domine o ritmo da rota."),

    # Jayce
    ("Jayce", 0): ("Trocas Explosivas com W Fortalecido", "Jayce na forma canhão é frágil. Feche a distância através da wave com o E e aplique o W Fortalecido antes que ele possa alternar para o martelo e te afastar com o E."),
    ("Jayce", 1): ("Jogar controlando o Range do Jayce", "Mantenha-se protegido atrás dos minions para evitar o poke do portal de aceleração, e use os dashes de Renekton para punir os tempos de recarga dele."),

    # K'Sante
    ("K'Sante", 0): ("Cuidado com o W (Criador de Caminhos) Imparável", "O W de K'Sante reduz dano massivamente e ignora controle de grupo. Guarde seu W Fortalecido para puni-lo quando a postura defensiva terminar."),
    ("K'Sante", 1): ("Aproveitando a Prioridade no Early Game", "Antes do nível 6, Renekton tem vantagem em trocas curtas. Controle a wave, negue farm e force K'Sante a gastar mana excessiva para limpar a rota."),

    # Kayle
    ("Kayle", 0): ("Pressão Total de Rota e Zoneamento Inicial", "Kayle é a campeã mais frágil dos níveis 1 ao 5. Congele a rota (freeze), force trocas com E e W e negue o máximo de experiência e ouro possível."),
    ("Kayle", 1): ("Dives Fáceis Antes do Nível 6", "Antes da Ultimate de invulnerabilidade no nível 6, Kayle não tem ferramentas de escape contra o combo de burst do Renekton sob a torre."),

    # Kennen
    ("Kennen", 0): ("Baitar o Impulso do Relâmpago (E)", "O E de Kennen concede velocidade extrema para fugir. Force o gasto do E dele com avanço falso e busque o all-in com Flash + W enquanto a habilidade estiver em recarga."),
    ("Kennen", 1): ("Interrompendo a Mobilidade com W Fortalecido", "O atordoamento de 1.5s do W Fortalecido trava Kennen no lugar, impedindo-o de acumular marcas da passiva em você."),

    # Kled
    ("Kled", 0): ("Esquivando da Trapaça de Corda (Q)", "Desvie do Q de Kled para evitar a puxada e o corte de cura. Lute apenas quando a corda for evitada com sucesso."),
    ("Kled", 1): ("Contra-Ataque Devastador Quando Desmontado", "Assim que Skaarl fugir e Kled desmontar, ative o all-in com W Fortalecido e Dominus (R) para eliminá-lo antes que ele recupere a montaria."),

    # Malphite
    ("Malphite", 0): ("Pressão Constante no Início da Rota", "O escudo passivo e a armadura do Malphite demoram para escalar. Troque agressivamente nos primeiros níveis com Q para minar a vida dele."),
    ("Malphite", 1): ("Quebrando o Escudo Passivo com W Fortalecido", "Utilize o W Fortalecido de Renekton para rasgar o escudo granítico do Malphite e aplicar dano verdadeiro à sua barra de vida."),

    # Mordekaiser
    ("Mordekaiser", 0): ("Aproveitando a Prioridade Antes do Nível 6", "Antes de liberar o Reino da Morte, Mordekaiser tem trocas lentas. Use E > W > Q > E out para puni-lo sem ativar a passiva de tempestade dele."),
    ("Mordekaiser", 1): ("Destruindo o Escudo do W com W Fortalecido", "O W de Mordekaiser gera um escudo massivo de quase metade da vida dele. O W Fortalecido de Renekton destrói todo o escudo instantaneamente!"),

    # Nasus
    ("Nasus", 0): ("Zoneamento Impiedoso e Freeze no Early Game", "Nasus não consegue contestar Renekton nos primeiros níveis. Congele a wave perto da sua torre e negue stacks de Q sob ameaça constante de abate."),
    ("Nasus", 1): ("Configurando Dives e Snowball Ligeiro", "Empurre ondas gigantes (slow push) para a torre dele e chame o caçador ou realize dives solo com o burst e vida extra de Dominus (R)."),

    # Olaf
    ("Olaf", 0): ("Entendendo o Pico de Fúria e a Ultimate do Olaf", "Olaf ganha muita velocidade de ataque e roubo de vida quando está com pouca vida. Não prolongue trocas; foque em dano explosivo (burst) para finalizá-lo de uma vez."),
    ("Olaf", 1): ("Sustentação com Q Fortalecido e Trocas Curtas", "Use o Q com 50+ de Fúria na wave para curar grandes quantias de vida e desengaje com o duplo E antes que Olaf acerte machados consecutivos."),

    # Ornn
    ("Ornn", 0): ("Cuidado com o W (Fôlego do Fole) Imparável", "O W de Ornn torna-o imune a controle de grupo durante o sopro. Não use o W de Renekton no meio da animação dele; espere o sopro terminar."),
    ("Ornn", 1): ("Evite Trocas Longas Contra Efeitos Frágil", "Evite ser atingido pela aplicação de Frágil. Entre, execute o combo rápido de W + Q e saia com o segundo E para evitar ser atordoado no pilar."),

    # Pantheon
    ("Pantheon", 0): ("Baitar a Égide Protetora (E)", "O E de Pantheon bloqueia todo o dano frontal. Manobre com o E para dar dash para as costas dele ou espere o escudo cair para descarregar o dano."),
    ("Pantheon", 1): ("Buscando Abates Antes do Nível 6", "No nível 6, a ultimate de combate de Renekton (Dominus) supera completamente a ultimate sem combate direto do Pantheon. Force all-ins no 6."),

    # Poppy
    ("Poppy", 0): ("Engajar Apenas Após Confirmar o W de Poppy", "A Presença Inabalável (W) de Poppy bloqueia os dashes de Renekton. Não use o E se a barreira luminosa dela estiver ativa."),
    ("Poppy", 1): ("Trocas Curtas Longe das Paredes", "Mantenha-se no centro da rota para evitar o stun de impacto do E dela contra as paredes e execute trocas rápidas de Q."),

    # Quinn
    ("Quinn", 0): ("Baitar e Desviar do Salto (E) da Quinn", "Quinn usará o Salto (E) para te afastar assim que você avançar. Avance com o primeiro E, deixe ela usar o salto, e persiga com o segundo E + Flash + W."),
    ("Quinn", 1): ("All-In Surpresa com Flash e Ganks", "Quinn é muito frágil. Coordene com seu caçador ou use Flash + W Fortalecido para travá-la antes que ela consiga responder com cegueira."),

    # Riven
    ("Riven", 0): ("Destruir o Escudo do E (Valentia) com W Fortalecido", "O E de Riven concede um escudo frequente. Use o W Fortalecido para destruir o escudo e punir as trocas dela sem mitigação."),
    ("Riven", 1): ("Vantagem de Combate Prolongado com Dominus (R)", "A Ultimate Dominus (R) de Renekton oferece sustentação de combate superior à Lâmina do Exílio. Ative o R e vença a guerra de atrito."),

    # Rumble
    ("Rumble", 0): ("Evitar Trocas no Nível 1 e 2 Contra o Lança-Chamas", "O Q de Rumble em Superaquecimento causa dano massivo no início. Espere o nível 3 antes de buscar trocas mais pesadas."),
    ("Rumble", 1): ("Destruir o Escudo do W com W Fortalecido", "O W de Rumble fornece escudo e velocidade. Destrua o escudo com o W Fortalecido e puna-o quando a barra de calor dele estiver fora da zona de perigo."),

    # Ryze
    ("Ryze", 0): ("Pressão Agressiva de Rota no Início", "Ryze é dependente de mana e frágil nos níveis iniciais. Force trocas constantes para fazê-lo queimar a barra de mana e forçar recall precoce."),
    ("Ryze", 1): ("Punição Instantânea com W Fortalecido", "Feche a distância com os dois dashes do E através dos minions e atordoe Ryze com W antes que ele complete a combinação de fluxo de feitiço."),

    # Sett
    ("Sett", 0): ("Destruir o Escudo Titânico do W com W Fortalecido", "Quando Sett gastar o Cascudo (W) com a barra de determinação cheia, use o W Fortalecido de Renekton para destruir o escudo colossal dele instantaneamente!"),
    ("Sett", 1): ("Esquivar do Dano Verdadeiro Central do W com o E", "Use o segundo dash do E (Dice) para deslizar para o lado e evitar a linha central do W de Sett, que causa dano verdadeiro."),

    # Shen
    ("Shen", 0): ("Baitar o Refúgio Espiritual (W) do Shen", "O W de Shen bloqueia todos os ataques básicos e atordoamento do W de Renekton. Espere a zona de proteção desaparecer para soltar seu W."),
    ("Shen", 1): ("Interromper a Ultimate do Shen com o W", "Quando Shen começar a canalizar a Ultimate global (Manter a União), atordoe-o imediatamente com o W para cancelar o teleporte dele!"),

    # Singed
    ("Singed", 0): ("Punir as Investidas do Singed com W Fortalecido", "Quando Singed tentar correr em sua direção para usar o Lançar (E), atordoe-o com W Fortalecido e desfira o combo completo antes que ele consiga te jogar no veneno."),
    ("Singed", 1): ("Esquivar da Trilha de Veneno com o E", "Nunca persiga Singed em linha reta dentro do veneno do Q. Use seus dashes de E para cortar caminho ou desengajar confortavelmente."),

    # Sion
    ("Sion", 0): ("Interromper o Golpe Demolidor (Q) com o W", "Quando Sion carregar o machado do Q, atordoe-o imediatamente com o W de Renekton para cancelar a canalização e anular todo o dano dele."),
    ("Sion", 1): ("Destruir o Escudo da Fornalha da Alma com W Fortalecido", "O W de Sion concede um escudo de vida máxima. O W Fortalecido destrói o escudo antes que ele consiga detonar o dano mágico em área."),

    # Sylas
    ("Sylas", 0): ("Pressão Constante no Início da Rota", "Sylas sofre contra o dano físico constante de Renekton no early game. Force trocas frequentes para deixá-lo com vida baixa e forçar o gasto de mana no W."),
    ("Sylas", 1): ("Maximize o Uso do W Fortalecido e Corta-Cura", "O W Fortalecido de Renekton remove os escudos de Sylas e, com Feridas Dolorosas (Ignite/Carrasco), anula a cura de virada do W dele."),

    # Teemo
    ("Teemo", 0): ("Usar o W Apenas Após a Cegueira do Q de Teemo", "O Dardo Cegante (Q) de Teemo anula completamente o W de Renekton. Espere a cegueira passar ou o Q dele entrar em recarga antes de ativar o W."),
    ("Teemo", 1): ("Utilizar o Duplo Dash do E para Trocas 'Hit and Run'", "Teemo é lento e sem mobilidade. Use o primeiro E em um minion para aproximar, atordoe com W, use Q e saia com o segundo E sem sofrer retaliação."),

    # Trundle
    ("Trundle", 0): ("Aproveitar o Powerspike do Nível 3", "Antes do nível 3, o Q de Trundle rouba seu AD. A partir do nível 3, execute trocas curtas e rápidas (hit and run) para evitar que ele estenda a luta na área do W."),
    ("Trundle", 1): ("Respondendo à Ultimate Subjugar (R) de Trundle", "A Ultimate de Trundle rouba vida e resistências. Não use Dominus (R) imediatamente; guarde seu R para quando a drenagem dele terminar ou use E para recuar e resetar a luta."),

    # Tryndamere
    ("Tryndamere", 0): ("Evitar Trocas Estendidas Antes do Nível 3", "Tryndamere com 100% de Fúria pode acertar acertos críticos aleatórios no nível 1 e 2. Aguarde seu kit completo no nível 3 para ditar as regras da rota."),
    ("Tryndamere", 1): ("Controlar a Fúria Imortal (R) com Atordoamento e E", "Quando Tryndamere ultar (5s de invulnerabilidade), atordoe-o com o W Fortalecido de 1.5s e use os dashes de E para kiting e deixá-lo exposto no fim da duração."),

    # Twisted Fate
    ("Twisted Fate", 0): ("Interromper a Carta Dourada (W)", "TF na rota top busca pokear e atordoar à distância. Use os dashes do E através da wave para colar nele antes da seleção da carta e explodi-lo com W."),
    ("Twisted Fate", 1): ("Punir a Fragilidade e Responda aos Roamings", "Com pouca vida base e sem mobilidade de combate, TF morre instantaneamente para qualquer all-in de Renekton com Dominus (R)."),

    # Urgot
    ("Urgot", 0): ("Evitar o Forte Nível 1 das Pernas de Urgot", "No nível 1, a passiva de escopeta nas pernas de Urgot causa dano alto. Espere os níveis 3 a 5 para fazer trocas curtas pelo lado sem passiva ativa."),
    ("Urgot", 1): ("Pressão Agressiva Antes do Nível 9", "Antes do nível 9, o W de Urgot possui tempo de recarga e consome muita mana. Pressione com combos rápidos e busque o abate antes que o W dele se torne permanente."),

    # Vladimir
    ("Vladimir", 0): ("Baitar a Poça Sangrenta (W)", "A Poça de Vladimir (W) custa 20% da vida atual dele. Force o uso da poça com avanço do E sem gastar o W, e então descarregue o burst quando ele emergir."),
    ("Vladimir", 1): ("Pressão Avassaladora no Early Game com Anti-Cura", "Vladimir é muito fraco nos primeiros níveis. Compre um Carrasco ou use Ignite para anular a cura do Q e busque abates solo contínuos."),

    # Volibear
    ("Volibear", 0): ("Anular a Cura do W e o Escudo do E com W Fortalecido", "O W Fortalecido de Renekton quebra o escudo espesso que o E de Volibear cria e ajuda a finalizar a troca antes da segunda mordida de cura dele."),
    ("Volibear", 1): ("Manter Distância Após Trocas Curtas", "Nunca lute em confrontos prolongados contra a passiva de raios do Volibear. Entre, atordoe, cause dano e saia imediatamente com o segundo E."),

    # Warwick
    ("Warwick", 0): ("Cuidado com o Q (Dentes Famintos) de Perseguição", "O Q de Warwick pode segurar e seguir o seu dash de E. Use o W para atordoá-lo antes de tentar desengajar."),
    ("Warwick", 1): ("Anular a Cura Abaixo de 50% de HP com Anti-Cura e Burst", "A passiva de Warwick cura massivamente em vida baixa. Guarde o W Fortalecido e Ignite para explodi-lo antes que ele consiga se curar em combate."),

    # Wukong
    ("Wukong", 0): ("Não Gastar Habilidades Importantes no Clone (W)", "Preste atenção na postura de parada de Wukong. Guarde seu W Fortalecido para o verdadeiro Wukong e use o Q para acertar ambos em área."),
    ("Wukong", 1): ("Trocas Agressivas a Partir do Nível 3", "A armadura passiva de Wukong não o salva do burst concentrado e do sustain de Renekton a partir do nível 3. Force trocas curtas e domine a rota."),

    # Yasuo
    ("Yasuo", 0): ("Destruir o Escudo Passivo com W Fortalecido", "O escudo do fluxo de Yasuo é destruído instantaneamente pelo W Fortalecido de Renekton, abrindo espaço para um combo letal sem resistência."),
    ("Yasuo", 1): ("Prioridade Total de Rota Após o Nível 3", "A Parede de Vento (W) de Yasuo é completamente inútil contra todas as habilidades corpo a corpo de Renekton! Pressione e controle a wave com facilidade."),

    # Yone
    ("Yone", 0): ("Neutralizar o Escudo do W com W Fortalecido", "O W de Yone concede um escudo ao acertar você. Use o W Fortalecido de Renekton para quebrar esse escudo e causar dano máximo."),
    ("Yone", 1): ("Utilizar o E para Punir a Forma Espiritual", "Quando Yone usar o E para avançar, use seus dashes para esquivar do Q3 tornado e atordoe-o com W para forçá-lo a recuar precocemente."),

    # Yorick
    ("Yorick", 0): ("Destruir a Parede (W) Rapidamente com Auto + Q", "Se for preso no Procissão Obscura (W) de Yorick, use o reset de auto-ataque ou dash para escapar antes que os carniçais te cerquem."),
    ("Yorick", 1): ("Evitar Lutar Dentro da Donzela da Névoa (R)", "A Donzela de Yorick causa dano percentual contínuo. Limpe a Donzela primeiro com seu burst ou force lutas longe dela."),

    # Zac
    ("Zac", 0): ("Pressão Intensa de Rota no Início", "Zac no top depende de pegar as gotas de gosma para se curar. Pise nas gotas para destruí-las e pressione com Q e W nos níveis 1 a 3."),
    ("Zac", 1): ("Cuidado em Dives Sob a Torre Devido à Passiva", "Zac se divide em 4 pedaços ao morrer. Guarde o Q e dano em área para limpar as partes da passiva rapidamente durante dives."),

    # Zed
    ("Zed", 0): ("Atordoar Zed com o W Logo na Saída da Ultimate", "Quando Zed usar a Marca da Morte (R), ele sempre reaparece exatamente atrás de você. Mire seu W nas suas costas para atordoá-lo no primeiro frame!"),
    ("Zed", 1): ("Anular a Tentativa de Assassinato com Dominus (R)", "A ativação de Dominus concede vida instantânea para sobreviver à explosão da Marca da Morte, virando a luta a seu favor.")
}

with open('src/data/deeplol_matchups.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

applied_count = 0
for champ_name, champ_data in data.items():
    if not champ_data.get('hasData') or not champ_data.get('tips'):
        continue
    for idx, tip in enumerate(champ_data['tips']):
        key = (champ_name, idx)
        if key in EXPERT_TRANSLATIONS:
            t_pt, c_pt = EXPERT_TRANSLATIONS[key]
            tip['titlePt'] = t_pt
            tip['contentPt'] = c_pt
            applied_count += 1

print(f"Applied {applied_count} expert translations in Portuguese!")

with open('src/data/deeplol_matchups.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("src/data/deeplol_matchups.json successfully updated with Challenger-grade PT-BR translations!")
