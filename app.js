import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {root: "pages" };

const JWT_SECRET = 'your_jwt_secret_key';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

const users = [
    {login: 'admin', password: '123', role: 'admin' },
    {login: 'staff', password: '456', role: 'staff' },
    {login: 'user', password: '789', role: 'user' },
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.post('/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find(user => user.login === login && user.password === password);
    if (user) {
        const token = jwt.sign({ role: user.role, login: user.login }, JWT_SECRET, { expiresIn: '1h' });
        
        res.cookie('token', token, { httpOnly: true});
        return res.redirect('/protected'); 
    } else {
        return res.status(401).json({ message: 'Неверные учетные данные' });
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect("/");
});

app.get("/telegram", (req, res) => {
    const tg_data = req.query
    console.log(tg_data);
    res.status(200).send("Успешно!");
});

app.get("/protected", (req, res) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.status(403).json({ message: "Токен недействителен" });
            }
            const role = decodedToken.role;
            console.log(role);
            if (role === "admin"){
                res.sendFile("admin.html", options);
            }
            else if (role === "staff"){
                res.sendFile("staff.html", options);
            }
            else{
                res.sendFile("user.html", options);
            }
        });
    } else {
        return res.status(401).json({ message: "ti durak"});
}
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});