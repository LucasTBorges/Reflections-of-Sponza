# Relatório Trabalho 2 - MATA65 (Computação Gráfica)

<img src="./imgs/my_sponza.jpg" alt="Captura de Tela da Cena" width="1000"/>

## Introdução
Neste repositório se localiza o produto final do trabalho que marca a conclusão da unidade 2 da disciplina MATA65 - Computação Gráfica na UFBA no semestre 2024.2, ministrada pelo professor [Antônio Apolinário](https://computacao.ufba.br/pt-br/antonio-lopes-apolinario-junior), responsável pelas especificações do trabalho. Para executar a aplicação, é importante ter a pasta [Assets](https://github.com/LucasTBorges/Assets) na raíz do web server que está o executando.
Nós fomos orientados a desenvolver uma aplicação utilizando a biblioteca [Three.js](https://threejs.org/) que nos permitisse visualizar o modelo do [Palácio de Sponza desenvolvido pela Intel](https://www.intel.com/content/www/us/en/developer/topic-technology/graphics-research/samples.html) iluminado corretamente e incluindo mais alguns itens de forma a demonstrar a capacidade do Three.js de simular certos fenômenos ópticos.

**Observação:** os modelos desenvolvidos pela Intel possuem uma alta contagem de polígonos e texturas de alta resolução e portanto, além de exigirem uma alta quantidade de recursos do dispositivo que está executando a aplicação, podem causar um longo tempo de carregamento na inicialização. Em alguns casos a aplicação chegou a levar um minuto para carregar no meu computador, então a utilização do programa requer um pouco de paciência.

## Assets
Esta aplicação faz uso de alguns recursos não presentes originalmente na pasta Assets:
 - **Modelo Base do Palácio de Sponza:** [Disponível no site da Intel](https://www.intel.com/content/www/us/en/developer/topic-technology/graphics-research/samples.html), o arquivo GLTF deve estar localizado no caminho `/Assets/Models/glTF/Sponza-Intel/main1_sponza/`, junto com os arquivos dos quais ele depende.
 - **Modelo complementar das cortinas do Palácio de Sponza**: Também disponível no site da Intel, o arquivo GLTF e suas dependências devem se encontrar em `/Assets/Models/glTF/Sponza-Intel/pkg_a_curtains/`.
 - **Textura Normal da Água**: Mapa normal do material da água, já posicionado corretamente nesse repositório, em `/src/assets/`.
 - **Mapa de Ambiente**: Arquivo HDR contendo uma textura de ambiente utilizado no GroundedSkyBox da aplicação para apresentar um céu realista. Vem junto com as texturas do modelo base do palácio de Sponza, e deve estar localizado em `/Assets/Models/glTF/Sponza-Intel/main1_sponza/textures/`.
 - **Estátua:** Modelo 3d de uma estátua, publicado no [Sketchfab](https://sketchfab.com/3d-models/estatua-statue-907ae2bb4f23423db76b7ec9cfe6b0e9) pelo usuário [Huargenn](https://sketchfab.com/Huargenn). Já se encontra posicionado corretamente nesse repositório, em `/src/assets/estatua/`.

## Iluminação
O modelo base do palácio de Sponza já possui embutido nele algumas fontes de luz. Ele possui uma fonte de luz direcional branca representando o sol e outras múltiplas fontes pontuais alaranjadas representando as luminárias. Além de importar a iluminação do modelo, tive que realizar algumas mudanças para deixar a cena mais realista:

 - Configurei a intensidade das luzes para deixar o cenário mais agradável.
 - Modifiquei a direção da iluminação do sol para manter a consistência com a posição do sol na  imagem utilizada como textura para o céu.
 - Adicionei uma luz ambiente para simular a iluminação indireta.
 
 A fim de tornar a aplicação mais interativa, adicionei a GUI controles para que usuário possa realizar ajustes à iluminação da cena.

## Sombras
Ainda dentro do tópico de iluminação, o realismo da cena estava prejudicado por conta da falta de sombras. Portanto, eu habilitei sombras na cena e configurei todas as malhas de forma que elas projetassem e recebessem sombras. Entretanto, devido ao número de fontes de luz na cena, configurar todas elas para projetar sombras se mostrou inviável. Assim, optei por manter apenas o sol projetando sombras, o que já ocasionou uma diferença notável.
Foi necessário ajustar o frustrum da câmera de sombras do sol para que este abrangesse todo o cenário, pois inicialmente apenas uma pequena região da cena estava sendo mapeada no mapa de sombras.

## Skybox
Um dos requisitos do trabalho era que deveria ser possível ver o ceú quando o observador olhasse para cima enquanto posicionado no centro do átrio. Para atingir esse feito, adicionei um GroundedSkyBox à cena com a textura disponiblizada na própria pasta de texturas do modelo base do palácio.

## Disposição da Cena
Fomos orientados a incluir, para além do modelo base do Palácio de Sponza, um dos modelos complementares disponibilizados pela Intel e optei por incluir o modelo que adiciona cortinas ao cenário. Para além disso, foi necessário incluir 2 outros modelos geométricos que permitissem a demonstração de efeitos do Three.js. Assim, incluí um par de espelhos e um plano de água. Também incluí uma estátua na cena, que fica girando em torno do próprio eixo e pode ter sua posição e tamanho controlada pelo usuário, e os espelhos acompanham as tranformações (exceto rotação) da estátua. O intuito da adição da estátua foi visualizar os reflexos reagindo a um objeto se movendo.
Os objetos podem ser controlados pela interface: a água, espelhos e a estátua podem possuir a visibilidade desligados a comando do usuário, entre outros parâmetros.

## Controles de Câmera
As especificações do trabalho indicavam que deveria ser possível navegar livremente pelo cenário usando controles do Three.js, bem como navegar por pontos de vista fixos previamente definidos por mim. Através da GUI, o usuário pode habilitar o modo de Câmera Livre e utilizar os comandos do [FlyControls](https://threejs.org/docs/#examples/en/controls/FlyControls) do Three.js para passear na cena. Habilitei o parâmetro dragToLook, e portanto o usuário deve clicar e arrastar no canvas para alterar a direção da câmera.
Também especifiquei alguns pontos fixos que o usuário pode escolher para ser transportado para um ponto de vista predefinido. Dentre esses pontos se encontra o rotulado como "Câmera de Segurança", que é o único cuja direção da câmera é dinâmica: se o usário modificar a posição do modelo da estátua com este ponto de vista selecionado e o modo de câmera livre estiver desablitado, a câmera acompanha o modelo da estátua.
Selecionar um ponto de vista fixo desabilita o modo de Câmera Livre.

## GUI (Interface Gráfica)
A interface para os controles da aplicação foi gerada com a biblioteca [lil-gui](https://lil-gui.georgealways.com/).

### Controles Básicos:

 - *Camera Info*: Quando habilitado, exibe um painel de informações no canto inferior direito da tela com as coordenadas da posição e a direção da câmera.
 - *Free Cam*: Quando habilitado, o usuário pode navegar livremente pelo cenário usando os FlyControls do Three.js.
 - *POVs*: Menu dropdown com pontos de vista predefinidos. Selecionar um ponto de vista transporta a câmera para o ponto de vista em questão e desabilita o Free Cam.
 
### Estátua:
 - *Visível*: Controla a visibilidade da estátua.
 - *Espelhos*: Controla a visibilidade dos espelhos.
 - *Posição*: Desloca a estátua e os espelhos através do eixo X pelo átrio do palácio. Se o Free Cam estiver desabilitado e o ponto de vista "Câmera Segurança" estiver selecionado, modificar esse parâmetro ocasio
 - *Escala*: Controla o tamanho da estátua e dos espelhos.
 - *Auto Rotacionar*: Quando habilitado, a estátua fica girando em torno do eixo Y local.
 - *Velocidade da Rotação*: Controla a velocidade da rotação em radianos por segundo.

### Água:
 - *Ligada*: Controla a visibilidade da água.
 - *Altura*: Controla o nível da água (posição no eixo Y).
 - *Escala*: Controla a escala da textura do material.
 - *Ondulação*: Controla o nível de ondulação da água. Níveis maiores aumentam o efeito de distorção causado pela refração da água.
 - *Cor*: Controla a cor da água.
 - *Velocidade de Fluxo*: Controla a velocidade de deslocamento do offset da textura.

### Iluminação
 Há uma subpasta para cada fonte de luz (as luminárias são tratadas como um grupo para este fim), cada uma com três parâmetros que podem ser alterados:
 - *Ligado*: Controla a visibilidade da fonte de luz.
 - *Cor*: Controla a cor da fonte de luz.
 - *Intensidade*: Controla a intensidade da fonte de luz.
