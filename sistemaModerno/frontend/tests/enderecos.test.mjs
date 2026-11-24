import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Usa o TypeScript já instalado pelo projeto; não acrescenta um framework de testes.
const fonte = readFileSync(new URL('../src/services/enderecos.ts', import.meta.url), 'utf8');
const compilado = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } }).outputText;
const { reutilizarEndereco, separarEnderecoCadastro } = await import('data:text/javascript;base64,' + Buffer.from(compilado).toString('base64'));

test('cadastro com CEP envia o número separado do complemento', () => {
    assert.deepEqual(separarEnderecoCadastro('Rua das Flores', '42, Apto 2'), {
        rua: 'Rua das Flores', numero: '42', complemento: 'Apto 2'
    });
});

test('CEP sem logradouro aceita a rua informada no campo existente', () => {
    assert.deepEqual(separarEnderecoCadastro(undefined, 'Rua das Flores, 42, Bloco B, Apto 2'), {
        rua: 'Rua das Flores', numero: '42', complemento: 'Bloco B, Apto 2'
    });
});

test('complemento sozinho não é confundido com número da residência', () => {
    assert.throws(() => separarEnderecoCadastro('Rua das Flores', 'Apto 2'), /número da residência/);
    assert.throws(() => separarEnderecoCadastro('Rua das Flores', ''), /número da residência/);
});

test('endereço sem número pode ser informado explicitamente como s/n', () => {
    assert.equal(separarEnderecoCadastro('Rua das Flores', 's/n, Casa').numero, 's/n');
});

test('mesmo endereço preserva rua, número e complemento nos campos próprios', () => {
    const endereco = { rua: 'Rua Presidente, antiga Rua A', numero: '42B', complemento: 'Apto 2', bairro: 'Centro', cidade: 'Salvador', estado: 'BA', cep: '40000-000', pais: 'Brasil' };
    assert.deepEqual(reutilizarEndereco(endereco), endereco);
});

test('endereço legado sem número é identificado antes da criação do pedido', () => {
    assert.throws(() => reutilizarEndereco({ rua: 'Rua das Flores', complemento: 'Apto 2', cidade: 'Salvador', estado: 'BA', cep: '40000-000' }), /sem rua ou número/);
    assert.throws(() => reutilizarEndereco(undefined), /sem rua ou número/);
});
