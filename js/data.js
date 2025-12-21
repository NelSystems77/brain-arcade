const GAME_DATA = {
    cine: {
        anagrams: ["TITANIC", "AVATAR", "GLADIADOR", "MATRIX", "ROCKY"],
        memory: ["🍿", "🎬", "🎟️", "🎥", "🏆", "🧛", "👽", "🤠"],
        // Crucigrama: BATMAN (H), AVATAR (V), MATRIX (V)
        crossword: [
            { word: "BATMAN", clue: "El caballero de la noche", startX: 1, startY: 3, direction: "horizontal" },
            { word: "AVATAR", clue: "Película de seres azules", startX: 2, startY: 3, direction: "vertical" }, 
            { word: "MATRIX", clue: "Vivimos en una simulación", startX: 4, startY: 3, direction: "vertical" }
        ]
    },

    rock: {
        anagrams: ["METALLICA", "NIRVANA", "QUEEN", "BEATLES", "KISS"],
        memory: ["🎸", "🥁", "🎤", "🤘", "🎹", "💿", "🎵", "⚡"],
        // Crucigrama: BEATLES (V), ELVIS (H), QUEEN (H)
        crossword: [
            // Palabra columna vertebral: BEATLES (Vertical en x=2)
            // B(2,1), E(2,2), A(2,3), T(2,4), L(2,5), E(2,6), S(2,7)
            { 
                word: "BEATLES", 
                clue: "La banda más famosa de Liverpool", 
                startX: 2, startY: 1, 
                direction: "vertical" 
            },
            // Cruza en la 'L' de BEATLES (Posición 2,5)
            // ELVIS: E(1,5), L(2,5), V(3,5), I(4,5), S(5,5)
            { 
                word: "ELVIS", 
                clue: "El rey del Rock and Roll", 
                startX: 1, startY: 5, 
                direction: "horizontal" 
            },
            // Cruza en la segunda 'E' de BEATLES (Posición 2,6)
            // QUEEN: Q(0,6), U(1,6), E(2,6), E(3,6), N(4,6)
            { 
                word: "QUEEN", 
                clue: "Banda de Freddie Mercury", 
                startX: 0, startY: 6, 
                direction: "horizontal" 
            }
        ]
    },

    biblia: {
        anagrams: ["GENESIS", "EXODO", "SALMOS", "MATEO", "DANIEL"],
        memory: ["✝️", "🕊️", "🍎", "🐳", "🦁", "👑", "🍷", "🥖"],
        // Crucigrama: DAVID (V), GOLIAT (H), ADAN (H)
        crossword: [
            // Columna vertebral: DAVID (Vertical en x=4)
            // D(4,1), A(4,2), V(4,3), I(4,4), D(4,5)
            { 
                word: "DAVID", 
                clue: "Rey que venció a un gigante", 
                startX: 4, startY: 1, 
                direction: "vertical" 
            },
            // Cruza en la 'A' de DAVID (Posición 4,2)
            // ADAN: A(2,2), D(3,2), A(4,2), N(5,2)
            { 
                word: "ADAN", 
                clue: "El primer hombre", 
                startX: 2, startY: 2, 
                direction: "horizontal" 
            },
            // Cruza en la 'I' de DAVID (Posición 4,4)
            // GOLIAT: G(1,4), O(2,4), L(3,4), I(4,4), A(5,4), T(6,4)
            { 
                word: "GOLIAT", 
                clue: "Gigante filisteo", 
                startX: 1, startY: 4, 
                direction: "horizontal" 
            }
        ]
    },

    ochentas: {
        anagrams: ["ALF", "MACGYVER", "THUNDERCATS", "HEMAN", "GHOSTBUSTERS"],
        memory: ["🕹️", "💾", "📻", "📺", "📼", "🛹", "👾", "🕺"],
        // Crucigrama: MACGYVER (H), ALF (V), ET (V)
        crossword: [
            // Palabra larga horizontal: MACGYVER (y=3)
            // M(1,3), A(2,3), C(3,3), G(4,3), Y(5,3), V(6,3), E(7,3), R(8,3)
            { 
                word: "MACGYVER", 
                clue: "Agente que arreglaba todo con una navaja", 
                startX: 1, startY: 3, 
                direction: "horizontal" 
            },
            // Cruza en la 'A' de MACGYVER (Posición 2,3)
            // ALF: A(2,3), L(2,4), F(2,5)
            { 
                word: "ALF", 
                clue: "Extraterrestre peludo de Melmac", 
                startX: 2, startY: 3, 
                direction: "vertical" 
            },
            // Cruza en la 'E' de MACGYVER (Posición 7,3)
            // ET: E(7,3), T(7,4)
            { 
                word: "ET", 
                clue: "El extraterrestre que quería llamar a casa", 
                startX: 7, startY: 3, 
                direction: "vertical" 
            }
        ]
    }
};