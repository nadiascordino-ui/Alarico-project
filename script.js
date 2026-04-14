/* 
    DECODING ALARIC - GAME ENGINE 
*/

let currentSlide = 0; // 0 = Splash Screen
let selectedQuizOption = null;
let isMuted = false;
let mainMusicStarted = false;
let identityStarted = false;

// --- Entry Logic ---

function enterExperience() {
    const entry = document.getElementById('entry-overlay');
    const splash = document.getElementById('splash-screen');
    const riverAudio = document.getElementById('audio-river');
    const riverControl = document.getElementById('river-control');
    const musicControl = document.getElementById('music-control');
    const panel = document.getElementById('audio-panel');

    // Hide entry overlay
    entry.style.opacity = '0';
    setTimeout(() => {
        entry.style.display = 'none';
        splash.style.display = 'flex';
        void splash.offsetWidth;
        splash.classList.add('active');
    }, 800);

    // Initial state for audio controls
    if (panel) panel.style.display = 'flex';
    if (musicControl) musicControl.style.display = 'none';
    if (riverControl) riverControl.style.display = 'flex';

    // Start river audio
    if (riverAudio) {
        riverAudio.play().catch(e => console.log("River audio play blocked", e));
        // Ensure volume is synced with slider
        const riverSlider = document.getElementById('volume-river');
        if (riverSlider) riverAudio.volume = riverSlider.value;
    }
}

function startGame() {
    if (currentSlide === 0) {
        nextSlide();
    }
}

// --- Audio Engine ---

function toggleAudio() {
    const main = document.getElementById('audio-main');
    const river = document.getElementById('audio-river');
    const identity = document.getElementById('audio-identity');
    const toggle = document.getElementById('audio-toggle');

    if (isMuted) {
        river.play().catch(() => { });
        if (currentSlide >= 3) {
            if (identity) { identity.play().catch(() => { }); identityStarted = true; }
        } else {
            if (main && mainMusicStarted) main.play().catch(() => { });
        }
        toggle.classList.remove('muted');
        isMuted = false;
    } else {
        main.pause();
        river.pause();
        if (identity) { identity.pause(); identityStarted = false; }
        toggle.classList.add('muted');
        isMuted = true;
    }
}

function setRiverVolume(val) {
    document.getElementById('audio-river').volume = val;
}

function updateVolTooltip(input) {
    const tooltip = input.parentElement.querySelector('.vol-tooltip');
    if (tooltip) tooltip.textContent = Math.round(input.value * 100) + '%';
}

function setMainVolume(val) {
    const main = document.getElementById('audio-main');
    const identity = document.getElementById('audio-identity');
    if (main) main.volume = val;
    if (identity) identity.volume = val;
}

function playSpecialAudio() {
    const special = document.getElementById('audio-special');
    if (!isMuted) {
        special.currentTime = 0;
        special.play().catch(e => console.log("Special audio failed"));
    }
}

// --- Navigation ---

function nextSlide() {
    const current = (currentSlide === 0) ? document.getElementById('splash-screen') : document.getElementById(`slide-${currentSlide}`);
    if (current) {
        current.classList.remove('active');
        if (currentSlide === 0) {
            current.style.opacity = '0';
        }
        setTimeout(() => { if (!current.classList.contains('active')) current.style.display = 'none'; }, 800);
    }

    currentSlide++;
    const next = document.getElementById(`slide-${currentSlide}`);
    const musicControl = document.getElementById('music-control');

    // Audio management based on slide
    if (currentSlide >= 1) {
        if (musicControl) musicControl.style.display = 'flex';
        if (!mainMusicStarted && !isMuted) {
            const main = document.getElementById('audio-main');
            if (main) {
                main.play().catch(e => console.log("Main music play blocked", e));
                mainMusicStarted = true;
            }
        }
    } else {
        if (musicControl) musicControl.style.display = 'none';
    }

    if (next) {
        next.style.display = 'flex';
        void next.offsetWidth;
        next.classList.add('active');
        initSlideAssets(currentSlide);
    } else {
        currentSlide--;
        current.classList.add('active');
        current.style.display = 'flex';
    }
}

