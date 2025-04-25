import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Controller } from './controller.js';
import jwt from 'jsonwebtoken';

const servidor = Fastify({
    logger: true
});

const controller = new Controller();

// Configuração do CORS
servidor.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
});

// servidor.use(Fastify.json());

// Rotas de autenticação (sem proteção)
servidor.post('/login', async (request, reply) => {
    try {
        const { email, password } = request.body;
        const membro = await controller.buscarMembroPorEmail(email);
        
        if (!membro || membro.password !== password) {
            return reply.status(401).send({ error: 'Email ou senha inválidos' });
        }

        const token = jwt.sign({ id: membro.id, email: membro.email }, 'seuSegredoSuperSecreto', { expiresIn: '1h' });
        return reply.send({ token });
    } catch (error) {
        return reply.status(500).send({ error: error.message });
    }
});

servidor.post('/membros/cadastrar-senha', async (request, reply) => {
    try {
        const { email, password } = request.body;
        const membro = await controller.buscarMembroPorEmail(email);
        
        if (!membro) {
            return reply.status(404).send({ error: 'Membro não encontrado' });
        }

        await controller.atualizarSenhaMembro(membro.id, password);
        return reply.status(200).send({ message: 'Senha cadastrada com sucesso' });
    } catch (error) {
        return reply.status(500).send({ error: error.message });
    }
});

// Middleware para verificar o token JWT
const verificarToken = async (request, reply) => {
    const token = request.headers.authorization;
    if (!token) {
        return reply.status(401).send({ error: 'Token não fornecido' });
    }

    try {
        const tokenLimpo = token.replace('Bearer ', '');
        const decoded = jwt.verify(tokenLimpo, 'seuSegredoSuperSecreto');
        request.membro = decoded;
    } catch (error) {
        return reply.status(401).send({ error: 'Token inválido' });
    }
};

// Proteger apenas as rotas que precisam de autenticação
const rotasProtegidas = [
    '/igrejas',
    '/membros',
    '/presencas'
];

// Adicionar hook de autenticação apenas para rotas protegidas
servidor.addHook('preHandler', async (request, reply) => {
    const rota = request.url;
    // Não proteger rotas de autenticação
    if (rota === '/login' || rota === '/membros/cadastrar-senha') {
        return;
    }
    // Proteger outras rotas
    if (rotasProtegidas.some(r => rota.startsWith(r))) {
        await verificarToken(request, reply);
    }
});

// Igrejas
servidor.post('/igrejas', async (req, res) => {
  try {
    const igreja = await controller.cadastrarIgreja(req.body);
    return res.status(201).send(igreja);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.get('/igrejas', async (req, res) => {
  try {
    const igrejas = await controller.buscarIgrejas();
    return res.status(200).send(igrejas);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.get('/igrejas/:id', async (req, res) => {
  try {
    const igreja = await controller.buscarIgreja(req.params.id);
    if (!igreja) {
      return res.status(404).send({ message: 'Igreja não encontrada' });
    }
    return res.status(200).send(igreja);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.put('/igrejas/:id', async (req, res) => {
  try {
    const igreja = await controller.atualizarIgreja(req.params.id, req.body);
    if (!igreja) {
      return res.status(404).send({ message: 'Igreja não encontrada' });
    }
    return res.status(200).send(igreja);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.delete('/igrejas/:id', async (req, res) => {
  try {
    const igreja = await controller.deletarIgreja(req.params.id);
    if (!igreja) {
      return res.status(404).send({ message: 'Igreja não encontrada' });
    }
    return res.status(200).send(igreja);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Membros
servidor.post('/membros', async (req, res) => {
  try {
    const membro = await controller.cadastrarMembro(req.body);
    return res.status(201).send(membro);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.get('/membros', async (req, res) => {
  try {
    const membros = await controller.buscarMembros();
    return res.status(200).send(membros);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.get('/membros/:id', async (req, res) => {
  try {
    const membro = await controller.buscarMembro(req.params.id);
    if (!membro) {
      return res.status(404).send({ message: 'Membro não encontrado' });
    }
    return res.status(200).send(membro);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.put('/membros/:id', async (req, res) => {
  try {
    const membro = await controller.atualizarMembro(req.params.id, req.body);
    if (!membro) {
      return res.status(404).send({ message: 'Membro não encontrado' });
    }
    return res.status(200).send(membro);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.delete('/membros/:id', async (req, res) => {
  try {
    const membro = await controller.deletarMembro(req.params.id);
    if (!membro) {
      return res.status(404).send({ message: 'Membro não encontrado' });
    }
    return res.status(200).send(membro);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Membros por Igreja
servidor.get('/igrejas/:id/membros', async (req, res) => {
  try {
    const membros = await controller.buscarMembrosPorIgreja(req.params.id);
    return res.status(200).send(membros);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Presenças
servidor.post('/presencas', async (req, res) => {
  try {
    const presenca = await controller.registrarPresenca(req.body);
    return res.status(201).send(presenca);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.get('/membros/:id/presencas', async (req, res) => {
  try {
    const presencas = await controller.buscarPresencasPorMembro(req.params.id);
    return res.status(200).send(presencas);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

servidor.get('/membros/:id/presencas/resumo', async (req, res) => {
  try {
    const resumo = await controller.buscarResumoPresencasPorMembro(req.params.id, req.query.mes);
    return res.status(200).send(resumo);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Registrar múltiplas presenças
servidor.post('/presencas/lote', async (req, res) => {
  try {
    const presencas = await controller.registrarMultiplasPresencas(req.body);
    return res.status(201).send(presencas);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Verificar presenças registradas
servidor.get('/membros/:id/presencas/verificar', async (req, res) => {
  try {
    const presencas = await controller.verificarPresencasRegistradas(req.params.id, req.query.data);
    return res.status(200).send(presencas);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Limpar todas as presenças
servidor.delete('/presencas', async (req, res) => {
  try {
    const presencas = await controller.limparPresencas();
    return res.status(200).send({ 
      message: 'Todas as presenças foram removidas com sucesso',
      presencas_removidas: presencas 
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Rota para alterar perfil do membro
servidor.post('/membros/:id/alterar-perfil', async (request, reply) => {
  try {
    const { id } = request.params;
    const { perfil } = request.body;

    if (!perfil || !['admin', 'comum'].includes(perfil)) {
      return reply.status(400).send({ error: 'Perfil inválido' });
    }

    const result = await controller.atualizarPerfilMembro(id, perfil);

    if (!result) {
      return reply.status(404).send({ error: 'Membro não encontrado' });
    }

    return reply.send(result);
  } catch (error) {
    console.error('Erro ao alterar perfil:', error);
    return reply.status(500).send({ error: 'Erro ao alterar perfil do membro' });
  }
});

servidor.listen({ port: 3000 }, () => {
  console.log('Server is running on port 3000')
});
