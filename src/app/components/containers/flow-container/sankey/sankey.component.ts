import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  SankeyNode,
  SankeyGraph,
  sankey,
  sankeyLinkHorizontal,
} from 'd3-sankey';
import { sankeyCircular } from 'd3-sankey-circular';
import { select, Selection } from 'd3-selection';

import { SankeyData, Node, Link } from '~/models';

@Component({
  selector: 'lab-sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.scss'],
})
export class SankeyComponent {
  _sankeyData: SankeyData;
  get sankeyData(): SankeyData {
    return this._sankeyData;
  }
  @Input() set sankeyData(value: SankeyData) {
    this._sankeyData = value;
    this.rebuildChart();
  }

  @Output() selectNode = new EventEmitter<string>();

  height = window.innerHeight * 0.75;
  svg: Selection<any, {}, null, undefined>;

  get linkedNodes(): Node[] {
    return this.sankeyData.nodes.filter((n) =>
      this.sankeyData.links.some((l) => l.source === n.id || l.target === n.id)
    );
  }

  constructor(private ref: ElementRef<HTMLElement>) {}

  rebuildChart(): void {
    if (this.svg) {
      select('svg').remove();
    }

    if (this.sankeyData.nodes.length && this.sankeyData.links.length) {
      this.createChart();
    }
  }

  getLayout(
    circular: boolean,
    width: number,
    height: number
  ): SankeyGraph<Node, Link> {
    const fn = circular ? sankeyCircular : sankey;
    const skLayout = fn()
      .nodeId((d) => d.id)
      .nodeWidth(32)
      .nodePadding(8)
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ]);

    return skLayout({
      nodes: this.linkedNodes.map((d) => ({ ...d })),
      links: this.sankeyData.links.map((l) => ({ ...l })),
    });
  }

  createChart(): void {
    let circular = true;
    let skGraph = this.getLayout(true, 800, this.height);

    if (!skGraph.nodes.some((n: any) => n.partOfCycle === true)) {
      // No circular references, use built in sankey generator
      circular = false;
      skGraph = this.getLayout(circular, 800, this.height);
    }

    const columns = Math.max(...skGraph.nodes.map((n) => n.depth));
    const width = (columns + 1) * 32 + columns * 32 * 6;
    const height = Math.min(this.height, width * 0.75);
    skGraph = this.getLayout(circular, width, height);

    this.svg = select(this.ref.nativeElement)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('width', `${width}px`)
      .attr('height', `${height}px`)
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Draw linkages (draw first so rects are drawn over them)
    const link = this.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.6)
      .style('will-change', 'opacity')
      .selectAll('g')
      .data(skGraph.links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    link
      .append('path')
      .attr('id', (l) => `${l.index}`)
      .attr(
        'd',
        circular ? (d): string => (d as any).path : sankeyLinkHorizontal()
      )
      .attr('stroke', (l) => l.color)
      .attr('stroke-width', (l) => Math.max(1, l.width));

    link.append('title').text((l) => l.name);
    this.svg
      .append('g')
      .selectAll('text')
      .data(skGraph.links)
      .join('text')
      .append('textPath')
      .attr('startOffset', '4px')
      .attr('href', (l) => `#${l.index}`)
      .text((l) => `${l.dispValue} ${l.name}`);

    // Draw rects for nodes
    this.svg
      .append('g')
      .attr('stroke', 'var(--color-black)')
      .selectAll('rect')
      .data(skGraph.nodes)
      .join('rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('fill', (d) => d.color)
      .on('click', (e, d) => {
        // Typings currently incorrect: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
        const node = (d as any) as SankeyNode<Node, Link>;
        this.selectNode.emit(node.id);
      })
      .append('title')
      .text((d) => d.name);

    // Draw icons (for rect height >= 16px)
    this.svg
      .append('g')
      .selectAll('svg')
      .data(skGraph.nodes.filter((d) => d.y1 - d.y0 >= 16))
      .join('svg')
      .attr('viewBox', (d) => d.viewBox)
      .attr('width', (d) => Math.min(30, d.y1 - d.y0 - 2))
      .attr('height', (d) => Math.min(30, d.y1 - d.y0 - 2))
      .attr('x', (d) => (d.x1 + d.x0) / 2 - Math.min(30, d.y1 - d.y0 - 2) / 2)
      .attr('y', (d) => (d.y1 + d.y0) / 2 - Math.min(30, d.y1 - d.y0 - 2) / 2)
      .style('pointer-events', 'none')
      .append('image')
      .attr('href', (d) => d.href);
  }
}