function prevSlide() {
    if (currentSlide <= 0) return;

    const current = document.getElementById(`slide-${currentSlide}`);
    if (current) {
        current.classList.remove('active');
        setTimeout(() => { if (!current.classList.contains('active')) current.style.display = 'none'; }, 800);
    }

    currentSlide--;
    const prev = (currentSlide === 0) ? document.getElementById('splash-screen') : document.getElementById(`slide-${currentSlide}`);

    const musicControl = document.getElementById('music-control');
    if (currentSlide < 1) {
        if (musicControl) musicControl.style.display = 'none';
        // Tornati alla splash: muta bg_main, lascia solo il fiume
        const main = document.getElementById('audio-main');
        if (main) { main.pause(); main.currentTime = 0; }
        const identity = document.getElementById('audio-identity');
        if (identity) { identity.pause(); identity.currentTime = 0; }
        mainMusicStarted = false;
        identityStarted = false;
    } else {
        if (musicControl) musicControl.style.display = 'flex';
    }

    if (prev) {
        prev.style.display = 'flex';
        if (currentSlide === 0) {
            prev.style.opacity = '1';
        }
        void prev.offsetWidth;
        prev.classList.add('active');
        if (currentSlide > 0) initSlideAssets(currentSlide);
    }
}

function goToSlide(n) {
    const current = (currentSlide === 0)
        ? document.getElementById('splash-screen')
        : document.getElementById(`slide-${currentSlide}`);
    if (current) {
        current.classList.remove('active');
        if (currentSlide === 0) current.style.opacity = '0';
        setTimeout(() => { if (!current.classList.contains('active')) current.style.display = 'none'; }, 800);
    }
    currentSlide = n;
    const target = document.getElementById(`slide-${currentSlide}`);
    if (target) {
        target.style.display = 'flex';
        void target.offsetWidth;
        target.classList.add('active');
        initSlideAssets(currentSlide);
    }
}

function resetQuiz() {
    document.querySelectorAll('#quiz-options .quiz-btn').forEach(b => {
        b.disabled = false;
        b.classList.remove('quiz-correct', 'quiz-wrong-sel');
    });
    const msg = document.getElementById('quiz-feedback-msg');
    if (msg) { msg.style.display = 'none'; msg.textContent = ''; }
    const continueBtn = document.getElementById('quiz-continue-btn');
    if (continueBtn) continueBtn.style.display = 'none';
}

function showRomaFeedback() {
    showFeedback('ROMA', 'La partenza dell\'ultima marcia dopo il sacco del 410 d.C. Alarico portava con sé non solo oro e argento, ma forse qualcosa di molto più prezioso e misterioso...', false, null);
    setTimeout(() => {
        const btn = document.getElementById('feedback-btn');
        if (btn) {
            btn.innerHTML = 'Vuoi giocare al quiz<br>"Il Tesoro di Alarico"?';
            btn.onclick = () => { closeModal('feedback-modal'); resetQuiz(); goToSlide(4); };
        }
    }, 0);
}

function goToSplash() {
    document.querySelectorAll('.slide').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    currentSlide = 0;
    mainMusicStarted = false;
    identityStarted = false;
    const main = document.getElementById('audio-main');
    if (main) { main.pause(); main.currentTime = 0; }
    const identity = document.getElementById('audio-identity');
    if (identity) { identity.pause(); identity.currentTime = 0; }
    const musicControl = document.getElementById('music-control');
    if (musicControl) musicControl.style.display = 'none';
    const splash = document.getElementById('splash-screen');
    splash.style.opacity = '1';
    splash.style.display = 'flex';
    void splash.offsetWidth;
    splash.classList.add('active');
}

