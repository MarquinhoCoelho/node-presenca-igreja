# Sistema de Presença de Igreja

Sistema para gerenciamento de presenças em igrejas, com controle de acesso baseado em perfis de usuário.

## Tecnologias Utilizadas

- Node.js
- Fastify
- PostgreSQL
- JWT para autenticação
- HTML/CSS/JavaScript para front-end

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone git@github.com-pessoal:MarquinhoCoelho/sistema-presenca-igreja.git
cd sistema-presenca-igreja
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
- Crie um banco PostgreSQL
- Execute o script `executeSql.js` para criar as tabelas
- Execute o script `seed.sql` para dados iniciais (opcional)

4. Configure as variáveis de ambiente:
- Crie um arquivo `.env` com as seguintes variáveis:
```
DATABASE_URL=postgres://usuario:senha@localhost:5432/nome_do_banco
JWT_SECRET=sua_chave_secreta
```

5. Inicie o servidor:
```bash
node server.js
```

## Documentação da API

### Autenticação

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

#### Cadastrar Senha
```http
POST /membros/cadastrar-senha
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

### Igrejas

#### Criar Igreja
```http
POST /igrejas
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Nome da Igreja",
  "endereco": "Endereço da Igreja",
  "telefone": "(00) 00000-0000"
}
```

#### Listar Igrejas
```http
GET /igrejas
Authorization: Bearer {token}
```

#### Buscar Igreja por ID
```http
GET /igrejas/{id}
Authorization: Bearer {token}
```

#### Atualizar Igreja
```http
PUT /igrejas/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Novo Nome",
  "endereco": "Novo Endereço",
  "telefone": "(00) 00000-0000"
}
```

#### Deletar Igreja
```http
DELETE /igrejas/{id}
Authorization: Bearer {token}
```

### Membros

#### Criar Membro
```http
POST /membros
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Nome do Membro",
  "data_nascimento": "1990-01-01",
  "telefone": "(00) 00000-0000",
  "email": "membro@email.com",
  "igreja_id": "uuid-da-igreja"
}
```

#### Listar Membros
```http
GET /membros
Authorization: Bearer {token}
```

#### Buscar Membro por ID
```http
GET /membros/{id}
Authorization: Bearer {token}
```

#### Atualizar Membro
```http
PUT /membros/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Novo Nome",
  "data_nascimento": "1990-01-01",
  "telefone": "(00) 00000-0000",
  "email": "novo@email.com",
  "igreja_id": "uuid-da-igreja"
}
```

#### Deletar Membro
```http
DELETE /membros/{id}
Authorization: Bearer {token}
```

#### Listar Membros de uma Igreja
```http
GET /igrejas/{id}/membros
Authorization: Bearer {token}
```

#### Alterar Perfil do Membro
```http
POST /membros/{id}/alterar-perfil
Authorization: Bearer {token}
Content-Type: application/json

{
  "perfil": "admin" // ou "comum"
}
```

### Presenças

#### Registrar Presença Individual
```http
POST /presencas
Authorization: Bearer {token}
Content-Type: application/json

{
  "membro_id": "uuid-do-membro",
  "data_presenca": "2024-01-01",
  "dia_semana": "Segunda"
}
```

#### Registrar Múltiplas Presenças
```http
POST /presencas/lote
Authorization: Bearer {token}
Content-Type: application/json

{
  "presentes": ["uuid-membro1", "uuid-membro2"],
  "data_presenca": "2024-01-01",
  "dia_semana": "Segunda"
}
```

#### Ver Presenças de um Membro
```http
GET /membros/{id}/presencas
Authorization: Bearer {token}
```

#### Ver Resumo de Presenças por Mês
```http
GET /membros/{id}/presencas/resumo?mes=2024-01
Authorization: Bearer {token}
```

#### Verificar Presença em uma Data
```http
GET /membros/{id}/presencas/verificar?data=2024-01-01
Authorization: Bearer {token}
```

#### Limpar Todas as Presenças
```http
DELETE /presencas
Authorization: Bearer {token}
```

## Perfis de Usuário

O sistema possui dois tipos de perfis:

1. **Administrador (admin)**
   - Acesso total ao sistema
   - Pode gerenciar igrejas, membros e presenças
   - Pode alterar perfis de outros usuários

2. **Usuário Comum (comum)**
   - Acesso limitado
   - Pode apenas registrar presenças
   - Não pode alterar configurações do sistema

## Front-end

O sistema possui uma interface web que pode ser acessada através do repositorio:
https://github.com/MarquinhoCoelho/web-presenca-igreja

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Autor Marcos Coelho
