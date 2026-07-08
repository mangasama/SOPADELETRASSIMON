// ==========================================================
// SOPA DE LETRAS ELECTORAL - IEE SONORA
// Banco de palabras, definiciones y niveles
// ==========================================================

const WORD_BANK = {
  AYUNTAMIENTO:  {def:"Grupo de personas que se integra por una presidencia municipal, una sindicatura y regidurías electas por votos, cada tres años. Su función es cuidar y organizar una ciudad o municipio, como arreglar calles, parques y servicios como agua potable o recolección de basura.", icon:"assets/icon_ayuntamiento.png"},
  BOLETA:        {def:"Es el papel donde las personas marcan por quién quieren votar para la presidencia, gubernatura, diputaciones, presidencias municipales y consultas populares.", icon:"assets/icon_boleta.png"},
  CAMPAÑA:       {def:"Es el periodo de tiempo en el que las personas candidatas o partidos políticos comparten sus ideas y propuestas para que la gente las conozca y decida por quién votar.", icon:"assets/icon_campaña.png"},
  CIUDADANIA:    {def:"Son las personas que forman parte de una comunidad o país y pueden participar y tomar decisiones, en México deben tener 18 años o más y un modo honesto de vivir.", icon:"assets/icon_ciudadania.png"},
  CONGRESO:      {def:"Llamado también Poder Legislativo, es el lugar donde se crean y cambian las leyes para ayudar a las personas y está integrado por representantes electos por la ciudadanía.", icon:"assets/icon_congreso.png"},
  CONSTITUCION:  {def:"Documento en el que se reconocen y protegen los derechos de todas las personas, así como la forma en la que se organiza el país.", icon:"assets/icon_constitucion.png"},
  CREDENCIAL:    {def:"Es una identificación oficial con fotografía que muestra que eres mayor de edad, sirve para votar en elecciones y aplicar los instrumentos de participación ciudadana.", icon:"assets/icon_credencial.png"},
  DEBATE:        {def:"Es un evento donde las personas candidatas presentan y explican sus ideas y propuestas. Tiene reglas como el tiempo y el respeto.", icon:"assets/icon_debate.png"},
  DIPUTACION:    {def:"Es el trabajo que hacen las personas diputadas para crear leyes y ayudar a la comunidad. Se eligen cada 3 años con el voto.", icon:"assets/icon_diputacion.png"},
  ENCUESTA:      {def:"Es cuando se les pregunta a muchas personas qué piensan sobre un tema o por quién van a votar.", icon:"assets/icon_encuesta.png"},
  INE:           {def:"El Instituto Nacional Electoral es quien organiza, supervisa y garantiza las elecciones en México.", icon:"assets/icon_ine.png"},
  PADRON:        {def:"Es la lista donde aparecen las personas ciudadanas que pueden votar.", icon:"assets/icon_padron.png"},
  PARTIDO:       {def:"Es un grupo de personas que comparte ideas para mejorar el país y participa en elecciones. Tiene como fin promover la participación del pueblo y permitir el acceso de la ciudadanía al poder público.", icon:"assets/icon_partido.png"},
  PRESIDENCIA:   {def:"Es la oficina donde está la persona encargada de dirigir un gobierno. Se le llama Poder Ejecutivo.", icon:"assets/icon_presidencia.png"},
  PROPAGANDA:    {def:"Son anuncios, imágenes o mensajes que usan las candidatas y candidatos para dar a conocer sus ideas y obtener el apoyo de la ciudadanía.", icon:"assets/icon_propaganda.png"},
  REELECCION:    {def:"Es cuando una persona puede volver a participar para seguir en el mismo cargo por un periodo más.", icon:"assets/icon_reeleccion.png"},
  SENADO:        {def:"Es un grupo de 128 personas que ayudan a crear leyes para todo el país. Se eligen cada 6 años.", icon:"assets/icon_senado.png"},
  SUFRAGIO:      {def:"Es otra forma de decir \"voto\". Es un derecho de la ciudadanía para elegir a sus representantes o participar en decisiones públicas.", icon:"assets/icon_sufragio.png"},
  TRIBUNAL:      {def:"Es la autoridad que revisa que las elecciones se hagan de manera justa y legal. Se le conoce como Poder Judicial.", icon:"assets/icon_tribunal.png"},
  URNA:          {def:"Es la caja donde se depositan las boletas después de votar para dar seguridad.", icon:"assets/icon_urna.png"},
  IEESONORA:     {def:"El Instituto Estatal Electoral y de Participación Ciudadana de Sonora organiza y cuida las elecciones en el estado.", icon:"assets/icon_ieesonora.png"},
  LISTANOMINAL:  {def:"Es la lista de personas que tienen credencial y pueden votar.", icon:"assets/icon_listanominal.png"},
  INDEPENDIENTE: {def:"Es una persona que participa en elecciones sin pertenecer a un partido político.", icon:"assets/icon_independiente.png"},
  COALICION:     {def:"Es cuando dos o más partidos políticos se unen para apoyar a una misma candidatura.", icon:"assets/icon_coalicion.png"},
  MAYORIA:       {def:"Es cuando gana quien obtiene más votos en el Poder Legislativo.", icon:"assets/icon_mayoria.png"},
  REPRESENTACION:{def:"En el Poder Legislativo, es una forma de repartir lugares según la cantidad de votos que recibió cada partido. También se les llama \"plurinominales\".", icon:"assets/icon_representacion.png"},
  ESCRUTINIO:    {def:"Es contar y revisar los votos para asegurarse de que todo esté correcto.", icon:"assets/icon_escrutinio.png"},
  VOTO:          {def:"Es la forma en que las personas eligen a quienes quieren que las representen o tomen decisiones importantes, es universal, libre, secreto, directo y personal además es intransferible.", icon:"assets/icon_voto.png"}
};

// 9 niveles: cada uno con su fondo y una cantidad CRECIENTE de palabras
// (3, 5, 7, 9, 11, 13, 15, 15, 15). Las palabras se eligen AL AZAR del banco
// de 27 cada vez que se entra al nivel (ver pickWordsForLevel en game.js).
const LEVEL_BACKGROUNDS = [
  "assets/bg1.jpg","assets/bg2.jpg","assets/bg3.jpg","assets/bg4.jpg","assets/bg5.jpg",
  "assets/bg6.jpg","assets/bg7.jpg","assets/bg8.jpg","assets/bg9.jpg"
];
const LEVEL_WORD_COUNTS = [3,5,7,9,11,13,15,15,15];
const HIDDEN_WORDS_PER_LEVEL = 2;

const IDLE_VIDEO = "assets/idle.webm";
const ACIERTO_VIDEOS = [
  "assets/acierto1.webm","assets/acierto2.webm","assets/acierto3.webm",
  "assets/acierto4.webm","assets/acierto5.webm","assets/acierto6.webm","assets/acierto7.webm"
];
const MUSIC_TRACKS = [
  "assets/music1.mp3","assets/music2.mp3","assets/music3.mp3","assets/music4.mp3"
];