function restartGame() {
    document.querySelectorAll('.slide').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });

    const identity = document.getElementById('audio-identity');
    if (identity) { identity.pause(); identity.currentTime = 0; }
    const main = document.getElementById('audio-main');
    if (main && !isMuted) { main.currentTime = 0; main.play().catch(() => { }); }

    currentSlide = 1;
    const first = document.getElementById('slide-1');
    first.style.display = 'flex';
    void first.offsetWidth;
    first.classList.add('active');

    // Reset states
    document.getElementById('final-reveal').style.display = 'none';
    document.getElementById('final-scrigno').style.opacity = '1';
    document.getElementById('final-scrigno').style.transform = 'scale(1)';
    const cart = document.getElementById('cart-4');
    if (cart) cart.innerHTML = '<span>Trascina gli oggetti qui</span>';
}

/* --- Quiz Slide 4 --- */
function quizAnswer(btn) {
    if (btn.disabled) return;
    const isCorrect = btn.dataset.correct === 'true';
    const msg = document.getElementById('quiz-feedback-msg');

    if (isCorrect) {
        btn.classList.add('quiz-correct');
        btn.disabled = true;
        if (msg) { msg.textContent = '✓ Risposta corretta!'; msg.style.display = 'block'; msg.style.color = '#145a28'; }
        setTimeout(() => {
            openGraalOverlay();
            const continueBtn = document.getElementById('quiz-continue-btn');
            if (continueBtn) continueBtn.style.display = 'block';
        }, 600);
    } else {
        btn.disabled = true;
        btn.classList.add('quiz-wrong-sel');
        if (msg) { msg.textContent = '✗ Non è corretto, riprova!'; msg.style.display = 'block'; msg.style.color = '#7b0000'; }
        setTimeout(() => {
            btn.classList.remove('quiz-wrong-sel');
            btn.disabled = false;
            if (msg) msg.style.display = 'none';
        }, 900);
    }
}

function initSlideAssets(slideId) {
    if (slideId === 4) resetQuiz();
    if (slideId === 5) setupDragAndDrop();
    if (slideId === 6) initPhraseAnimation();
    if (slideId === 9) layoutSpiral();
    if (window.lucide) window.lucide.createIcons();

    const main = document.getElementById('audio-main');
    const identity = document.getElementById('audio-identity');
    if (!isMuted) {
        if (slideId >= 3) {
            if (main) { main.pause(); }
            if (identity && !identityStarted) {
                identity.play().catch(() => { });
                identityStarted = true;
            }
        } else {
            if (identity) { identity.pause(); identity.currentTime = 0; identityStarted = false; }
            if (main && main.paused && mainMusicStarted) main.play().catch(() => { });
        }
    }
}

function layoutSpiral() {
    const wall = document.querySelector('#slide-9 .photo-wall');
    if (!wall) return;
    const wW = wall.offsetWidth;
    const wH = wall.offsetHeight;
    if (!wW || !wH) return;

    const cx = wW / 2;
    const cy = wH / 2;
    const isMobile = wW <= 600;
    const CARD_W = isMobile ? 90 : 155;
    const CARD_H = isMobile ? 82 : 140;
    const GOLDEN = 137.5077 * Math.PI / 180;

    const all = [...wall.querySelectorAll('.photo-card')];
    const feat = wall.querySelector('.photo-card-featured');
    const others = all.filter(c => c !== feat);
    const N = others.length;

    const rX = wW * (isMobile ? 0.38 : 0.45);
    const rY = wH * (isMobile ? 0.38 : 0.45);

    if (feat) {
        feat.style.left = (cx - CARD_W / 2) + 'px';
        feat.style.top = (cy - CARD_H / 2) + 'px';
    }

    others.forEach((card, i) => {
        const n = i + 1;
        const frac = Math.sqrt(n) / Math.sqrt(N);
        const ang = n * GOLDEN;
        card.style.left = (cx + rX * frac * Math.cos(ang) - CARD_W / 2) + 'px';
        card.style.top = (cy + rY * frac * Math.sin(ang) - CARD_H / 2) + 'px';
    });
}

window.addEventListener('resize', () => {
    if (currentSlide === 9) layoutSpiral();
});

