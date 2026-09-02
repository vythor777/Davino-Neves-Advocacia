# Diretrizes do SaaS Jurídico

Este projeto segue padrões rígidos de desenvolvimento para garantir uma plataforma escalável, segura e focada em UX. Todo o código gerado deve respeitar as seguintes regras:

## 1. Componentização Estrita
- Criar componentes pequenos, 'burros' (presentacionais) e altamente reutilizáveis.
- Separar lógica complexa em Custom Hooks ou utilitários puros (Smart/Dumb pattern).

## 2. Design System & UI
- **Estilo:** Tailwind CSS (v4) configurado via `@theme`.
- **Tipografia:** Fonte primária `Inter` para legibilidade em dados densos e tabelas.
- **Cores:** Paleta 'Slate' (neutros corporativos) e Azul Primário (`#0047ab` em Light Mode, adaptado em Dark Mode) para foco e confiança.
- **Espaçamentos:** Manter rigor da escala nativa matemática do Tailwind. Proibido o uso de `px` arbitrários (`w-[311px]`) a menos que estritamente justificado.

## 3. UX & Acessibilidade
- **Feedbacks Visuais:** Implementar estados de *loading* usando Skeletons, não apenas Spinners vazios.
- **Tratamento de Erros:** Interfaces amigáveis (Toasters semânticos da Sonner ou Fallbacks visuais de cards).
- **Interações:** Todo botão/link deve ter estados de `hover`, `focus-visible` e `active`.
- **Acessibilidade (WCAG):** Contraste rigorosamente verificado. Uso de marcação HTML5 semântica e atributos `aria-*` para leitores de tela quando a UI for puramente visual.

## 4. Anti-Slop (Estética Profissional)
- Evitar sombras exageradas (glow/glassmorphism inadequado) e templates genéricos de IA.
- Preferir interfaces nítidas, alto contraste para inputs/selects e uma tipografia bem espaçada.
