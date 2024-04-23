const express = require('express');
const app = express();
const http = require('http').createServer(app); // Create an HTTP server instance
const io = require('socket.io')(http); // Initialize Socket.io

const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const ejs = require("ejs");


dotenv.config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Définir le répertoire des vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

async function generateContent(gender, age, height, weight, obj, exp) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
    genre: ${gender}
    age: ${age}
    taille: ${height}
    poids: ${weight}
    objectif: ${obj}
    experience: ${exp}
    

    1-crée un programme d'entrainement pour cette personne (selon son objectif, experience) et aumoins 2muscles/séance  du genre "Jour1/7 => muscles a travailler, Jour2/7 => muscles a travailler..."
    2-ajoute des exercices selon l'experience (un debutatnt ne peut pa0s faire tout genre d'exercices) et choisis aumoin 5 exercices/séance
    3-calcul les besoins de cette personne en macro nutriments (glucides, protéines, lipides)
    et puis calcul son métabolisme de base et le nombre de calories qu'ils doivent manger
    4pour terminer donne des conseils pour l'entrainement et la diète
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Texte brut à transformer


    // Fonction pour transformer le texte en balises HTML
    function transformerTexte(texte) {
    // Remplace ***texte*** par <h2>texte</h2>
    texte = texte.replace(/\*\*\*(.*?)\*\*\*/g, "<h2>$1</h2>");
    // Remplace **texte** par <h3>texte</h3>
    texte = texte.replace(/\*\*(.*?)\*\*/g, "<h3>$1</h3>");
    // Remplace *texte* par <p>texte</p>
    texte = texte.replace(/\*(.*?)\*/g, "<p>$1</p>");
    // Ajoute un <br> à la fin des lignes qui commencent par "*"
    texte = texte.replace(/\*(.*?)\n/g, "<p>$1</p><br>");
    return texte;
}

// Appel de la fonction pour transformer le texte brut
let texteTransforme = transformerTexte(text);


    return texteTransforme;

}

// Route pour servir la page HTML
app.get('/', (req, res) => {
    // Render the HTML with variables passed from the query string
    res.render('index', {
        gender: req.query.gender,
        age: req.query.age,
        height: req.query.height,
        weight: req.query.weight,
        obj: req.query.obj,
        exp: req.query.exp
    });
});

// Socket.io connection handler
io.on('connection', async (socket) => {
    console.log('A client connected');

    // Handle client request for content generation
    socket.on('generateContent', async ({ gender, age, height, weight, obj, exp }) => {
        const text = await generateContent(gender, age, height, weight, obj, exp);
        socket.emit('contentGenerated', text); // Emit the generated content to the client
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});