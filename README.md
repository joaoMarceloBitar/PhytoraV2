# 🌿 Phytora

> Sistema inteligente para diagnóstico de doenças foliares em culturas agrícolas utilizando Visão Computacional e Inteligência Artificial.

---

## Sobre

O Phytora é uma aplicação mobile desenvolvida para auxiliar na identificação de doenças fitopatológicas através da análise de imagens das folhas das plantas.

O usuário captura uma fotografia utilizando o smartphone e a imagem é enviada para uma API responsável por executar um modelo de Inteligência Artificial treinado em PyTorch. Após a inferência, o aplicativo apresenta o diagnóstico juntamente com informações sobre a doença detectada.

O projeto foi desenvolvido como uma solução para apoiar produtores rurais, estudantes e profissionais da área agrícola na identificação rápida de doenças.

---

## Objetivo

Desenvolver uma ferramenta simples, rápida e acessível capaz de realizar diagnósticos preliminares de doenças em plantas utilizando técnicas de Visão Computacional.

O sistema busca diminuir o tempo necessário para identificação das doenças, auxiliando na tomada de decisão do produtor.

É importante ressaltar que a inferência não substitui um diagnóstico laboratorial, mas traz embasamento baseado em dados buscando auxiliar o produtor rural de forma dinâmica e intuitiva, a fim de reagir contra a fitopatologia o mais rápido possível.

---

## Problema

O diagnóstico precoce de doenças agrícolas normalmente depende da avaliação de especialistas.

Em pequenas propriedades, muitas vezes não existe acesso rápido a agrônomos ou laboratórios especializados, fazendo com que o produtor descubra o problema apenas quando a doença já compromete parte da produção.

O Phytora busca diminuir esse intervalo utilizando Inteligência Artificial.

---

## Público-alvo

- Produtores rurais
- Engenheiros Agrônomos
- Técnicos Agrícolas
- Estudantes
- Pesquisadores

---

## Modelo de negócio e rentabilidade do projeto

O Phytora adota um modelo de negócios baseado em assinaturas (Software as a Service – SaaS), oferecendo diferentes planos de acordo com as necessidades do usuário e o nível de especialização das análises disponibilizadas.

O plano gratuito permite o acesso às funcionalidades essenciais da plataforma, utilizando modelos de inteligência artificial treinados para identificar as doenças agrícolas mais comuns. Essa modalidade busca democratizar o acesso ao diagnóstico fitopatológico e incentivar a adoção da plataforma por estudantes, pequenos produtores e usuários iniciantes.

Os planos pagos ampliam os recursos disponíveis, oferecendo modelos de IA especializados para diferentes culturas agrícolas, frutas e hortaliças, além de funcionalidades adicionais voltadas ao uso profissional.

# Planos

- Plano Gratuito

Diagnóstico das principais doenças em culturas selecionadas.
Modelos de IA básicos.
Histórico limitado de diagnósticos.

- Plano Culturas Premium

Modelos especializados para diferentes culturas agrícolas.
Maior precisão e variedade de doenças identificadas.
Histórico completo.

- Plano Fruticultura

Diagnóstico específico para doenças em frutas.
Modelos treinados exclusivamente para espécies frutíferas.
Relatórios técnicos.

---

## Personas

### João

**Idade:** 42 anos

**Profissão:** Produtor Rural

João cultiva soja em uma propriedade familiar e frequentemente encontra dificuldades para identificar doenças nas plantas logo nos primeiros estágios. Muitas vezes precisa aguardar a visita de um agrônomo, atrasando o tratamento e aumentando os prejuízos na produção.

Com o Phytora, João consegue realizar uma análise preliminar diretamente pelo celular, auxiliando na tomada de decisão até receber orientação especializada.

### Mariana

**Idade:** 23 anos

**Profissão:** Estudante de Agronomia

Mariana utiliza constantemente imagens de folhas para estudar fitopatologias durante a graduação. Ela procura uma ferramenta prática que permita comparar sintomas e aprender a reconhecer diferentes doenças.

O Phytora auxilia seus estudos fornecendo diagnósticos rápidos e informações sobre cada doença identificada.

---

## Modelo de Negócio e Rentabilidade do Projeto

O Phytora adota um modelo de negócios baseado em assinaturas (Software as a Service – SaaS), oferecendo diferentes planos conforme as necessidades dos usuários e o nível de especialização dos modelos de Inteligência Artificial disponíveis.

