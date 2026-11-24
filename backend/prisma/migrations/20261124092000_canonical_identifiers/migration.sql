-- Existing unique constraints abort the transaction on collisions. No automatic merges.
BEGIN;
UPDATE "Cliente" SET cpf_cnpj = upper(regexp_replace(cpf_cnpj, '[./[:space:]-]', '', 'g'))
WHERE cpf_cnpj IS DISTINCT FROM upper(regexp_replace(cpf_cnpj, '[./[:space:]-]', '', 'g'));
UPDATE "Processo" SET numero_processo = regexp_replace(numero_processo, '[.[:space:]-]', '', 'g')
WHERE numero_processo <> regexp_replace(numero_processo, '[.[:space:]-]', '', 'g');
COMMIT;
