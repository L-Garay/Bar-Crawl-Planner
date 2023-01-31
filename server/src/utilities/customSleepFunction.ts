const Sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export default Sleep;