O plano gratuito disponibiliza o acesso às funcionalidades essenciais da plataforma, permitindo o diagnóstico das doenças mais comuns em culturas agrícolas selecionadas por meio de modelos de IA básicos. O objetivo é democratizar o acesso à tecnologia e incentivar sua utilização por estudantes, pequenos produtores e usuários iniciantes.

Os planos pagos expandem os recursos da plataforma, oferecendo modelos especializados para diferentes culturas agrícolas, frutas e outras aplicações, além de funcionalidades exclusivas voltadas ao uso profissional.

### Plano Gratuito

- Diagnóstico das principais doenças em culturas agrícolas selecionadas.
- Utilização de modelos de IA básicos.
- Histórico limitado de diagnósticos.

### Plano Premium

- Modelos especializados para diferentes culturas agrícolas.
- Maior quantidade de doenças identificadas.
- Histórico completo de diagnósticos.
- Atualizações contínuas dos modelos.

### Plano Fruticultura

- Diagnóstico de doenças em frutas.
- Modelos treinados especificamente para culturas frutíferas.
- Relatórios detalhados das análises.

### Plano Profissional

- Acesso a todos os modelos disponíveis.
- Atualizações prioritárias.
- Recursos avançados para consultorias, empresas e profissionais da área agrícola.

A arquitetura do sistema foi projetada para permitir a inclusão de novos modelos de Inteligência Artificial ao longo do tempo, possibilitando a criação de novos planos sem necessidade de modificar a estrutura da aplicação.

---

## Personas

### João

**Idade:** 42 anos

**Profissão:** Produtor Rural

João cultiva soja em uma propriedade familiar e frequentemente encontra dificuldades para identificar doenças nas plantas logo nos primeiros estágios. Muitas vezes precisa aguardar a visita de um agrônomo, atrasando o tratamento e aumentando os prejuízos na produção.

Com o Phytora, João consegue realizar uma análise preliminar diretamente pelo celular, auxiliando na tomada de decisão até receber orientação especializada.

### Mariana

**Idade:** 23 anos

**Profissão:** Estudante de Agronomia

Mariana utiliza constantemente imagens de folhas para estudar fitopatologias durante a graduação. Ela procura uma ferramenta prática que permita comparar sintomas e aprender a reconhecer diferentes doenças.

O Phytora auxilia seus estudos fornecendo diagnósticos rápidos e informações sobre cada doença identificada.

---

## Requisitos do Sistema

### Requisitos Funcionais (RF)

- RF01 – Permitir capturar imagens utilizando a câmera do dispositivo.
- RF02 – Permitir selecionar imagens da galeria.
- RF03 – Enviar imagens para a API de inferência.
- RF04 – Processar imagens utilizando modelos de Inteligência Artificial.
- RF05 – Exibir o diagnóstico identificado.
- RF06 – Informar o percentual de confiança da classificação.
- RF07 – Exibir as principais previsões do modelo.
- RF08 – Apresentar informações sobre a doença detectada.
- RF09 – Disponibilizar funcionalidades de acordo com o plano contratado.
- RF10 – Permitir atualização dos modelos de IA sem necessidade de atualizar o aplicativo.

### Requisitos Não Funcionais (RNF)

- RNF01 – Interface intuitiva e responsiva.
- RNF02 – Tempo médio de resposta inferior a cinco segundos.
- RNF03 – Comunicação segura entre aplicativo e API.
- RNF04 – Arquitetura escalável para inclusão de novos modelos.
- RNF05 – Compatibilidade com dispositivos Android.
- RNF06 – API REST padronizada.
- RNF07 – Código modular e de fácil manutenção.
- RNF08 – Documentação atualizada.

---

## Diagrama de casos de uso

---

## Diagrama de classes

---

## Tecnologias

### Mobile

- React Native
- Expo
- Expo Camera
- Expo Image Picker

### Backend

- Node.js
- Express.js
- CORS

### Inteligência Artificial

- Python
- PyTorch
- TensorFlow
- Keras

---

### Ferramentas

- Git
- GitHub
- Visual Studio Code
- Figma

---

## Histórias de Usuário

### I. Produtor Rural

**Como** produtor rural,

**Quero** fotografar uma folha utilizando meu celular,

**Para** identificar rapidamente possíveis doenças presentes na cultura.


### II. Estudante de Agronomia

**Como** estudante,

**Quero** consultar informações sobre a doença identificada,

**Para** complementar meus estudos em fitopatologia.


### III. Engenheiro Agrônomo

**Como** engenheiro agrônomo,

**Quero** obter diagnósticos rápidos durante visitas técnicas,

**Para** agilizar a avaliação inicial das lavouras.

