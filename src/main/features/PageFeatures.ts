import * as la from 'sylvester';

export class PageFeatures {
  public nBlocks: number = 0;
  constructor(
    public blockFeatures: la.Matrix,
    public blockFeatureLabels: string[],
    public edgeFeatures: la.Matrix,
    public edgeFeatureLabels: string[]
  ) {
    if (this.blockFeatures[0] && this.edgeFeatures[0] && this.blockFeatures[0].length === this.edgeFeatures[0].length + 1) {
      console.log("There should be one more block feature than edge features");
    }
    this.nBlocks = this.blockFeatures.cols;
  }

  public toString(): string {
    const blockFeatureLines = this.blockFeatureLabels
      .map((label, index) => `${label}  ${this.blockFeatures.row(index).inspect()}`)
      .join('\n');

    const edgeFeatureLines = this.edgeFeatureLabels
      .map((label, index) => `${label}  ${this.edgeFeatures.row(index).inspect()}`)
      .join('\n');

    return `
            ++++++++++++++++++++
            ++ Block features ++
            ++++++++++++++++++++
            ${blockFeatureLines}

            ++++++++++++++++++++
            ++ Edge features  ++
            ++++++++++++++++++++
            ${edgeFeatureLines}
            `;

  }
}