function initPhraseAnimation() {
    const el = document.querySelector('.dossier-phrase');
    if (!el || el.dataset.animated) return;
    el.dataset.animated = '1';
    setTimeout(() => {
        el.style.animation = 'phraseTriumphal 2.4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards';
        el.addEventListener('animationend', () => {
            el.style.opacity = '1';
            el.style.animation = 'glowText 2s infinite alternate';
        }, { once: true });
    }, 200);
}

// --- Modals & Feedback ---

function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'block';
        if (id === 'audio-final-modal') {
            const voce = document.getElementById('audio-voce-finale');
            if (voce && !isMuted) {
                voce.currentTime = 0;
                voce.play().catch(e => console.log("Voce finale failed", e));
            }
        } else if (id.includes('audio')) {
            playSpecialAudio();
        }
    }
}

function openGraalOverlay() {
    const overlay = document.getElementById('graal-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    document.getElementById('graal-btn').style.display = 'block';
    document.getElementById('graal-text-box').style.display = 'none';
}

function showGraalText() {
    document.getElementById('graal-btn').style.display = 'none';
    document.getElementById('graal-text-box').style.display = 'block';
}

function closeGraalOverlay() {
    document.getElementById('graal-overlay').style.display = 'none';
}

function openGraalSub(type) {
    document.getElementById('graal-sub-oro').style.display = 'none';
    document.getElementById('graal-sub-argento').style.display = 'none';
    document.getElementById('graal-sub-' + type).style.display = 'flex';
}

function closeGraalSub(type) {
    document.getElementById('graal-sub-' + type).style.display = 'none';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        if (id === 'dossier-modal') {
            const container = document.getElementById('dossier-modal-container');
            if (container && container.classList.contains('modal-theme-verdetto')) {
                const btnDopoVerdetto = document.getElementById('btn-dopo-verdetto');
                if (btnDopoVerdetto) {
                    btnDopoVerdetto.style.display = 'block';
                    setTimeout(() => { btnDopoVerdetto.style.opacity = '1'; }, 50);
                }
            }
        }
        modal.style.display = 'none';
        const special = document.getElementById('audio-special');
        special.pause();
        const voce = document.getElementById('audio-voce-finale');
        if (voce) voce.pause();
    }
}

function showFeedback(title, text, isSuccess = false, imagePath = null) {
    if (text === undefined) {
        text = title;
        title = "Dettaglio";
    }
    const modal = document.getElementById('feedback-modal');
    document.getElementById('feedback-title').innerText = title;
    document.getElementById('feedback-text').innerHTML = text;

    const imgElement = document.getElementById('feedback-img');
    if (imagePath && imgElement) {
        imgElement.src = `assets/gallery/${imagePath}`;
        imgElement.style.display = 'block';
    } else if (imgElement) {
        imgElement.style.display = 'none';
    }

    const btn = document.getElementById('feedback-btn');
    const originalText = "Chiudi";

    if (isSuccess) {
        btn.innerText = "Continua l'indagine";
        btn.onclick = () => {
            closeModal('feedback-modal');
            nextSlide();
            setTimeout(() => {
                btn.innerText = originalText;
                btn.onclick = () => closeModal('feedback-modal');
            }, 500);
        };
    } else {
        btn.innerText = originalText;
        btn.onclick = () => closeModal('feedback-modal');
    }

    showModal('feedback-modal');
    setTimeout(() => {
        const scrollZone = document.getElementById('feedback-scroll-zone');
        if (scrollZone) scrollZone.scrollTop = 0;
    }, 0);
}

function showHint(num) {
    const hints = { 4: "Pensa al V secolo. Smartphone e occhiali non sono compatibili." };
    showFeedback("Indizio", hints[num] || "Esplora gli elementi interattivi.");
}

// --- Enigma Slide 4: Drag & Drop ---

