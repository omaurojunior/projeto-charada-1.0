const campoPergunta = document.getElementById('pergunta');
const inputResposta = document.getElementById('input-resposta');
const btnValidar = document.getElementById('btn-validar');
const btnNova = document.getElementById('btn-nova');
const rodadaDisplay = document.getElementById('rodada-display');
const pontosDisplay = document.getElementById('pontos-display');
const progressBar = document.getElementById('progress-bar');
const statusMensagem = document.getElementById('status-mensagem');

const gameContainer = document.getElementById('game-container');
const endContainer = document.getElementById('end-container');
const endPontos = document.getElementById('end-pontos');
const endPorcentagem = document.getElementById('end-porcentagem');
const rankingList = document.getElementById('ranking-list');
const btnRestart = document.getElementById('btn-restart');

// UI DOM
const startScreen = document.getElementById('start-screen');
const inputPlayerName = document.getElementById('input-player-name');
const btnStartGame = document.getElementById('btn-start-game');
const avatarOptions = document.querySelectorAll('.avatar-option');
const particlesContainer = document.getElementById('particles-container');

// Novas Referências Pluralizadas para o Modos e Combo
const modoOptions = document.querySelectorAll('.mode-option');
const tempoDisplay = document.getElementById('tempo-display');
const comboDisplay = document.getElementById('combo-display');

// --- Audio System Básico Retro Arcade ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'start') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'tick') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.02, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

// Constant config
const TOTAL_RODADAS = 10;
const API_URL = 'https://api-charadas-backend-rho.vercel.app/charadas/aleatoria';

let charadaAtual = null;
let username = "";
let userAvatar = "👾"; // Default
let modoJogo = "classico"; // 'classico', 'morte_subita', 'tempo'
let rodadaAtual = 1;
let pontuacaoAtual = 0;
let acertos = 0;
let respondendo = false;
let combo = 0;
let tempoRestante = 60;
let tempoInterval = null;
let limiteRodadas = TOTAL_RODADAS;

