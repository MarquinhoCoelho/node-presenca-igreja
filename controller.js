import { Pool } from 'pg';
import 'dotenv/config';

export class Controller {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    // Igrejas
    async buscarIgreja(id) {
        const query = 'SELECT * FROM Igreja WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async buscarIgrejas() {
        const query = 'SELECT * FROM Igreja';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async cadastrarIgreja(igreja) {
        const query = `
            INSERT INTO Igreja (nome, endereco, telefone)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [igreja.nome, igreja.endereco, igreja.telefone];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async atualizarIgreja(id, igreja) {
        const query = `
            UPDATE Igreja
            SET nome = $1, endereco = $2, telefone = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        const values = [igreja.nome, igreja.endereco, igreja.telefone, id];
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async deletarIgreja(id) {
        const query = 'DELETE FROM Igreja WHERE id = $1 RETURNING *';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    // Membros
    async buscarMembro(id) {
        const query = 'SELECT * FROM Membro WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async buscarMembros() {
        const query = 'SELECT * FROM Membro';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async cadastrarMembro(dados) {
        // Validação dos campos obrigatórios
        const camposObrigatorios = ['nome', 'data_nascimento', 'telefone', 'email', 'igreja_id'];
        const camposFaltantes = camposObrigatorios.filter(campo => !dados[campo]);
        
        if (camposFaltantes.length > 0) {
            throw new Error(`Campos obrigatórios faltantes: ${camposFaltantes.join(', ')}`);
        }

        // Validação do formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dados.email)) {
            throw new Error('Email inválido');
        }

        // Validação do formato do telefone (mínimo 10 dígitos)
        const telefoneRegex = /^\d{10,}$/;
        if (!telefoneRegex.test(dados.telefone.replace(/\D/g, ''))) {
            throw new Error('Telefone inválido. Deve conter pelo menos 10 dígitos');
        }

        // Validação da data de nascimento
        const dataNascimento = new Date(dados.data_nascimento);
        if (isNaN(dataNascimento.getTime())) {
            throw new Error('Data de nascimento inválida');
        }

        const query = `
            INSERT INTO Membro (nome, data_nascimento, telefone, email, igreja_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            dados.nome,
            dados.data_nascimento,
            dados.telefone,
            dados.email,
            dados.igreja_id
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async atualizarMembro(id, membro) {
        const query = `
            UPDATE Membro
            SET nome = $1, data_nascimento = $2, telefone = $3, 
                email = $4, igreja_id = $5, updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `;
        const values = [
            membro.nome,
            membro.data_nascimento,
            membro.telefone,
            membro.email,
            membro.igreja_id,
            id
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async deletarMembro(id) {
        const query = 'DELETE FROM Membro WHERE id = $1 RETURNING *';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async buscarMembrosPorIgreja(igrejaId) {
        const query = 'SELECT * FROM Membro WHERE igreja_id = $1';
        const result = await this.pool.query(query, [igrejaId]);
        return result.rows;
    }

    // Presenças
    async registrarPresenca(presenca) {
        const query = `
            INSERT INTO Presenca (membro_id, data_presenca, dia_semana)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [
            presenca.membro_id,
            presenca.data_presenca,
            presenca.dia_semana
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async buscarPresencasPorMembro(membroId) {
        const query = `
            SELECT * FROM Presenca
            WHERE membro_id = $1
            ORDER BY data_presenca DESC
        `;
        const result = await this.pool.query(query, [membroId]);
        return result.rows;
    }

    async buscarResumoPresencasPorMembro(membroId, mes) {
        const query = `
            SELECT 
                dia_semana,
                COUNT(*) as quantidade
            FROM Presenca
            WHERE membro_id = $1
            AND EXTRACT(YEAR FROM data_presenca) = $2
            AND EXTRACT(MONTH FROM data_presenca) = $3
            GROUP BY dia_semana
            ORDER BY dia_semana
        `;
        
        // Separar o mês em ano e mês
        const [ano, mesNumero] = mes.split('-');
        
        const result = await this.pool.query(query, [membroId, ano, mesNumero]);
        
        // Inicializa o objeto de resumo com todos os dias da semana
        const resumo = {
            segunda: 0,
            terça: 0,
            quarta: 0,
            quinta: 0,
            sexta: 0,
            sábado: 0,
            domingo: 0
        };

        // Preenche o resumo com os dados do banco
        result.rows.forEach(row => {
            const dia = row.dia_semana.toLowerCase();
            if (resumo.hasOwnProperty(dia)) {
                resumo[dia] = parseInt(row.quantidade);
            }
        });

        return resumo;
    }

    // Registrar múltiplas presenças
    async registrarMultiplasPresencas(dados) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const query = `
                INSERT INTO Presenca (membro_id, data_presenca, dia_semana)
                VALUES ($1, $2, $3)
                RETURNING *
            `;

            const resultados = [];
            for (const membroId of dados.presentes) {
                const values = [
                    membroId,
                    dados.data_presenca,
                    dados.dia_semana
                ];
                const result = await client.query(query, values);
                resultados.push(result.rows[0]);
            }

            await client.query('COMMIT');
            return resultados;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async verificarPresencasRegistradas(membroId, data) {
        const query = `
            SELECT * FROM Presenca
            WHERE membro_id = $1
            AND data_presenca = $2
            ORDER BY created_at DESC
        `;
        const result = await this.pool.query(query, [membroId, data]);
        return result.rows;
    }

    async limparPresencas() {
        const query = 'DELETE FROM Presenca RETURNING *';
        const result = await this.pool.query(query);
        return result.rows;
    }

    // Buscar membro por email
    async buscarMembroPorEmail(email) {
        const query = 'SELECT * FROM Membro WHERE email = $1';
        const result = await this.pool.query(query, [email]);
        return result.rows[0];
    }

    // Atualizar senha do membro
    async atualizarSenhaMembro(id, password) {
        const query = 'UPDATE Membro SET password = $1 WHERE id = $2';
        await this.pool.query(query, [password, id]);
    }

    async atualizarPerfilMembro(id, perfil) {
        try {
            const result = await this.pool.query(
                'UPDATE Membro SET perfil = $1 WHERE id = $2 RETURNING *',
                [perfil, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao atualizar perfil do membro:', error);
            throw error;
        }
    }
}
