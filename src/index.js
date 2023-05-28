import express from "express";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors("*"));
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.listen(8080, () => console.log(`Server Online ✅✅`));

app.get("/", (request, response) => {
	return response.json(`Olá, seja bem vindo ao seu CRUD de recados.`);
});
//Criar e listar usuarios
const listaUsuario = [];

app.get("/list-users", (request, response) => {
	return response.json(listaUsuario);
});
app.post(`/user`, (request, response) => {
	const dados = request.body;

	const novoUsuario = {
		id: Math.floor(Math.random() * 67676),
		// nome: dados.nome,
		email: dados.email,
		password: dados.password,
	};
	const existe = listaUsuario.some((user) => user.email === novoUsuario.email);
	if (existe) {
		return response.status(400).json({
			sucesso: false,
			dados: null,
			mensagem: "Outro usuário já está cadastrado com este e-mail.",
		});
	}
	if (!dados.password || dados.password.length < 6) {
		return response.status(400).json({
			sucesso: false,
			dados: null,
			mensagem:
				"É obrigatório informar a senha para cadastro do usuário com no mínimo 6 caracteres",
		});
	} else if (
		!dados.email ||
		!dados.email.includes("@") ||
		!dados.email.includes(".com")
	) {
		return response.status(400).json({
			sucesso: false,
			dados: null,
			mensagem:
				"É obrigatório informar um e-mail válido para cadastro do usuário",
		});
	}
	listaUsuario.push(novoUsuario);

	return response.status(201).json({
		succes: true,
		message: `Usuário criado com sucesso`,
		data: novoUsuario,
	});
});

//Logar no CRUD
app.post(`/login`, (request, response) => {
	const dadosDoUsuario = request.body;

	const emailCorreto = listaUsuario.some(
		(user) => user.email === dadosDoUsuario.email
	);

	const senhaCorreta = listaUsuario.some(
		(user) => user.password === dadosDoUsuario.password
	);

	if (!emailCorreto || !senhaCorreta) {
		return response.status(400).json({
			success: false,
			message: `Email ou senha incorretos`,
			data: {},
		});
	}

	listaUsuario.forEach((usuario) => (usuario.logado = false));

	const user = listaUsuario.find((user) => user.email === dadosDoUsuario.email);

	user.logado = true;

	return response.json({
		success: true,
		message: `Usuário logado com sucesso`,
		data: {},
	});
});

//Criar e listar recados
const listaRecados = [];

app.get("/list-recados", (request, response) => {
	return response.json(listaRecados);
});

app.post(`/recados`, (request, response) => {
	const dados = request.body;

	const usuario = listaUsuario.find((user) => user.logado === true);

	if (!usuario) {
		return response.status(400).json({
			success: false,
			message: `Necessario fazer login para criar um recado`,
			data: {},
		});
	}

	//Fazer validacao dos dados do recado

	const novoRecado = {
		id: new Date().getTime(),
		titulo: dados.titulo,
		descricao: dados.descricao,
		autor: usuario,
	};

	listaRecados.push(novoRecado);

	return response.status(201).json({
		success: true,
		message: `Recado criado com sucesso`,
		data: novoRecado,
	});
});

//Atualizar recados
app.put("/users/:id", (request, response) => {
	const { id } = request.params;
	const { titulo, descricao } = request.body;
	const userIndex = listaRecados.findIndex((user) => user.id === id);

	if (userIndex > 0) {
		return response.status(400).json({ error: "Recado nao encontrado" });
	}

	const user = {
		id,
		descricao,
	};
	listaRecados[userIndex] = user;

	return response.json(listaRecados);
});

// Deletar um recado
app.delete(`/recados/:id`, (request, response) => {
	const params = request.params;

	const recadoExiste = listaRecados.findIndex(
		(recado) => recado.id === params.id
	);

	if (recadoExiste > 0) {
		return response.status(400).json(`Recado nao encontrado`);
	}

	listaRecados.splice(recadoExiste, 1);

	console.log(listaRecados);

	return response.json(`Recado deletado com sucesso`);
});
