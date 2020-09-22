import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ResizeObserverEntry } from '@juggle/resize-observer';
import { path } from 'd3-path';
import { sankey, SankeyNode, SankeyLink, SankeyNodeMinimal } from 'd3-sankey';
import { select, Selection } from 'd3-selection';
import {
  NgResizeObserver,
  ngResizeObserverProviders,
} from 'ng-resize-observer';

import { SankeyData, Node, Link } from '~/models';

@Component({
  selector: 'lab-sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.scss'],
  providers: [...ngResizeObserverProviders],
})
export class SankeyComponent implements OnInit {
  _sankeyData: SankeyData;
  get sankeyData() {
    return this._sankeyData;
  }
  @Input() set sankeyData(value: SankeyData) {
    this._sankeyData = value;
    this.rebuildChart();
  }

  @Output() selectNode = new EventEmitter<string>();

  width = 800;
  height = 400;
  svg: Selection<any, {}, null, undefined>;

  get element() {
    return this.ref.nativeElement as HTMLElement;
  }

  constructor(private ref: ElementRef, private resize$: NgResizeObserver) {}

  ngOnInit(): void {
    this.resize$.subscribe((entry) => this.handleResize(entry));
  }

  handleResize(entry: ResizeObserverEntry) {
    const w = entry.contentRect.width;
    const h = entry.contentRect.height;
    if (w && h && w / h !== this.width / this.height) {
      this.width = entry.contentRect.width;
      this.height = entry.contentRect.height;
      this.rebuildChart();
    }
  }

  rebuildChart() {
    if (this.svg) {
      select('svg').remove();
    }

    if (this.sankeyData.nodes.length && this.sankeyData.links.length) {
      this.createChart();
    }
  }

  createChart() {
    this.svg = select(this.element)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('max-height', '75vh');

    const skLayout = sankey<Node, Link>()
      .nodeId((d) => d.id)
      .nodeWidth(32)
      .nodePadding(10)
      .extent([
        [1, 5],
        [this.width - 1, this.height - 5],
      ]);

    const skGraph = skLayout({
      nodes: this.sankeyData.nodes.map((d) => ({ ...d })),
      links: this.sankeyData.links.map((l) => ({ ...l })),
    });

    const link = this.svg
      .append('g')
      .attr('fill-opacity', 0.5)
      .selectAll('g')
      .data(skGraph.links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    link
      .append('path')
      .attr('d', this.sankeyLinkPath)
      .attr('fill', (d) => (d.source as Node).color)
      .attr('stroke-width', (d) => Math.max(1, d.width));

    link.append('title').text((d) => (d.source as Node).name);

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
        this.selectNode.emit(node.id);
      })
      .append('title')
      .text((d) => d.name);

    this.svg
      .append('g')
      .selectAll('svg')
      .data(skGraph.nodes.filter((d) => d.y1 - d.y0 > 16))
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

  /**
   * Use custom function in place of d3.sankeyLinkHorizontal, see:
   * https://observablehq.com/@enjalot/weird-sankey-links
   */
  sankeyLinkPath(link: SankeyLink<Node, Link>) {
    const offset = 0;
    const t = link.source;
    const sx = (link.source as SankeyNodeMinimal<Node, Link>).x1;
    const tx = (link.target as SankeyNodeMinimal<Node, Link>).x0 + 1;
    const sy0 = link.y0 - link.width / 2;
    const sy1 = link.y0 + link.width / 2;
    const ty0 = link.y1 - link.width / 2;
    const ty1 = link.y1 + link.width / 2;

    const halfx = (tx - sx) / 2;

    const lPath = path();
    lPath.moveTo(sx, sy0);

    let cpx1 = sx + halfx;
    let cpy1 = sy0 + offset;
    let cpx2 = sx + halfx;
    let cpy2 = ty0 - offset;
    lPath.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0);
    lPath.lineTo(tx, ty1);

    cpx1 = sx + halfx;
    cpy1 = ty1 - offset;
    cpx2 = sx + halfx;
    cpy2 = sy1 + offset;
    lPath.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx, sy1);
    lPath.lineTo(sx, sy0);
    return lPath.toString();
  }
}
