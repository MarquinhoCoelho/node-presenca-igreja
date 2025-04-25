-- Criar a igreja com ID fixo
INSERT INTO Igreja (id, nome, endereco, telefone) 
VALUES ('e2a197f8-502d-4eda-af46-d14cfa5c79aa', 'Igreja Cristã Maranata Estreito', 'Rua das Flores, 123', '(48) 99999-9999');

-- Criar o membro usando o ID fixo da igreja
INSERT INTO Membro (nome, data_nascimento, telefone, email, igreja_id) 
VALUES ('Josué Emerick', '1990-05-10', '(32) 99945-4035', 'pr.josue@email.com', 'e2a197f8-502d-4eda-af46-d14cfa5c79aa')
RETURNING id;