function setupDragAndDrop() {
    const draggables = document.querySelectorAll('.drag-item');
    const cartZone = document.getElementById('cart-4');
    const poolZone = document.getElementById('pool-4');
    if (!cartZone || !poolZone) return;

    function updateCartPlaceholder() {
        const span = cartZone.querySelector('span');
        const hasItems = cartZone.querySelectorAll('.drag-item').length > 0;
        if (span) span.style.display = hasItems ? 'none' : 'block';
    }

    draggables.forEach(item => {
        item.addEventListener('dragstart', () => item.classList.add('dragging'));
        item.addEventListener('dragend', () => item.classList.remove('dragging'));

        // Convenience click-to-move feature
        item.addEventListener('click', () => {
            if (item.parentElement.id === 'cart-4') {
                poolZone.appendChild(item);
            } else {
                cartZone.appendChild(item);
            }
            updateCartPlaceholder();
        });
    });

    [cartZone, poolZone].forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('over');
        });

        zone.addEventListener('dragleave', () => zone.classList.remove('over'));

        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('over');
            const dragging = document.querySelector('.dragging');
            if (dragging) {
                zone.appendChild(dragging);
                updateCartPlaceholder();
            }
        });
    });
}

function checkInventory() {
    const itemsInCart = [...document.querySelectorAll('#cart-4 .drag-item')];
    const itemIds = itemsInCart.map(item => item.getAttribute('data-id'));

    if (itemIds.length === 0) {
        showFeedback("Carro Vuoto", "Raccogli gli oggetti dal sacco di Roma.");
        return;
    }

    const wrongItems = itemIds.filter(id => id === 'phone' || id === 'glasses');
    const correctItems = itemIds.filter(id => id !== 'phone' && id !== 'glasses');

    if (wrongItems.length > 0) {
        showFeedback("Anacronismo", "Attenzione agli oggetti che non appartengono al passato.");
    } else if (correctItems.length < 4) {
        showFeedback("Incompleto", "Mancono alcuni pezzi del vero tesoro storico.");
    } else {
        showFeedback("Successo", "Il carro è pronto. <b>Frammento n. 1:</b> IL TESORO NASCE DAL SACCO DI ROMA", true);
    }
}

// --- Quiz Slide 5 ---

function selectQuizOption(element, value) {
    document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedQuizOption = value;
}

function checkQuiz() {
    if (!selectedQuizOption) {
        showFeedback("Scegli", "Seleziona una risposta.");
        return;
    }

    if (selectedQuizOption === 'C') {
        showFeedback("Corretto", "La ricerca storica richiede spirito critico. <b>Frammento n. 2:</b> IL MISTERO SI RISOLVE CON LE FONTI", true);
    } else {
        showFeedback("Rifletti", "Una storia famosa non è sempre una storia vera.");
    }
}

// --- Final Reveal Slide 8 ---

function revealFinalTruth() {
    const scrigno = document.getElementById('final-scrigno');
    const reveal = document.getElementById('final-reveal');

    scrigno.style.transition = '0.5s';
    scrigno.style.transform = 'scale(0) rotate(20deg)';
    scrigno.style.opacity = '0';

    playSpecialAudio();

    setTimeout(() => {
        reveal.style.display = 'block';
        reveal.style.animation = 'fadeInUp 1s forwards';
    }, 500);
}

window.onload = () => {
    // Initial icons
    if (window.lucide) window.lucide.createIcons();
    // Audio toggle visually muted at start
    const toggle = document.getElementById('audio-toggle');
    if (toggle) toggle.classList.add('muted');
};

