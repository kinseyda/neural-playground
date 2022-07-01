import EmnistImage from "@/data/emnist-image";
import { Network, TrainingExample } from "./network";
import { formatTimeString } from "@/format";

function oneHotOutput(outputClass: number): number[] {
  const out = [];
  for (let i = 0; i < 47; i++) {
    out.push(i == outputClass ? 1 : 0);
  }
  return out;
}

export class EmnistNet extends Network {
  emnist: EmnistImage[] | undefined;
  testEmnist: EmnistImage[] | undefined;

  constructor() {
    super([784, 16, 16, 10], 1);
    this.emnist = undefined;
  }

  loadEmnist() {
    import("@/data/digits_train_data.json").then(({ default: module }) => {
      this.emnist = module as EmnistImage[];
    });
    import("@/data/digits_test_data.json").then(({ default: module }) => {
      this.testEmnist = module as EmnistImage[];
    });
  }

  runNBatches(n: number, batchSize: number) {
    for (let i = 0; i < n; i++) {
      console.log(`Batch number: ${i}/${n}`);
      const timeIn = Date.now();
      this.runMiniBatch(batchSize);
      const timeLastBatch = Date.now() - timeIn;
      const msRemaining = (n - (i + 1)) * timeLastBatch;
      console.log(`Batch ${i} took ${formatTimeString(timeLastBatch)}`);
      console.log(`Remaining: ${formatTimeString(msRemaining)}`);
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
      this.feed(batch[i].inputs);
      if (batch[i].expectedOutputs[this.getHottestOutput()] == 1) {
        corrects += 1;
        console.log(
          `Correct! ${i}, label=${batch[i].expectedOutputs.indexOf(1)}`
        );
      }
    }
    return corrects / batch.length;
  }
  getHottestOutput(): number {
    return this.outputActivations.indexOf(Math.max(...this.outputActivations));
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
