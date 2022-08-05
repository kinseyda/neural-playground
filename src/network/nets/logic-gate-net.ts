import EmnistImage from "@/data/emnist-image";
import { feed, Network, train, TrainingExample } from "../network";
import { formatTimeString } from "@/format";
import { longForLoop } from "@/long-loop";

export class LogicGateNet extends Network {
  constructor(sizes?: number[], learningRate?: number) {
    super(sizes ? sizes : [2, 2, 1], learningRate ? learningRate : 1);
    // I'm not sure if a hidden layer is actually necessary for logic gates?
  }
}
