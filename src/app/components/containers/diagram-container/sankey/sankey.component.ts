import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { sankey, sankeyLinkHorizontal, SankeyNode } from 'd3-sankey';
import { select, Selection } from 'd3-selection';

import { SankeyData, Node, Link } from '~/models';

@Component({
  selector: 'lab-sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.scss'],
})
export class SankeyComponent implements OnInit {
  _sankeyData: SankeyData;
  get sankeyData() {
    return this._sankeyData;
  }
  @Input() set sankeyData(value: SankeyData) {
    this._sankeyData = value;
    console.log(value);
    if (value.nodes.length && value.links.length) {
      this.rebuildChart();
    }
  }
  @Input() height = 400;
  @Input() width = 800;

  @Output() selectNode = new EventEmitter<any>();

  svg: Selection<any, {}, null, undefined>;

  get element() {
    return this.ref.nativeElement as HTMLElement;
  }

  constructor(private ref: ElementRef) {}

  ngOnInit(): void {}

  rebuildChart() {
    if (this.svg) {
      select('svg').remove();
    }
    this.createChart();
  }

  createChart() {
    this.svg = select(this.element)
      .append('svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('max-height', '75vh')
      .style('min-width', '40rem');

    const skLayout = sankey<Node, Link>()
      .nodeId((d) => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [1, 5],
        [this.width - 1, this.height - 5],
      ]);

    const skGraph = skLayout({
      nodes: this.sankeyData.nodes.map((d) => ({ ...d })),
      links: this.sankeyData.links.map((l) => ({ ...l })),
    });

    this.svg
      .append('g')
      .attr('stroke', '#000')
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
        this.selectNode.emit(node);
      })
      .append('title')
      .text((d) => d.name)
      .selectAll('rect');

    const link = this.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.5)
      .selectAll('g')
      .data(skGraph.links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    link
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d) => (d.source as Node).color)
      .attr('stroke-width', (d) => Math.max(1, d.width));

    link.append('title').text((d) => (d.source as Node).name);

    this.svg
      .append('g')
      .selectAll('text')
      .data(skGraph.nodes)
      .join('text')
      .attr('x', (d) => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', (d) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => (d.x0 < this.width / 2 ? 'start' : 'end'))
      .text((d) => d.name)
      .on('click', (e, d) => {
        // Typings currently incorrect: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
        const node = (d as any) as SankeyNode<Node, Link>;
        this.selectNode.emit(node);
      });
  }
}
