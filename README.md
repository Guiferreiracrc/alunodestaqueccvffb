# 🌟 Aluno Destaque Escolar

> **Desenvolvido por:** Guilherme Ferreira  
> **Tipo:** App Web Estático — Pontuação Escolar  
> **Versão:** 1.0.0

---

## 🎯 Objetivo

Aplicativo web para gerenciar pontuação de alunos organizados por **escola**, **professora** e **turma**, com sistema de **recompensas** por troca de pontos. Visual atrativo, colorido e de uso simples.

---

## ✅ Funcionalidades Implementadas

### 🏠 Dashboard
- Estatísticas gerais: Escolas, Professoras, Turmas, Alunos, Pontos distribuídos, Resgates
- Top 5 alunos com mais pontos
- Atividade recente (últimas movimentações)

### 🏫 Escolas
- Cadastro, edição e exclusão de escolas
- Nome e cidade
- Contagem de professoras, turmas e alunos por escola

### 📚 Turmas & Professoras
- Cadastro de turmas com vínculo de escola e professora
- Cadastro de professoras com escola e disciplina
- Abas separadas para Turmas e Professoras

### 🎓 Alunos
- Cadastro com nome, escola, turma e avatar personalizado (28 emojis disponíveis)
- Filtro por escola, turma e busca por nome
- Cards visuais com pontuação em destaque
- Botões rápidos para adicionar/retirar pontos diretamente no card

### ⭐ Sistema de Pontos
- Adicionar pontos com motivo predefinido (participação, tarefa, comportamento, etc.)
- Retirar pontos com motivo (comportamento inadequado, tarefa não entregue, etc.)
- Seleção rápida de quantidades: +5, +10, +15, +20, +25, +50, +100
- Histórico completo por aluno
- Efeito de confete ao ganhar pontos 🎉

### 🎁 Recompensas
- 8 recompensas padrão pré-cadastradas
- Cadastro e edição de novas recompensas com emoji
- Resgate de recompensa por aluno com verificação de saldo
- Histórico de todos os resgates realizados

### 🏆 Ranking
- Ranking geral por pontuação
- Filtro por escola e turma
- Barra de progresso visual para cada aluno
- Medalhas 🥇🥈🥉 para top 3

---

## 🗂️ Estrutura de Arquivos

```
index.html         ← App principal (HTML + estrutura)
css/
  style.css        ← Estilos completos com design moderno
js/
  app.js           ← Toda a lógica do aplicativo
README.md          ← Este arquivo
```

---

## 🔌 Endpoints de Dados Utilizados

| Tabela             | Endpoint                    |
|--------------------|-----------------------------|
| Escolas            | `tables/escolas`            |
| Professoras        | `tables/professoras`        |
| Turmas             | `tables/turmas`             |
| Alunos             | `tables/alunos`             |
| Histórico Pontos   | `tables/historico_pontos`   |
| Recompensas        | `tables/recompensas`        |

---

## 📊 Modelos de Dados

### `escolas`
| Campo  | Tipo | Descrição        |
|--------|------|------------------|
| id     | text | ID único         |
| nome   | text | Nome da escola   |
| cidade | text | Cidade           |

### `professoras`
| Campo       | Tipo | Descrição          |
|-------------|------|--------------------|
| id          | text | ID único           |
| nome        | text | Nome               |
| escola_id   | text | ID da escola       |
| disciplina  | text | Disciplina         |

### `turmas`
| Campo          | Tipo | Descrição          |
|----------------|------|--------------------|
| id             | text | ID único           |
| nome           | text | Nome da turma      |
| escola_id      | text | ID da escola       |
| professora_id  | text | ID da professora   |
| ano            | text | Ano letivo         |

### `alunos`
| Campo      | Tipo   | Descrição              |
|------------|--------|------------------------|
| id         | text   | ID único               |
| nome       | text   | Nome do aluno          |
| turma_id   | text   | ID da turma            |
| escola_id  | text   | ID da escola           |
| pontos     | number | Pontos acumulados      |
| avatar     | text   | Emoji do avatar        |

### `historico_pontos`
| Campo     | Tipo     | Descrição                  |
|-----------|----------|----------------------------|
| id        | text     | ID único                   |
| aluno_id  | text     | ID do aluno                |
| pontos    | number   | Quantidade de pontos       |
| motivo    | text     | Razão da movimentação      |
| tipo      | text     | `ganho` ou `gasto`         |
| data      | datetime | Data/hora da movimentação  |

### `recompensas`
| Campo              | Tipo   | Descrição              |
|--------------------|--------|------------------------|
| id                 | text   | ID único               |
| nome               | text   | Nome da recompensa     |
| descricao          | text   | Descrição do prêmio    |
| pontos_necessarios | number | Custo em pontos        |
| emoji              | text   | Emoji representativo   |
| ativo              | bool   | Se está ativa          |

---

## 🔮 Próximos Passos Sugeridos

- [ ] Sistema de login por perfil (admin / professora)
- [ ] Relatórios em PDF ou planilha
- [ ] Metas por turma/escola
- [ ] Notificações / alertas de pontuação
- [ ] Fotos de alunos no lugar de emoji
- [ ] Histórico paginado para grandes volumes
- [ ] Dashboard por professora com visão restrita da sua turma
