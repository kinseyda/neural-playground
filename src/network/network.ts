// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatTimeString } from "@/format";

export interface Neuron {
  weights: number[]; // Weights on inputs, eg input layer has none
  bias: number;
  z: number | undefined;
  activation: number | undefined;
  error: number | undefined; // dC/dz_{this neuron}
  weightDeltas: number[];
  biasDelta: number;
}

function sigmoid(n: number) {
  return 1 / (1 + Math.E ** (-1 * n));
}

function sigmoidDerivative(n: number) {
  return sigmoid(n) * (1 - sigmoid(n));
}

// function reLu(n: number): number {
//   return Math.max(0, n);
// }

// function reLuDerivative(n: number) {
//   return n > 0 ? 1 : 0;
// }

function squish(n: number): number {
  return sigmoid(n);
}
function squishDerivative(n: number): number {
  return sigmoidDerivative(n);
}

function dotProduct(a: number[], b: number[]): number {
  return a.map((_, i) => a[i] * b[i]).reduce((m, n) => m + n);
}

export interface TrainingExample {
  inputs: number[];
  expectedOutputs: number[];
}

export class Network {
  neurons: Neuron[][];
  learningRate: number;
  /**
   *
   * @param sizes - List of sizes of layers: input, hidden layer[s], output
   */
  constructor(sizes: number[], learningRate: number) {
    this.neurons = [];
    for (let i = 0; i < sizes.length; i++) {
      const weightsSize = i == 0 ? 0 : sizes[i - 1];
      const layer: Neuron[] = [];
      for (let j = 0; j < sizes[i]; j++) {
        const weights = [];
        const weightDeltas = [];
        for (let j = 0; j < weightsSize; j++) {
          weights.push(Math.random() * 2 - 1);
          weightDeltas.push(0);
        }
        const bias = i == 0 ? 0 : Math.random() * 2 - 1;
        const neuron: Neuron = {
          weights: weights,
          bias: bias,
          z: undefined,
          activation: undefined,
          error: undefined,
          weightDeltas: weightDeltas,
          biasDelta: 0,
        };
        layer.push(neuron);
      }
      this.neurons.push(layer);
    }
    this.learningRate = learningRate;
  }

  get outputActivations() {
    return this.neurons[this.neurons.length - 1].map((x) => x.activation || 0);
  }

  resetNeurons() {
    for (let i = 0; i < this.neurons.length; i++) {
      const layer = this.neurons[i];
      for (let j = 0; j < layer.length; j++) {
        const n = layer[j];
        n.z = undefined;
        n.activation = undefined;
        n.error = undefined;
        n.biasDelta = 0;
        (n.weightDeltas = []).length = n.weights.length;
        n.weightDeltas.fill(0);
      }
    }
  }

  feed(inputs: number[]) {
    for (let i = 0; i < this.neurons.length; i++) {
      const layer = this.neurons[i];
      for (let j = 0; j < layer.length; j++) {
        const neuron = layer[j];
        if (i == 0) {
          neuron.activation = inputs[j];
        } else {
          neuron.z = dotProduct(
            neuron.weights,
            this.neurons[i - 1].map((x) => x.activation || 0)
          );
          neuron.activation = squish(neuron.z);
        }
      }
    }
  }

  /**
   * http://neuralnetworksanddeeplearning.com/chap2.html good reading
   * @param inputs
   * @param expectedOutputs
   */
  backProp(inputs: number[], expectedOutputs: number[]) {
    // const startTime = Date.now();
    this.feed(inputs);
    // const feedTime = Date.now();
    // console.log(`feedTime: ${formatTimeString(feedTime - startTime)}`);
    for (let i = this.neurons.length - 1; i > 0; i--) {
      //   const iterStartTime = Date.now();
      const layer = this.neurons[i];
      if (i == this.neurons.length - 1) {
        // Output layer errors
        for (let j = 0; j < layer.length; j++) {
          const n = layer[j];
          if (n.activation === undefined || n.z === undefined) {
            throw new EvalError("BP issue");
          }
          const dCda = n.activation - expectedOutputs[j];
          n.error = dCda * squishDerivative(n.z);
        }
      } else {
        // Hidden layer errors
        for (let j = 0; j < layer.length; j++) {
          const foreErr = this.neurons[i + 1]
            .map((n) => n.weights[j] * (n.error || 0))
            .reduce((a, b) => {
              return a + b;
            });
          const n = layer[j];
          if (n.z === undefined) {
            throw new EvalError("BP issue");
          }
          n.error = foreErr * squishDerivative(n.z);
        }
      }
      //   const iterMidTime = Date.now();
      //   console.log(
      //     `iterMidTime${i}: ${formatTimeString(iterMidTime - iterStartTime)}`
      //   );
      for (let j = 0; j < layer.length; j++) {
        const n = layer[j];
        if (n.error === undefined) {
          throw new EvalError("BP issue");
        }
        layer[j].biasDelta -= n.error * this.learningRate;
        for (let k = 0; k < n.weights.length; k++) {
          const inputActiv = this.neurons[i - 1][k].activation;
          if (inputActiv === undefined) {
            throw new EvalError("BP issue");
          }
          layer[j].weightDeltas[k] -= n.error * inputActiv * this.learningRate;
        }
      }
      //   const iterTime = Date.now();
      //   console.log(`iterTime${i}: ${formatTimeString(iterTime - iterMidTime)}`);
    }
  }
  updateNeurons(mult: number) {
    for (let i = 0; i < this.neurons.length; i++) {
      const layer = this.neurons[i];
      for (let j = 0; j < layer.length; j++) {
        const neuron = layer[j];
        neuron.bias += neuron.biasDelta * mult;
        for (let k = 0; k < neuron.weightDeltas.length; k++) {
          neuron.weights[k] += neuron.weightDeltas[k] * mult;
        }
      }
    }
  }
  train(batch: TrainingExample[]) {
    this.resetNeurons();
    for (const ex of batch) {
      console.log("Training!");
      this.backProp(ex.inputs, ex.expectedOutputs);
    }
    this.updateNeurons(1 / batch.length);
  }
}
