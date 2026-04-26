const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos del DOM (Menús, Botones y HUD)
const menu = document.getElementById('menu');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const hud = document.getElementById('hud');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const menuTitle = document.getElementById('menu-title');

// --- SISTEMA RESPONSIVO ---
// Definimos el tamaño "lógico" del juego (internamente siempre será de 400x600)
const ANCHO_BASE = 400;
const ALTO_BASE = 600;

function ajustarResolucion() {
    // Calculamos qué tanto debemos escalar el canvas para que quepa en la pantalla
    const escala = Math.min(window.innerWidth / ANCHO_BASE, window.innerHeight / ALTO_BASE);
    
    // El tamaño interno del juego se mantiene fijo
    canvas.width = ANCHO_BASE;
    canvas.height = ALTO_BASE;
    
    // El tamaño visual (CSS) cambia según el tamaño de la pantalla
    canvas.style.width = (ANCHO_BASE * escala) + 'px';
    canvas.style.height = (ALTO_BASE * escala) + 'px';
}

// Ajustar la resolución al cargar y al girar la pantalla del celular
window.addEventListener('resize', ajustarResolucion);
window.addEventListener('load', ajustarResolucion);


// Variables del juego
let animacionId;
let jugando = false;
let pause = false;
let puntos = 0;
let vidas = 3;
let frameCount = 0;

// Cargar Imágenes
const jugadorImg = new Image();
jugadorImg.src = 'img/panda.png';

const cocodriloImg = new Image();
cocodriloImg.src = 'img/cocodrilo.png';

// Objeto Jugador
const jugador = {
    x: 175, // Centrado en el ANCHO_BASE (400)
    y: 500, // Cerca del fondo del ALTO_BASE (600)
    width: 50,
    height: 50,
    velocidad: 5,
    dx: 0
};

// Arreglo de cocodrilos
let cocodrilos = [];

// --- CONTROLES DE TECLADO (Para Computadora) ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') jugador.dx = -jugador.velocidad;
    if (e.key === 'ArrowRight' || e.key === 'd') jugador.dx = jugador.velocidad;
});

document.addEventListener('keyup', (e) => {
    if (
        e.key === 'ArrowLeft' || e.key === 'a' ||
        e.key === 'ArrowRight' || e.key === 'd'
    ) {
        jugador.dx = 0;
    }
});

// --- CONTROLES TÁCTILES (Para Celular) ---
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Evita scroll y zoom
    
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width; // Calculamos la proporción actual
    
    // Obtenemos la coordenada X real del toque adaptada a nuestra resolución base
    const touchX = (e.touches[0].clientX - rect.left) * escalaX;

    // Mitad izquierda o derecha de la pantalla
    if (touchX < canvas.width / 2) {
        jugador.dx = -jugador.velocidad;
    } else {
        jugador.dx = jugador.velocidad;
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    jugador.dx = 0; // Detener al panda cuando se suelta la pantalla
}, { passive: false });


// --- LÓGICA DEL JUEGO ---

// Función para generar cocodrilos
function generarCocodrilos() {
    if (frameCount % 60 === 0) {
        let xAleatorio = Math.random() * (canvas.width - 80);
        cocodrilos.push({
            x: xAleatorio,
            y: -50,
            width: 80,
            height: 30,
            velocidad: 3 + Math.random() * 2
        });
    }
}

// Bucle principal
function actualizarJuego() {
    if (!jugando) return;
    if (pause) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mover y dibujar al jugador
    jugador.x += jugador.dx;
    
    // Límites de la pantalla para el jugador
    if (jugador.x < 0) jugador.x = 0;
    if (jugador.x + jugador.width > canvas.width) jugador.x = canvas.width - jugador.width;
    
    if(jugadorImg.complete) {
        ctx.drawImage(jugadorImg, jugador.x, jugador.y, jugador.width, jugador.height);
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(jugador.x, jugador.y, jugador.width, jugador.height);
    }

    generarCocodrilos();

    for (let i = 0; i < cocodrilos.length; i++) {
        let croc = cocodrilos[i];
        croc.y += croc.velocidad;

        if(cocodriloImg.complete) {
            ctx.drawImage(cocodriloImg, croc.x, croc.y, croc.width, croc.height);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(croc.x, croc.y, croc.width, croc.height);
        }

        // Colisiones
        if (
            jugador.x < croc.x + croc.width &&
            jugador.x + jugador.width > croc.x &&
            jugador.y < croc.y + croc.height &&
            jugador.y + jugador.height > croc.y
        ) {
            vidas--;
            livesDisplay.innerText = vidas;
            cocodrilos.splice(i, 1);
            
            if (vidas <= 0) {
                terminarJuego();
            }
        }

        // Puntuación
        if (croc && croc.y > canvas.height) {
            cocodrilos.splice(i, 1);
            puntos += 10;
            scoreDisplay.innerText = puntos;
            i--;
        }
    }
    
    frameCount++;
    animacionId = requestAnimationFrame(actualizarJuego);
}


// --- FUNCIONES DE ESTADO (Iniciar, Terminar, Botones) ---

function iniciarJuego() {
    menu.style.display = 'none';
    hud.style.display = 'flex';
    
    jugando = true;
    pause = false;
    puntos = 0;
    vidas = 3;
    cocodrilos = [];
    jugador.x = 175; // Reinicia al centro
    
    scoreDisplay.innerText = puntos;
    livesDisplay.innerText = vidas;
    pauseBtn.innerText = 'Pausar';
    
    frameCount = 0;
    ajustarResolucion(); // Aseguramos que la resolución sea correcta al iniciar
    actualizarJuego();
}

function terminarJuego() {
    jugando = false;
    cancelAnimationFrame(animacionId);
    menu.style.display = 'flex';
    hud.style.display = 'none';
    menuTitle.innerText = `¡Juego Terminado! Puntos: ${puntos}`;
    startBtn.innerText = 'Reiniciar';
}

// Eventos de botones de la interfaz
startBtn.addEventListener('click', iniciarJuego);

homeBtn.addEventListener('click', () => {
    jugando = false;
    pause = false;
    cancelAnimationFrame(animacionId);
    
    hud.style.display = 'none';
    menu.style.display = 'flex';
    menuTitle.innerText = 'El Río Peligroso';
    startBtn.innerText = 'Jugar';
});

restartBtn.addEventListener('click', () => {
    cancelAnimationFrame(animacionId);
    iniciarJuego();
});

pauseBtn.addEventListener('click', () => {
    if (!jugando) return;
    pause = !pause; 
    if (pause) { 
        cancelAnimationFrame(animacionId);
        pauseBtn.innerText = 'Reanudar';
    } else {
        pauseBtn.innerText = 'Pausar';
        actualizarJuego();
    }
});
