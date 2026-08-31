export const GAME_DATA = {
    cine: {
        anagrams: ["TITANIC", "AVATAR", "GLADIADOR", "MATRIX", "ROCKY", "STAR WARS", "EL PADRINO", "FORREST GUMP", "JURASSIC PARK", "TERMINATOR", "VOLVER AL FUTURO", "EL SEÑOR DE LOS ANILLOS", "HARRY POTTER", "JURASSIC WORLD", "LOS VENGADORES", "IRON MAN", "BATMAN", "EL CABALLERO DE LA NOCHE", "SUPERMAN", "SPIDER-MAN", "TOY STORY", "BUSCANDO A NEMO", "EL REY LEON", "ALADDIN", "LA BELLA Y LA BESTIA", "FROZEN", "SHREK", "MADAGASCAR", "LOS INCREIBLES", "COCO", "UP", "WALL-E", "RATATOUILLE", "MONSTERS INC", "PIRATAS DEL CARIBE", "INDIANA JONES", "MISION IMPOSIBLE", "RAPIDOS Y FURIOSOS", "TRANSFORMERS", "CREPUSCULO", "LOS JUEGOS DEL HAMBRE", "DIVERGENTE", "EL ORIGEN", "INTERESTELAR", "DUNKERQUE", "TENET", "PULP FICTION", "KILL BILL", "DJANGO SIN CADENAS", "BASTARDOS SIN GLORIA", "EL SILENCIO DE LOS INOCENTES", "SE7EN", "EL CLUB DE LA PELEA", "AMERICAN BEAUTY", "BRAVEHEART", "TROYA", "300", "CASABLANCA", "LO QUE EL VIENTO SE LLEVO", "PSICOSIS", "TIBURON", "ET", "REGRESO AL FUTURO II", "REGRESO AL FUTURO III", "LA GUERRA DE LOS MUNDOS", "INDEPENDENCE DAY", "ARMAGEDDON", "EL DIA DESPUES DE MAÑANA", "GRAVEDAD", "LA VIDA ES BELLA", "AMELIE", "EL LABERINTO DEL FAUNO", "CIUDAD DE DIOS", "BICHOS", "PARASITOS", "OLD BOY", "EL VIAJE DE CHIHIRO", "AKIRA", "GHOST IN THE SHELL", "EL PROYECTO DE LA BRUJA DE BLAIR", "ACTIVIDAD PARANORMAL", "EL EXORCISTA", "IT", "HALLOWEEN", "PESADILLA EN LA CALLE DEL INFIERNO", "VIERNES 13", "MAD MAX", "MAD MAX FURIA EN EL CAMINO", "LA LA LAND", "WHIPLASH", "EL GRAN SHOWMAN", "BOHEMIAN RHAPSODY", "ROCKETMAN", "EL LOBO DE WALL STREET", "EL GRAN GATSBY", "JOKER", "DEADPOOL", "LOGAN", "WONDER WOMAN", "CAPITAN AMERICA"],
        memory: ["🍿", "🎬", "🎟️", "🎥", "🏆", "🧛", "👽", "🤠"],
        // Crucigrama: BATMAN (H), AVATAR (V), MATRIX (V)
        crossword: [
            { word: "BATMAN", clue: "El caballero de la noche", startX: 1, startY: 3, direction: "horizontal" },
            { word: "AVATAR", clue: "Película de seres azules", startX: 2, startY: 3, direction: "vertical" }, 
            { word: "MATRIX", clue: "Vivimos en una simulación", startX: 4, startY: 3, direction: "vertical" }
        ]
    },

    rock: {
        anagrams: ["METALLICA", "NIRVANA", "QUEEN", "THE BEATLES", "KISS", "AC/DC", "LED ZEPPELIN", "PINK FLOYD", "GUNS N' ROSES", "AEROSMITH", "THE ROLLING STONES", "U2", "PEARL JAM", "RED HOT CHILI PEPPERS", "RADIOHEAD", "LINKIN PARK", "GREEN DAY", "FOO FIGHTERS", "OASIS", "THE WHO", "BON JOVI", "DEF LEPPARD", "IRON MAIDEN", "BLACK SABBATH", "DEEP PURPLE", "JUDAS PRIEST", "SLIPKNOT", "SYSTEM OF A DOWN", "RAMONES", "THE DOORS", "CREEDENCE CLEARWATER REVIVAL", "VAN HALEN", "ALICE IN CHAINS", "SOUNDGARDEN", "SMASHING PUMPKINS", "BLINK-182", "THE CURE", "R.E.M.", "MUSE", "ARCTIC MONKEYS", "KORN", "EVANESCENCE", "LIMP BIZKIT", "THE OFFSPRING", "PARAMORE", "MY CHEMICAL ROMANCE", "THE STROKES", "KINGS OF LEON", "AVENGED SEVENFOLD", "TOOL", "MEGADETH", "PANTERA", "MOTÖRHEAD", "SCORPIONS", "WHITESNAKE", "EUROPE", "JOURNEY", "FOREIGNER", "BOSTON", "RUSH", "YES", "GENESIS", "EAGLES", "LYNYRD SKYNYRD", "ZZ TOP", "STEELY DAN", "THE POLICE", "TALKING HEADS", "BLONDIE", "FLEETWOOD MAC", "HEART", "PAT BENATAR", "THE KINKS", "THE YARDBIRDS", "CREAM", "JIMI HENDRIX EXPERIENCE", "THE ALLMAN BROTHERS BAND", "DIRE STRAITS", "SIMPLE MINDS", "DEPECHE MODE", "INXS", "THE SMITHS", "JOY DIVISION", "NEW ORDER", "PLACEBO", "FRANZ FERDINAND", "INTERPOL", "PIXIES", "WEEZER", "FALL OUT BOY", "PANIC! AT THE DISCO", "IMAGINE DRAGONS", "THREE DAYS GRACE", "DISTURBED", "SKILLET", "ALTER BRIDGE", "SEETHER", "NICKELBACK", "STONE TEMPLE PILOTS", "THE WHITE STRIPES"],
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
        anagrams: ["GENESIS", "EXODO", "LEVITICO", "NUMEROS", "DEUTERONOMIO", "JOSUE", "JUECES", "RUT", "SAMUEL", "REYES", "CRONICAS", "ESDRAS", "NEHEMIAS", "ESTER", "JOB", "SALMOS", "PROVERBIOS", "ECLESIASTES", "CANTARES", "ISAIAS", "JEREMIAS", "LAMENTACIONES", "EZEQUIEL", "DANIEL", "OSEAS", "JOEL", "AMOS", "ABDIAS", "JONAS", "MIQUEAS", "NAHUM", "HABACUC", "SOFONIAS", "HAGEO", "ZACARIAS", "MALAQUIAS", "MATEO", "MARCOS", "LUCAS", "JUAN", "HECHOS", "ROMANOS", "CORINTIOS", "GALATAS", "EFESIOS", "FILIPENSES", "COLOSENSES", "TESALONICENSES", "TIMOTEO", "TITO", "FILEMON", "HEBREOS", "SANTIAGO", "PEDRO", "JUDAS", "APOCALIPSIS", "MOISES", "ABRAHAM", "ISAAC", "JACOB", "DAVID", "SALOMON", "ELIAS", "ELISEO", "SAMUEL", "ISAIAS", "JEREMIAS", "EZEQUIEL", "DANIEL", "PEDRO", "JUAN", "SANTIAGO", "ANDRES", "FELIPE", "BARTOLOME", "TOMAS", "MATEO", "SIMON", "JUDAS", "MATIAS", "PABLO", "NOE", "ADAN", "EVA", "CAIN", "ABEL", "ENOC", "JOB", "ESTER", "RUTH", "DEBORA", "GOLIAT", "SAUL", "ELI", "SAMSON", "JOSIAS", "NEHEMIAS", "ZOROBABEL", "AARON"],
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
        anagrams: ["ALF", "MCGYVER", "THUNDERCATS", "HEMAN", "GHOSTBUSTERS", "KNIGHT RIDER", "THE A-TEAM", "MIAMI VICE", "MAGNUM PI", "AIRWOLF", "THE FALL GUY", "FAMILY TIES", "CHEERS", "THE COSBY SHOW", "FULL HOUSE", "GROWING PAINS", "WHO'S THE BOSS", "SAVED BY THE BELL", "BEVERLY HILLS 90210", "MELROSE PLACE", "FRIENDS", "SEINFELD", "THE SIMPSONS", "FUTURAMA", "DRAGON BALL", "DRAGON BALL Z", "SAINT SEIYA", "RANMA", "SAILOR MOON", "POKEMON", "DIGIMON", "POWER RANGERS", "TEENAGE MUTANT NINJA TURTLES", "DUCKTALES", "CHIP 'N DALE RESCUE RANGERS", "TALESPIN", "DARKWING DUCK", "INSPECTOR GADGET", "THE SMURFS", "CARE BEARS", "THE JETSONS", "THE FLINTSTONES", "LOONEY TUNES", "TOM AND JERRY", "PINKY AND THE BRAIN", "ANIMANIACS", "BATMAN THE ANIMATED SERIES", "SPIDER-MAN", "X-MEN", "THE WONDER YEARS", "BAYWATCH", "THE FRESH PRINCE OF BEL-AIR", "HERCULES THE LEGENDARY JOURNEYS", "XENA WARRIOR PRINCESS", "STAR TREK THE NEXT GENERATION", "STAR TREK DEEP SPACE NINE", "THE X-FILES", "TWIN PEAKS", "SLIDERS", "QUANTUM LEAP", "THE NANNY", "ROSEANNE", "DINOSAURS", "BOY MEETS WORLD", "FAMILY MATTERS", "STEP BY STEP", "SABRINA THE TEENAGE WITCH", "BUFFY THE VAMPIRE SLAYER", "CHAPULIN COLORADO", "EL CHAVO DEL OCHO", "PLAZA SESAMO", "POPEYE", "SCOOBY-DOO", "VOLTRON", "MAZINGER Z", "ROBOTECH", "TRANSFORMERS", "GI JOE", "HEATHCLIFF", "DENNIS THE MENACE", "TALES FROM THE CRYPT", "POWERPUFF GIRLS", "MASK", "SILVERHAWKS", "CAPTAIN PLANET", "BEAST WARS", "GARGOYLES", "RECESS", "HEY ARNOLD", "DOUG", "RUGRATS", "REN AND STIMPY", "COURAGE THE COWARDLY DOG", "ULTRAMAN", "SPEED RACER", "THE TICK", "SPAWN", "ANIMORPHS", "THE MASK ANIMATED SERIES"],
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