const style = document.createElement('style');
style.textContent = `@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

/* --- DOSSIER LOGIC --- */
const dossierData = {
    mito: {
        title: "",
        subtitle: "",
        body: "Jordanes è la fonte da cui nasce la versione più famosa della storia.<br><br>Secondo il suo racconto, dopo la morte di Alarico il Busento venne deviato, la tomba scavata nel letto del fiume e il re sepolto con il suo tesoro. Poi l’acqua tornò a scorrere, cancellando ogni traccia.<br><br>È una narrazione potente, visiva, memorabile.<br>È il cuore della leggenda.",
        highlight: "Ciò che rende immortale un mito non è la prova, ma la forza del racconto.",
        icon: "scroll",
        image: "jordanes.png"
    },
    dubbio: {
        title: "",
        subtitle: "",
        body: "Una tradizione alternativa attribuita a Olimpiodoro di Tebe mette in crisi la versione più nota.<br><br>Secondo questa ipotesi, le ricchezze di Alarico non sarebbero state sepolte in Calabria. Sarebbero rimaste altrove, forse in area francese. Si racconta che Ataulfo mostrò il tesoro durante il suo matrimonio con Galla Placidia.<br><br>Se questa versione fosse vera, il mito del Busento perderebbe il suo fondamento materiale.<br>Resterebbe la leggenda. Ma non il tesoro.",
        highlight: "A volte basta un dubbio per incrinare una certezza secolare.",
        icon: "book-open",
        image: "olimpiodoro.png"
    },
    prova: {
        title: "",
        subtitle: "",
        body: "Nei secoli, molti hanno creduto di aver trovato indizi della tomba di Alarico.<br><br>Nel territorio di Mendicino, nell’area di Caronte e Alimena, alcuni segni sulla roccia e una grotta furono interpretati come prove.<br><br>Ma le indagini tecniche condotte da Ispra e dal Gruppo Tutela Patrimonio Archeologico della Guardia di Finanza hanno ridimensionato queste ipotesi.<br><br>La presunta croce sarebbe un fenomeno naturale.<br>Il deposito nella grotta non mostrerebbe origine umana.",
        highlight: "La scienza non distrugge il mistero. Lo mette alla prova.",
        icon: "search"
    },
    verdetto: {
        title: "Il verdetto",
        subtitle: "",
        body: `<span class="verdetto-line" style="animation-delay:0s">Jordanes offre il racconto più affascinante.</span>
<span class="verdetto-line" style="animation-delay:1.3s">Olimpiodoro introduce una crepa nel mito.</span>
<span class="verdetto-line" style="animation-delay:2.6s">Le verifiche moderne chiedono prove concrete.</span>
<span class="verdetto-conclusion" style="animation-delay:3.9s">La tomba di Alarico resta sospesa tra la forza della leggenda e il rigore della storia.</span>
<span class="verdetto-finale" style="animation-delay:5.2s">Il Busento conserva il silenzio.<br>La storia continua a cercare.</span>`,
        highlight: "",
        icon: "scale"
    }
};

function showDossier(type) {
    const container = document.getElementById('dossier-modal-container');
    const data = dossierData[type];

    if (!data || !container) return;

    // Reset classes
    container.className = 'modal-content dossier-modal-content';
    container.classList.add(`modal-theme-${type}`);

    // Scrollbar: hide for verdetto (short content), show for others
    const scrollZone = document.getElementById('dossier-scroll-zone');
    if (scrollZone) scrollZone.style.overflowY = type === 'verdetto' ? 'hidden' : 'auto';

    const titleEl = document.getElementById('dossier-title');
    titleEl.innerHTML = data.title;
    titleEl.style.display = data.title ? 'block' : 'none';
    document.getElementById('dossier-subtitle').innerHTML = data.subtitle;
    document.getElementById('dossier-subtitle').style.display = data.subtitle ? 'block' : 'none';
    document.getElementById('dossier-body').innerHTML = data.body;
    document.getElementById('dossier-highlight').innerHTML = data.highlight;

    const iconContainer = document.querySelector('.dossier-modal-icon-container');
    if (iconContainer) {
        if (data.image) {
            iconContainer.innerHTML = `<img src="assets/gallery/${data.image}" alt="${data.title}" style="width:100%; max-height:220px; object-fit:cover; object-position:top center; border-radius:8px; border:1px solid var(--gold); margin-bottom:0.5rem;">`;
        } else {
            iconContainer.innerHTML = `<i data-lucide="${data.icon}"></i>`;
        }
    }

    if (window.lucide) window.lucide.createIcons();

    showModal('dossier-modal');
    setTimeout(() => {
        const scrollableZone = document.getElementById('dossier-scroll-zone');
        if (scrollableZone) scrollableZone.scrollTop = 0;
    }, 0);

}

/* --- LIGHTBOX --- */
function openLightbox(src) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lb || !img) return;
    img.src = src;
    lb.style.display = 'flex';
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.style.display = 'none';
}

// Close lightbox on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});
