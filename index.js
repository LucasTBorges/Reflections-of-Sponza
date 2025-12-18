import Aplicacao from "./src/project/base/aplicacao.js";
const povs = {
    "Entrance": {pos: [10.88,1.31,-0.08], dir: [-0.97,0.26,0.01]},
    "Second Floor": {pos: [8.39,7.28,-1.71], dir: [-0.88,-0.38,0.27]},
    "Looking at Sky": {pos: [5.48,1.6,-0.52], dir: [-0.44,0.9,0.02]},
    "Top-Down": {pos: [0.11, 14.43, 0.29], dir:[0,-1,0]},
    "Security Camera": {pos: [0.06,5.95,-1.47], dir: [-0.82,-0.53,0.23]}
};
new Aplicacao("Sponza Palace", povs).init();