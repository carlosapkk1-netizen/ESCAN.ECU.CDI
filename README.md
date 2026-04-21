# Honda Diagnostics - Scan ECU CDI 🏍️🔧

![Status](https://img.shields.io/badge/Status-Ativo-success.svg)
![Protocol](https://img.shields.io/badge/System_Protocol-V4.1-red.svg)
![React](https://img.shields.io/badge/Tech-React_|_Next.js-blue.svg)

Uma ferramenta web profissional (design PWA-ready) projetada para mecânicos e entusiastas de motocicletas Honda. O aplicativo processa diagnósticos baseados nas piscadas nativas da luz MIL (Malfunction Indicator Lamp) exibida no painel da moto quando conectada ao conector DLC.

Com uma interface tática e tecnológica ("hacker-style"), o usuário converte piscadas longas (Dezenas) e curtas (Unidades) no código correspondente da ECU/CDI e recebe instantaneamente o diagnóstico do componente defeituoso.

---

## 🎯 **Principais Funcionalidades**

- **Calculadora Rápida:** Botões ergonômicos `+` / `-` desenhados especificamente para uso com as mãos sujas na oficina (Mobile First).
- **Banco de Falhas Integrado:** Dicionário com os códigos nativos da injeção Honda (PGM-FI), incluindo identificação imediata como `Sensor MAP`, `Válvula IACV`, `Sensor O2`, etc.
- **Micro-instruções de Teste:** Toda falha entrega dicas práticas e diretas de manutenção (ex: "Testar chicote e conectores", "Verificar relé da bomba").
- **Visual Design Imersivo:** Identidade de equipamento "Scanner OBD-II", usando cores sólidas (`#0A0F1C` e `#111827`) mesclado a fontes neon (vermelho vivo e verde rastreabilidade).

---

## 🚀 **Stacks e Tecnologias**

Esse projeto foi gerado para atuar como uma Web Application extremamente rápida.

- **Framework Core:** Next.js (Server Components/App Router) / React 19
- **Linguagem Principal:** TypeScript
- **Estilização e UI:** Tailwind CSS 4
- **Animações e Micro-interações:** Motion (Framer Motion moderno)
- **Icons:** Lucide React

---

## 🧠 **Códigos Suportados (Banco de Dados Inicial)**

- `01` - Sensor MAP (Manifold Absolute Pressure)
- `07` - Sensor EOT / ECT (Temperatura Motor/Fluido)
- `08` - Sensor TP (Acelerador)
- `09` - Sensor IAT (Temperatura de Ar)
- `12` - Injetor 1 (Combustível)
- `21` - Sensor O2 (Sonda Lambda / Aquecimento)
- `29` - Válvula IACV (Marcha Lenta)
- `33` - EEPROM (Falha interna ECM/PCM)
- `54` - Sensor de Velocidade (VS)
- `67` - Bomba de Combustível
- `86` - Comunicação do Painel (Meter)

---

## 📁 **Manuseio Local (Dev)**

Para rodar o scanner localmente no seu computador para customizações:

1. Instale as dependências:
```bash
npm install
```

2. Adicione sua foto customizada da logo (Mova a imagem renomeando para `logo.png` para dentro da pasta `/public`).

3. Rode o servidor Web:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador ou acesse de seu celular conectando pela mesma rede Wi-Fi!

---

> _"Diagnósticos táticos e rápidos na palma da mão, direto da oficina."_
