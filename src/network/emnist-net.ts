import EmnistImage from "@/data/emnist-image";
import { Network, TrainingExample } from "./network";

function oneHotOutput(outputClass: number): number[] {
  const out = [];
  for (let i = 0; i < 47; i++) {
    out.push(i == outputClass ? 1 : 0);
  }
  return out;
}

export class EmnistNet extends Network {
  emnist: EmnistImage[] | undefined;

  constructor() {
    super([784, 16, 16, 46], 1);
    this.emnist = undefined;
  }

  loadEmnist() {
    import("@/data/emnist_train_data.json").then(({ default: module }) => {
      this.emnist = module;
    });
  }
  runNBatches(n: number, batchSize: number) {
    for (let i = 0; i < n; i++) {
      console.log(`Batch number: ${i}`);
      const timeIn = Date.now();
      this.runMiniBatch(batchSize);
      const timeLastBatch = Date.now() - timeIn;
      console.log(
        `Remaining time (ish): ${
          ((batchSize - (i + 1)) * timeLastBatch) / 1000
        }s`
      );
    }
  }
  runMiniBatch(n: number) {
    this.train(this.generateMiniBatch(n));
  }
  getPredictedAccuracy() {
    console.log("Predicting");
    const batch = this.generateMiniBatch(100);
    let corrects = 0;
    for (let i = 0; i < batch.length; i++) {
      console.log(i);
      this.feed(batch[i].inputs);
      if (batch[i].expectedOutputs[this.getHottestOutput()] == 1) {
        corrects += 1;
      }
    }
    return corrects / batch.length;
  }
  getHottestOutput(): number {
    const outputs = this.neurons[this.neurons.length - 1];
    let max = 0;
    for (let i = 0; i < outputs.length; i++) {
      const outI = outputs[i].activation,
        outM = outputs[max].activation;
      if (outI === undefined || outM === undefined) {
        throw new EvalError("Activation not defined yet!");
      }
      if (outI > outM) {
        max = i;
      }
    }
    return max;
  }
  generateMiniBatch(size: number): TrainingExample[] {
    const result: TrainingExample[] = [];
    const indexes: number[] = [];
    while (result.length < size) {
      if (!this.emnist) {
        throw new Error("Data set not loaded");
      }
      const x = Math.floor(Math.random() * this.emnist.length);
      if (!(x in indexes)) {
        indexes.push(x);
        result.push({
          inputs: this.emnist[x].data,
          expectedOutputs: oneHotOutput(this.emnist[x].label),
        });
      }
    }
    return result;
  }
}
