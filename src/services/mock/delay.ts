/** Imituoja tinklo vėlavimą, kad demonstracija atrodytų tikroviškai. */
export const delay = (ms = 350) => new Promise<void>((resolve) => setTimeout(resolve, ms));