// Particles generator
function createParticles() {
    if (!particlesContainer) return;
    particlesContainer.innerHTML = '';
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.animationDuration = `${Math.random() * 4 + 3}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        
        particlesContainer.appendChild(particle);
    }
}

function inicializarJogo() {
    createParticles();
    inputPlayerName.value = "";
    if (tempoInterval) clearInterval(tempoInterval);
    resetStatusPartida();
    
    endContainer.classList.add('hidden', 'scale-95', 'opacity-0');
    gameContainer.classList.add('hidden', 'scale-95', 'opacity-0');
    
    startScreen.classList.remove('hidden');
    requestAnimationFrame(() => {
        setTimeout(() => {
            startScreen.classList.remove('opacity-0');
            startScreen.style.transform = 'scale(1)'; // reset possible scale down
        }, 50);
    });
}

function iniciarCronometro() {
    if (tempoInterval) clearInterval(tempoInterval);
    tempoInterval = setInterval(() => {
        tempoRestante--;
        tempoDisplay.textContent = `⏱ ${tempoRestante}s`;
        
        if (tempoRestante <= 10 && tempoRestante > 0) playSound('tick');
        
        // Progress bar in tempo mode shows remaining time
        if (modoJogo === 'tempo') {
            progressBar.style.width = `${(tempoRestante / 60) * 100}%`;
        }

        if (tempoRestante <= 0) {
            clearInterval(tempoInterval);
            mostrarMensagem("⏰ Fim do tempo!", "erro");
            finalizarJogo();
        }
    }, 1000);
}

function iniciarFluxoDeJogo() {
    resetStatusPartida();
    playSound('start');
    
    // Configura UI baseado no modo
    if (modoJogo === 'tempo') {
        tempoDisplay.classList.remove('hidden');
        tempoRestante = 60;
        tempoDisplay.textContent = `⏱ 60s`;
        limiteRodadas = Infinity; // Infinite rounds within time
        iniciarCronometro();
    } else if (modoJogo === 'morte_subita') {
        tempoDisplay.classList.remove('hidden');
        tempoDisplay.textContent = `💀 Súbita`;
        limiteRodadas = Infinity; // Infinite until miss
    } else {
        tempoDisplay.classList.add('hidden');
        limiteRodadas = TOTAL_RODADAS; // Normal 10 rounds
    }

    // Anima a transição da start screen out
    startScreen.classList.add('opacity-0');
    startScreen.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
        startScreen.classList.add('hidden');
        
        gameContainer.classList.remove('hidden');
        requestAnimationFrame(() => {
            setTimeout(() => {
                gameContainer.classList.remove('opacity-0', 'scale-95');
                atualizarHUD();
            }, 50);
        });

        buscaCharadaAleatoria();
    }, 600);
}

function resetStatusPartida() {
    rodadaAtual = 1;
    pontuacaoAtual = 0;
    acertos = 0;
    combo = 0;
    respondendo = false;
    if (tempoInterval) clearInterval(tempoInterval);
}

function atualizarHUD() {
    pontosDisplay.textContent = `⭐ ${pontuacaoAtual} pts`;
    
    if (modoJogo === 'tempo') {
        rodadaDisplay.textContent = `♾️ Rodada ${rodadaAtual}`;
    } else if (modoJogo === 'morte_subita') {
        rodadaDisplay.textContent = `💀 Sobrevivência ${rodadaAtual}`;
        progressBar.style.width = '100%';
    } else {
        rodadaDisplay.textContent = `${rodadaAtual} / ${limiteRodadas}`;
        progressBar.style.width = `${((rodadaAtual - 1) / limiteRodadas) * 100}%`;
    }
    
    // Sistema de Combo
    if (combo > 1) {
        comboDisplay.textContent = `🔥 COMBO x${combo}`;
        comboDisplay.style.opacity = '1';
        comboDisplay.classList.remove('combo-pop');
        void comboDisplay.offsetWidth; // trigger reflow
        comboDisplay.classList.add('combo-pop');
        
        pontosDisplay.classList.remove('scale-110');
        void pontosDisplay.offsetWidth;
        pontosDisplay.classList.add('scale-110');
    } else {
        comboDisplay.style.opacity = '0';
    }
}

function mostrarMensagem(msg, tipo) {
    statusMensagem.textContent = msg;
    statusMensagem.className = `text-sm font-bold tracking-wide transition-opacity duration-300 opacity-100 ${tipo === 'sucesso' ? 'text-emerald-400' : 'text-red-400'}`;
}

function limparMensagem() {
    statusMensagem.classList.remove('opacity-100');
    statusMensagem.classList.add('opacity-0');
}

async function buscaCharadaAleatoria() {
    if (rodadaAtual > limiteRodadas && modoJogo === 'classico') {
        finalizarJogo();
        return;
    }

    respondendo = true;
    campoPergunta.textContent = "Sorteando charada...";
    inputResposta.value = "";
    inputResposta.disabled = true;
    btnValidar.disabled = true;
    btnNova.disabled = true;
    limparMensagem();
    atualizarHUD();
    
    // remove shake to allow re-shake if needed later
    gameContainer.classList.remove('shake');

    try {
        if (charadasRestantes.length === 0) {
            campoPergunta.textContent = "Sincronizando com a base de dados...";
            const respostaApi = await fetch(API_URL_TODAS);
            const dados = await respostaApi.json();
            charadasRestantes = dados.sort(() => Math.random() - 0.5);
        }
        
        if (charadasRestantes.length > 0) {
            charadaAtual = charadasRestantes.pop();
            campoPergunta.textContent = charadaAtual.pergunta;
            
            if (tempoRestante > 0 || modoJogo !== 'tempo') {
                inputResposta.disabled = false;
                btnValidar.disabled = false;
                btnNova.disabled = false;
                inputResposta.focus();
            }
        } else {
            campoPergunta.textContent = "Nenhuma charada encontrada.";
        }
        respondendo = false;
        
    } catch (erro) {
        campoPergunta.textContent = "Falha de comunicação. Tentando novamente...";
        console.error(erro);
        setTimeout(buscaCharadaAleatoria, 2000);
    }
}

function pularCharada() {
    if (respondendo) return;
    
    if (modoJogo === 'morte_subita') {
        mostrarMensagem("💀 Game Over! Pulou na Morte Súbita.", "erro");
        playSound('error');
        gameContainer.classList.remove('shake');
        void gameContainer.offsetWidth;
        gameContainer.classList.add('shake');
        setTimeout(() => finalizarJogo(), 1500);
        return;
    }
    
    // Penalidade por pular
    if (pontuacaoAtual >= 5) {
        pontuacaoAtual -= 5;
    }
    combo = 0;
    
    mostrarMensagem("⚠️ Charada ignorada! -5 pts", "erro");
    playSound('error');
    avancarRodada();
}

function validarResposta() {
    if (!charadaAtual || respondendo || inputResposta.value.trim() === "") return;

    const respostaDigitada = inputResposta.value.trim();
    respondendo = true;
    inputResposta.disabled = true;
    btnValidar.disabled = true;
    btnNova.disabled = true;

    const similaridade = calcularSimilaridade(charadaAtual.resposta, respostaDigitada);
    
    if (similaridade >= 70 && respostaDigitada.length >= 2) {
        combo++;
        let multiplicador = combo >= 3 ? 2 : 1; 
        const pontosGanhos = Math.round(similaridade * 0.5) * multiplicador; 
        pontuacaoAtual += pontosGanhos;
        acertos++;
        mostrarMensagem(`🔥 Preciso! +${pontosGanhos} pts` + (multiplicador > 1 ? ` (COMBO x${combo}!)` : ''), "sucesso");
        playSound('success');
    } else {
        combo = 0;
        mostrarMensagem(`❌ Incorreto! Era: ${charadaAtual.resposta.toUpperCase()}`, "erro");
        playSound('error');
        gameContainer.classList.remove('shake');
        void gameContainer.offsetWidth;
        gameContainer.classList.add('shake');
        
        if (modoJogo === 'morte_subita') {
            setTimeout(() => finalizarJogo(), 2000);
            return;
        }
    }

    if (modoJogo === 'classico') {
        progressBar.style.width = `${(rodadaAtual / limiteRodadas) * 100}%`;
    }
    
    avancarRodada();
}

function avancarRodada() {
    setTimeout(() => {
        rodadaAtual++;
        if (modoJogo !== 'tempo' || tempoRestante > 0) {
            buscaCharadaAleatoria();
        }
    }, 2000);
}

function finalizarJogo() {
    if (tempoInterval) clearInterval(tempoInterval);
    
    // Esconder Container Jogo
    gameContainer.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        gameContainer.classList.add('hidden');
        
        // Setup values
        let rodadasJogadas = rodadaAtual - 1;
        if(rodadasJogadas <= 0) rodadasJogadas = 1;
        
        const porcentagem = Math.round((acertos / rodadasJogadas) * 100);
        endPontos.textContent = pontuacaoAtual;
        endPorcentagem.textContent = `${porcentagem}%`;

        salvarRanking(pontuacaoAtual, porcentagem);
        exibirRanking();

        // Mostrar tela final
        endContainer.classList.remove('hidden');
        requestAnimationFrame(() => {
            setTimeout(() => {
                endContainer.classList.remove('opacity-0', 'scale-95');
            }, 50);
        });
    }, 500);
}

function salvarRanking(pontos, porcentagem) {
    let ranking = [];
    try {
        ranking = JSON.parse(localStorage.getItem('charada_ranking')) || [];
    } catch {
        ranking = [];
    }
    
    ranking.push({
        id: Date.now().toString(), // added ID for deletion
        jogador: username,
        avatar: userAvatar,
        pontos: pontos,
        porcentagem: porcentagem,
        modo: modoJogo,
        data: new Date().toLocaleDateString()
    });
    
    ranking.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        return b.porcentagem - a.porcentagem;
    });
    
    ranking = ranking.slice(0, 15); // keep top 15
    localStorage.setItem('charada_ranking', JSON.stringify(ranking));
}

function deletarDoRanking(id) {
    let ranking = JSON.parse(localStorage.getItem('charada_ranking')) || [];
    ranking = ranking.filter(entry => entry.id !== id);
    localStorage.setItem('charada_ranking', JSON.stringify(ranking));
    exibirRanking();
    playSound('error'); // just a feedback sound
}

window.deletarDoRanking = deletarDoRanking; // tornar global p/ onclick iterativo

function exibirRanking() {
    const ranking = JSON.parse(localStorage.getItem('charada_ranking')) || [];
    rankingList.innerHTML = "";
    
    if (ranking.length === 0) {
        rankingList.innerHTML = "<p class='text-slate-500 text-sm py-4 text-center'>Nenhum registro ainda.</p>";
        return;
    }

    const modeEdict = {
        'classico': '🎯',
        'morte_subita': '💀',
        'tempo': '⏱️'
    };

    ranking.forEach((entry, index) => {
        const isTop = index === 0;
        const colorClass = isTop ? 'text-amber-400 font-bold' : 'text-slate-300';
        const medal = isTop ? '👑' : `${index + 1}º`;
        const iconeModo = modeEdict[entry.modo] || '🎯';
        
        const html = `
            <div class="ranking-item group relative flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border-b border-transparent overflow-hidden">
                <div class="flex items-center gap-3">
                    <span class="w-8 text-center text-sm ${colorClass}">${medal}</span>
                    <span class="text-2xl drop-shadow-[0_0_8px_rgba(0,255,204,0.3)]">${entry.avatar || '👾'}</span>
                    <div class="flex flex-col">
                        <span class="font-semibold text-slate-100 uppercase tracking-wider text-sm flex gap-2 items-center">${entry.jogador} <span class="text-[10px] opacity-70">${iconeModo}</span></span>
                        <span class="text-[10px] text-slate-500">${entry.data || ''}</span>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-[#0ff] font-bold block leading-none saturate-150">${entry.porcentagem}%</span>
                    <span class="text-[#f0f] text-xs font-semibold uppercase tracking-widest mt-1 block">${entry.pontos}p</span>
                </div>
                <!-- Delete overlay -->
                <button onclick="deletarDoRanking('${entry.id}')" class="delete-btn absolute top-0 right-0 h-full px-4 bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transform translate-x-full group-hover:translate-x-0 transition-transform cursor-pointer" title="Deletar este recorde">
                    🗑️
                </button>
            </div>
        `;
        rankingList.insertAdjacentHTML('beforeend', html);
    });
}

// ================= SIMILARIDADE =================
function calcularSimilaridade(correta, digitada) {
    const s1 = correta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const s2 = digitada.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;
    const matriz = [];
    for (let i = 0; i <= s1.length; i++) matriz[i] = [i];
    for (let j = 0; j <= s2.length; j++) matriz[0][j] = j;
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            const custo = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matriz[i][j] = Math.min(
                matriz[i - 1][j] + 1,      
                matriz[i][j - 1] + 1,      
                matriz[i - 1][j - 1] + custo
            );
        }
    }
    const distancia = matriz[s1.length][s2.length];
    const tamanhoMaximo = Math.max(s1.length, s2.length);
    const porcentagem = ((tamanhoMaximo - distancia) / tamanhoMaximo) * 100;
    return parseFloat(porcentagem.toFixed(2)); 
}

// Events
btnValidar.addEventListener('click', validarResposta);
btnNova.addEventListener('click', pularCharada);
btnRestart.addEventListener('click', inicializarJogo);
inputResposta.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') validarResposta();
});

// Avatar Selection
avatarOptions.forEach(option => {
    option.addEventListener('click', () => {
        avatarOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        userAvatar = option.getAttribute('data-avatar');
    });
});

// Mode Selection
modoOptions.forEach(option => {
    option.addEventListener('click', () => {
        modoOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        modoJogo = option.getAttribute('data-mode');
    });
});

// START
btnStartGame.addEventListener('click', () => {
    let inputName = inputPlayerName.value.trim();
    if (inputName !== "") {
        username = inputName;
    } else {
        username = "PLAYER UNKNOWN";
    }
    iniciarFluxoDeJogo();
});

inputPlayerName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnStartGame.click();
    }
});

// Resumo pro áudio inicializar num clique do usuário no corpo e evitar políticas de bloqueio de autoplay
document.body.addEventListener('click', () => {
    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });

// Começar jogo no DOM ready -> Mostra Tela Inicial
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(API_URL_TODAS);
        const dados = await res.json();
        charadasRestantes = dados.sort(() => Math.random() - 0.5);
    } catch(e) {
        console.error("Erro ao pré-carregar charadas:", e);
    }
    inicializarJogo();
});
