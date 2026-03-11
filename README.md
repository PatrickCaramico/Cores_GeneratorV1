# ClickColor

Ferramenta front-end para geração e exploração de paletas de cores com foco em UX moderna, praticidade e apresentação profissional. O projeto permite gerar paletas aleatórias ou baseadas em código HEX, além de visualizar detalhes, exportar formatos e testar aplicação das cores em um mini preview de site.

---

<div align="center">
  <a href="https://clickcolors.netlify.app/" target="_blank">
    <img src="https://img.shields.io/badge/Acesse_o_Projeto_Online-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy Link">
  </a>
</div>

## ✨ Destaques do Projeto

- **Design sofisticado:** fundo com gradiente animado, animações suaves e interface clean.
- **Geração inteligente por HEX (HSL):** cria paletas harmônicas a partir de uma cor base usando variações de matiz.
- **Modal interativo completo:** exibe cor selecionada, contraste WCAG, formatos de exportação e variações em degradê.
- **Feedback visual de cópia:** integração com SweetAlert2 para confirmação de ações e melhor experiência do usuário.
- **Estrutura organizada:** separação em `assets/css` e `assets/js`, facilitando manutenção e evolução.
- **Acessibilidade e usabilidade:** análise de contraste, filtros de daltonismo e atalhos de interação.

---

## ✅ Funcionalidades

- **Geração de paleta aleatória:** cria 5 cores com um clique.
- **Geração baseada em HEX:** recebe uma cor base (`#RRGGBB`) e gera paleta análoga por HSL.
- **Bloqueio de cores (lock):** mantém cores favoritas fixas enquanto o restante da paleta é regenerado.
- **Atalho de teclado:** pressione **barra de espaço** para gerar nova paleta rapidamente.
- **Histórico de paletas:** salva paletas recentes com `localStorage` e permite restaurar versões anteriores.
- **Cópia de códigos:** copia HEX e formatos de exportação com feedback visual.
- **Exportação de formatos:** HEX, RGB, HSL e CSS Variable.
- **Preview de aplicação:** mini site para testar cor em navbar, título e botão.
- **Análise de contraste:** indicação visual de contraste com padrão WCAG AA.
- **Simulação de daltonismo:** opções como Protanopia, Deuteranopia, Tritanopia e Acromatopsia.
- **Modal de degradê:** gera variações tonais programaticamente para a cor selecionada.
- **Responsividade:** layout adaptado para diferentes tamanhos de tela.

---

## 🧱 Tecnologias e Conceitos

- **HTML5** — estrutura semântica da página.
- **CSS3** — gradientes, animações (`@keyframes`), responsividade e componentes visuais.
- **JavaScript (ES6+)** — manipulação do DOM, geração de cores, regras de contraste e persistência local.
- **SweetAlert2** — feedback visual elegante para ações de cópia e interações.
- **UX/UI** — foco em clareza, fluidez e interação intuitiva.

---

### 1) Execução local

1. Clone este repositório.
2. Acesse a pasta do projeto.
3. Abra o arquivo `index.html` no navegador.

---

## 📁 Estrutura de Pastas

```bash
Color _Generator/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
```

---

## 👨‍💻 Autor

**Patrick Souza**

- GitHub: [Acesse aqui](https://github.com/PatrickCaramico)
- LinkedIn: [Acesse aqui](https://www.linkedin.com/in/patrickcaramico/)
