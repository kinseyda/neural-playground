import { Network } from "../network";

export class LogicGateNet extends Network {
  constructor(sizes?: number[], learningRate?: number) {
    super(sizes ? sizes : [2, 2, 1], learningRate ? learningRate : 1);
    // I'm not sure if a hidden layer is actually necessary for logic gates?
  }
}
