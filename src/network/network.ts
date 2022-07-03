// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatTimeString } from "@/format";

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
  weights: number[][][]; // [layer][index][weight number (index in previous layer)]
  biases: number[][]; // [layer][index]
  sizes: number[];
  learningRate: number;
  /**
   *
   * @param sizes - List of sizes of layers: input, hidden layer[s], output
   */
  constructor(sizes: number[], learningRate: number) {
    this.sizes = sizes;
    this.weights = [[[]]];
    this.biases = [[]];
    for (let curLayer = 0; curLayer < sizes.length; curLayer++) {
      const weightsSize = curLayer == 0 ? 0 : sizes[curLayer - 1];
      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];
      for (let curNeuron = 0; curNeuron < sizes[curLayer]; curNeuron++) {
        const curNeuronWeights = [];
        for (let j = 0; j < weightsSize; j++) {
          curNeuronWeights[j] = Math.random() * 2 - 1;
        }
        const bias = curLayer == 0 ? 0 : Math.random() * 2 - 1;

        layerWeights[curNeuron] = curNeuronWeights;
        layerBiases[curNeuron] = bias;
      }
      this.weights[curLayer] = layerWeights;
      this.biases[curLayer] = layerBiases;
    }

    this.learningRate = learningRate;
  }

  feed(inputs: number[]): { activations: number[][]; zs: number[][] } {
    const activations: number[][] = [];
    const zs: number[][] = [];
    for (let curLayer = 0; curLayer < this.sizes.length; curLayer++) {
      activations[curLayer] = [];
      zs[curLayer] = [];
      for (let curNeuron = 0; curNeuron < this.sizes[curLayer]; curNeuron++) {
        if (curLayer == 0) {
          activations[curLayer][curNeuron] = inputs[curNeuron];
        } else {
          zs[curLayer][curNeuron] = dotProduct(
            this.weights[curLayer][curNeuron],
            activations[curLayer - 1]
          );
          activations[curLayer][curNeuron] = squish(zs[curLayer][curNeuron]);
        }
      }
    }
    return { activations: activations, zs: zs };
  }

  /**
   * http://neuralnetworksanddeeplearning.com/chap2.html good reading
   * @param inputs
   * @param expectedOutputs
   */
  backProp(
    inputs: number[],
    expectedOutputs: number[],
    weightDeltas?: number[][][],
    biasDeltas?: number[][]
  ): { weightDeltas: number[][][]; biasDeltas: number[][] } {
    if (
      weightDeltas === undefined ||
      biasDeltas === undefined ||
      weightDeltas.length == 0 ||
      biasDeltas.length == 0
    ) {
      weightDeltas = [];
      biasDeltas = [];
      for (let curLayer = 0; curLayer < this.sizes.length; curLayer++) {
        weightDeltas[curLayer] = [];
        biasDeltas[curLayer] = [];
        for (let curNeuron = 0; curNeuron < this.sizes[curLayer]; curNeuron++) {
          weightDeltas[curLayer][curNeuron] = [];
          for (
            let curWeight = 0;
            curWeight < this.sizes[curLayer - 1] || 0;
            curWeight++
          ) {
            weightDeltas[curLayer][curNeuron][curWeight] = 0;
          }
          biasDeltas[curLayer][curNeuron] = 0;
        }
      }
    }
    // const startTime = Date.now();
    const dict = this.feed(inputs);
    const activations = dict["activations"],
      zs = dict["zs"];
    const errors: number[][] = [];
    // const feedTime = Date.now();
    // console.log(`feedTime: ${formatTimeString(feedTime - startTime)}`);
    for (let curLayer = this.sizes.length - 1; curLayer > 0; curLayer--) {
      //   const iterStartTime = Date.now();
      errors[curLayer] = [];
      if (curLayer == this.sizes.length - 1) {
        // Output layer errors
        for (let curNeuron = 0; curNeuron < this.sizes[curLayer]; curNeuron++) {
          const dCda =
            activations[curLayer][curNeuron] - expectedOutputs[curNeuron];
          errors[curLayer][curNeuron] =
            dCda * squishDerivative(zs[curLayer][curNeuron]);
        }
      } else {
        // Hidden layer errors
        for (let curNeuron = 0; curNeuron < this.sizes[curLayer]; curNeuron++) {
          let foreErr = 0;
          for (
            let curForeNeuron = 0;
            curForeNeuron < this.sizes[curLayer + 1];
            curForeNeuron++
          ) {
            foreErr +=
              this.weights[curLayer + 1][curForeNeuron][curNeuron] *
              errors[curLayer + 1][curForeNeuron];
          }
          errors[curLayer][curNeuron] =
            foreErr * squishDerivative(zs[curLayer][curNeuron]);
        }
      }
      //   const iterMidTime = Date.now();
      //   console.log(
      //     `iterMidTime${i}: ${formatTimeString(iterMidTime - iterStartTime)}`
      //   );
      for (let curNeuron = 0; curNeuron < this.sizes[curLayer]; curNeuron++) {
        biasDeltas[curLayer][curNeuron] -=
          errors[curLayer][curNeuron] * this.learningRate;
        for (
          let curWeight = 0;
          curWeight < this.weights[curLayer][curNeuron].length;
          curWeight++
        ) {
          const inputActiv = activations[curLayer - 1][curWeight];
          weightDeltas[curLayer][curNeuron][curWeight] -=
            errors[curLayer][curNeuron] * inputActiv * this.learningRate;
        }
      }
      //   const iterTime = Date.now();
      //   console.log(`iterTime${i}: ${formatTimeString(iterTime - iterMidTime)}`);
    }
    return { weightDeltas: weightDeltas, biasDeltas: biasDeltas };
  }
  updateNeurons(
    weightDeltas: number[][][],
    biasDeltas: number[][],
    mult: number
  ) {
    for (let curLayer = 0; curLayer < this.sizes.length; curLayer++) {
      for (let curNeuron = 0; curNeuron < this.sizes[curLayer]; curNeuron++) {
        this.biases[curLayer][curNeuron] +=
          biasDeltas[curLayer][curNeuron] * mult;
        for (
          let curWeight = 0;
          curWeight < this.weights[curLayer][curNeuron].length;
          curWeight++
        ) {
          this.weights[curLayer][curNeuron][curWeight] +=
            weightDeltas[curLayer][curNeuron][curWeight] * mult;
        }
      }
    }
  }

  train(batch: TrainingExample[]) {
    let weightDeltas: number[][][] = [] as number[][][],
      biasDeltas: number[][] = [] as number[][];
    for (const ex of batch) {
      const dict = this.backProp(
        ex.inputs,
        ex.expectedOutputs,
        weightDeltas,
        biasDeltas
      );
      weightDeltas = dict["weightDeltas"];
      biasDeltas = dict["biasDeltas"];
    }
    this.updateNeurons(weightDeltas, biasDeltas, 1 / batch.length);
  }
}
