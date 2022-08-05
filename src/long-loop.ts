/**
 * Function that simulates a basic for-loop, but lets the thread handle UI stuff
 *  on a user defined interval.
 * @param size - Limit of loop eg `for (let index = 0; index < size; index++)`
 * @param minTimeBetweenBreaks - The loop will add the next iteration to the
 * message queue instead of running immediately after it has been this long.
 * @param funcParams - A dictionary that is passed to the loopContent and
 * onComplete functions, can be used to store things normally inaccessible to
 * inner functions (like the value of `this` for instance). The value
 * `returnValue` is used for the resolve of loops promise.
 * @param loopContent - The function that is called with every iteration of the
 * loop.
 * @param onComplete - A function called just before the loop resolves. Useful
 * for setting the value of `funcParams["returnValue"]` appropriately
 * @returns - A promise for the end of the loop, which will resolve with value
 * `funcParams["returnValue"]`.
 */
export async function longForLoop(
  size: number,
  minTimeBetweenBreaks: number,
  funcParams: Record<string, unknown>,
  loopContent: (index: number, params: typeof funcParams) => void,
  onComplete?: (params: typeof funcParams) => void
): Promise<unknown> {
  if (size < 0) {
    throw new RangeError(`Long-For-Loop length of ${size} not valid!`);
  }
  if (size == 0) {
    return new Promise((resolve) => {
      resolve(funcParams["returnValue"]);
    });
  }

  return new Promise((resolve) => {
    let index = 0;
    let lastBreak = Date.now();

    function doThing() {
      loopContent(index, funcParams);
      index++;
      if (index < size) {
        if (Date.now() - lastBreak > minTimeBetweenBreaks) {
          setTimeout(doThing, 0);
          lastBreak = Date.now();
        } else {
          doThing();
        }
      } else {
        if (onComplete) {
          onComplete(funcParams);
        }
        resolve(funcParams["returnValue"]);
      }
    }
    doThing();
  });
}
