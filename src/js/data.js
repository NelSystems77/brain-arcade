export const GAME_DATA = {
    cine: {
        anagrams: ["TITANIC", "AVATAR", "GLADIADOR", "MATRIX", "ROCKY", "STAR WARS", "EL PADRINO", "FORREST GUMP", "JURASSIC PARK", "TERMINATOR", "VOLVER AL FUTURO", "EL SEÑOR DE LOS ANILLOS", "HARRY POTTER", "JURASSIC WORLD", "LOS VENGADORES", "IRON MAN", "BATMAN", "EL CABALLERO DE LA NOCHE", "SUPERMAN", "SPIDER-MAN", "TOY STORY", "BUSCANDO A NEMO", "EL REY LEON", "ALADDIN", "LA BELLA Y LA BESTIA", "FROZEN", "SHREK", "MADAGASCAR", "LOS INCREIBLES", "COCO", "UP", "WALL-E", "RATATOUILLE", "MONSTERS INC", "PIRATAS DEL CARIBE", "INDIANA JONES", "MISION IMPOSIBLE", "RAPIDOS Y FURIOSOS", "TRANSFORMERS", "CREPUSCULO", "LOS JUEGOS DEL HAMBRE", "DIVERGENTE", "EL ORIGEN", "INTERESTELAR", "DUNKERQUE", "TENET", "PULP FICTION", "KILL BILL", "DJANGO SIN CADENAS", "BASTARDOS SIN GLORIA", "EL SILENCIO DE LOS INOCENTES", "SE7EN", "EL CLUB DE LA PELEA", "AMERICAN BEAUTY", "BRAVEHEART", "TROYA", "300", "CASABLANCA", "LO QUE EL VIENTO SE LLEVO", "PSICOSIS", "TIBURON", "ET", "REGRESO AL FUTURO II", "REGRESO AL FUTURO III", "LA GUERRA DE LOS MUNDOS", "INDEPENDENCE DAY", "ARMAGEDDON", "EL DIA DESPUES DE MAÑANA", "GRAVEDAD", "LA VIDA ES BELLA", "AMELIE", "EL LABERINTO DEL FAUNO", "CIUDAD DE DIOS", "BICHOS", "PARASITOS", "OLD BOY", "EL VIAJE DE CHIHIRO", "AKIRA", "GHOST IN THE SHELL", "EL PROYECTO DE LA BRUJA DE BLAIR", "ACTIVIDAD PARANORMAL", "EL EXORCISTA", "IT", "HALLOWEEN", "PESADILLA EN LA CALLE DEL INFIERNO", "VIERNES 13", "MAD MAX", "MAD MAX FURIA EN EL CAMINO", "LA LA LAND", "WHIPLASH", "EL GRAN SHOWMAN", "BOHEMIAN RHAPSODY", "ROCKETMAN", "EL LOBO DE WALL STREET", "EL GRAN GATSBY", "JOKER", "DEADPOOL", "LOGAN", "WONDER WOMAN", "CAPITAN AMERICA"],
        memory: ["🍿", "🎬", "🎟️", "🎥", "🏆", "🧛", "👽", "🤠"],
        // Crucigrama: BATMAN (H), AVATAR (V), MATRIX (V)
        crossword: [
            { word: "BATMAN", clue: "El caballero de la noche", startX: 1, startY: 3, direction: "horizontal" },
            { word: "AVATAR", clue: "Película de seres azules", startX: 2, startY: 3, direction: "vertical" }, 
            { word: "MATRIX", clue: "Vivimos en una simulación", startX: 4, startY: 3, direction: "vertical" }
        ],
        trivia: [
            { question: "¿Quién dirigió 'Titanic' (1997)?", options: ["James Cameron", "Steven Spielberg", "Ridley Scott", "Martin Scorsese"], answer: 0 },
            { question: "¿En qué saga se dice 'Que la Fuerza te acompañe'?", options: ["Star Wars", "Star Trek", "Dune", "Alien"], answer: 0 },
            { question: "¿Qué actor interpreta a Jack Sparrow?", options: ["Johnny Depp", "Orlando Bloom", "Brad Pitt", "Tom Cruise"], answer: 0 },
            { question: "¿Qué estudio creó 'Toy Story'?", options: ["Pixar", "DreamWorks", "Blue Sky", "Illumination"], answer: 0 },
            { question: "¿Qué película ganó el Óscar a Mejor Película en 2020?", options: ["Parásitos", "1917", "Joker", "El irlandés"], answer: 0 },
            { question: "¿Qué tipo de pez es Nemo?", options: ["Pez payaso", "Pez cirujano", "Pez globo", "Pez ángel"], answer: 0 },
            { question: "¿Quién dirigió 'Pulp Fiction'?", options: ["Quentin Tarantino", "Robert Rodríguez", "Guy Ritchie", "David Fincher"], answer: 0 },
            { question: "En 'Matrix', ¿qué pastilla elige Neo?", options: ["La roja", "La azul", "La verde", "La blanca"], answer: 0 },
            { question: "¿Qué superhéroe protege Ciudad Gótica?", options: ["Batman", "Superman", "Spider-Man", "Flash"], answer: 0 },
            { question: "¿Cómo se llama el hobbit que lleva el Anillo Único?", options: ["Frodo", "Bilbo", "Sam", "Pippin"], answer: 0 },
            { question: "¿En qué película viaja la gente en el tiempo en un DeLorean?", options: ["Regreso al Futuro", "Interestelar", "El Origen", "Looper"], answer: 0 },
            { question: "¿Quién compuso la música incidental de 'El Rey León' (1994)?", options: ["Hans Zimmer", "John Williams", "Danny Elfman", "Alan Silvestri"], answer: 0 }
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
        ],
        trivia: [
            { question: "¿Qué banda grabó 'The Dark Side of the Moon'?", options: ["Pink Floyd", "Led Zeppelin", "The Who", "Genesis"], answer: 0 },
            { question: "¿Quién fue el vocalista de Queen?", options: ["Freddie Mercury", "Brian May", "Roger Taylor", "John Deacon"], answer: 0 },
            { question: "¿De qué ciudad son The Beatles?", options: ["Liverpool", "Londres", "Mánchester", "Birmingham"], answer: 0 },
            { question: "¿Qué banda grabó 'Enter Sandman'?", options: ["Metallica", "Megadeth", "Slayer", "Anthrax"], answer: 0 },
            { question: "¿Quién fue el líder y vocalista de Nirvana?", options: ["Kurt Cobain", "Dave Grohl", "Krist Novoselic", "Eddie Vedder"], answer: 0 },
            { question: "¿Qué banda australiana canta 'Highway to Hell'?", options: ["AC/DC", "INXS", "Midnight Oil", "Jet"], answer: 0 },
            { question: "¿Qué instrumento tocaba John Bonham en Led Zeppelin?", options: ["Batería", "Bajo", "Guitarra", "Teclado"], answer: 0 },
            { question: "¿De qué banda es el álbum 'Nevermind' (1991)?", options: ["Nirvana", "Pearl Jam", "Soundgarden", "Alice in Chains"], answer: 0 },
            { question: "¿Quién es el cantante de U2?", options: ["Bono", "The Edge", "Adam Clayton", "Larry Mullen"], answer: 0 },
            { question: "¿Cuál es el logo de The Rolling Stones?", options: ["Una lengua y labios", "Un rayo", "Una corona", "Un ala"], answer: 0 },
            { question: "¿Quién tocaba la guitarra en 'The Jimi Hendrix Experience'?", options: ["Jimi Hendrix", "Eric Clapton", "Jimmy Page", "Jeff Beck"], answer: 0 },
            { question: "¿Qué grupo lanzó 'Bohemian Rhapsody'?", options: ["Queen", "Deep Purple", "Kansas", "Boston"], answer: 0 }
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
        ],
        trivia: [
            { question: "¿Cuál es el primer libro de la Biblia?", options: ["Génesis", "Éxodo", "Salmos", "Juan"], answer: 0 },
            { question: "¿Quién construyó un arca para sobrevivir al diluvio?", options: ["Noé", "Moisés", "Abraham", "David"], answer: 0 },
            { question: "¿A quién venció David con una honda?", options: ["Goliat", "Sansón", "Saúl", "El faraón"], answer: 0 },
            { question: "¿Cuántos días duró la creación antes del descanso?", options: ["6", "7", "3", "40"], answer: 0 },
            { question: "¿Quién guió a Israel fuera de Egipto?", options: ["Moisés", "Josué", "Aarón", "Jacob"], answer: 0 },
            { question: "¿Cuántos apóstoles eligió Jesús?", options: ["12", "10", "7", "3"], answer: 0 },
            { question: "¿En qué ciudad nació Jesús según los evangelios?", options: ["Belén", "Nazaret", "Jerusalén", "Capernaúm"], answer: 0 },
            { question: "¿Quién fue tragado por un gran pez?", options: ["Jonás", "Job", "Elías", "Daniel"], answer: 0 },
            { question: "¿Cuál es el último libro de la Biblia?", options: ["Apocalipsis", "Malaquías", "Judas", "Hechos"], answer: 0 },
            { question: "¿Quién negó a Jesús tres veces?", options: ["Pedro", "Judas", "Juan", "Tomás"], answer: 0 },
            { question: "¿Qué recibió Moisés en el monte Sinaí?", options: ["Los Diez Mandamientos", "El maná", "El arca", "El cayado"], answer: 0 },
            { question: "¿Qué rey de Israel, hijo de David, era famoso por su sabiduría?", options: ["Salomón", "Ezequías", "Josías", "Roboam"], answer: 0 }
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
        ],
        trivia: [
            { question: "¿Cómo se llama el extraterrestre peludo de la sitcom de los 80?", options: ["ALF", "E.T.", "Mork", "Gizmo"], answer: 0 },
            { question: "En 'El coche fantástico', ¿cómo se llama el auto parlante?", options: ["KITT", "HAL", "K9", "Herbie"], answer: 0 },
            { question: "¿Qué agente arreglaba todo con una navaja suiza?", options: ["MacGyver", "James Bond", "Magnum", "El Santo"], answer: 0 },
            { question: "¿De qué planeta viene ALF?", options: ["Melmac", "Marte", "Vulcano", "Krypton"], answer: 0 },
            { question: "¿Qué grupo de héroes vivía en las alcantarillas?", options: ["Las Tortugas Ninja", "Los Cazafantasmas", "Los Goonies", "Los ThunderCats"], answer: 0 },
            { question: "¿Cómo se llamaba la consola de Nintendo de los 80?", options: ["NES", "PlayStation", "Mega Drive", "Atari Jaguar"], answer: 0 },
            { question: "¿Quién era el líder de los Autobots en Transformers?", options: ["Optimus Prime", "Megatron", "Bumblebee", "Ironhide"], answer: 0 },
            { question: "¿Quién interpretó al Chavo del Ocho?", options: ["Roberto Gómez Bolaños", "Carlos Villagrán", "Rubén Aguirre", "Ramón Valdés"], answer: 0 },
            { question: "¿Qué serie animada tiene osos de colores con símbolos en la barriga?", options: ["Los Ositos Cariñositos", "Los Pitufos", "My Little Pony", "Los Fraggle"], answer: 0 },
            { question: "¿Qué gato naranja y perezoso adora la lasaña?", options: ["Garfield", "Félix", "Tom", "Isidoro"], answer: 0 },
            { question: "¿Qué película de 1984 tiene el lema 'Who you gonna call?'?", options: ["Los Cazafantasmas", "Gremlins", "Volver al Futuro", "Tron"], answer: 0 },
            { question: "¿Qué muñeco NO debía mojarse ni comer después de medianoche?", options: ["Gizmo (Gremlins)", "Chucky", "Teddy Ruxpin", "Furby"], answer: 0 }
        ]
    }
};